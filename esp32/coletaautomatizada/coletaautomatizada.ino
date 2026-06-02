#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebServer.h>

// ==========================================
// CONEXAO DE DADOS PARA O SUPERVISORIO
// ==========================================
const char* NOME_REDE_DADOS = "Caminhaozinho-ESP32";
const char* SENHA_REDE_DADOS = "12345678";

WebServer servidorDados(80);

unsigned long inicioFuncionamento = 0;
int ultimaCorIdentificada = 0;
bool cargaAtual = false;
int ultimaLeituraIR_Esq = LOW;
int ultimaLeituraIR_Dir = LOW;
int lixeirasColetadas = 0;
String estadoAtual = "Em rota";
String localizacaoAtual = "Caminho das casas";
String ultimoEvento = "Sistema iniciado";

// ==========================================
// CONFIGURACAO DOS PINOS E MOTORES
// ==========================================
const int IN1 = 25;
const int IN2 = 26;
const int IN3 = 18;
const int IN4 = 19;

const int pinoOmbro = 22;
const int pinoCotovelo = 21;
const int pinoGarra = 13;
const int pinoDirecao = 4;
const int pinoCacamba = 2;

const int pinoIR_Esq = 34;
const int pinoIR_Dir = 35;

const int pinoS2 = 23;
const int pinoS3 = 15;
const int pinoOUT = 5;

// ==========================================
// LIMITES DOS SERVOS
// ==========================================
const int GARRA_ABERTA = 0;
const int GARRA_FECHADA = 160;

const int COTOVELO_ALTO = 90;
const int COTOVELO_MEIO = 150;
const int COTOVELO_BAIXO = 180;

const int OMBRO_ESQ = 150;
const int OMBRO_RETO = 140;
const int OMBRO_DIR = 130;

const int DIR_ESQ = 70;
const int DIR_RETO = 100;
const int DIR_DIR = 120;

const int CACAMBA_BAIXA = 180;
const int CACAMBA_ALTA = 90;

const int VELOCIDADE_BRACO = 20;

Servo servoOmbro;
Servo servoCotovelo;
Servo servoGarra;
Servo servoDirecao;
Servo servoCacamba;

int contadorParadas = 0;
int pulsoVermelho = 0, pulsoVerde = 0, pulsoAzul = 0;

void iniciarConexaoDados();
void processarConexaoDados();
void aguardarComServidor(int tempoMs);
void enviarDadosStatus();
void enviarRotaNaoEncontrada();
String montarJsonDados();
String textoCor(int cor);
String textoEstadoLinha();
void frente();
void pararMotores();
void moverServoGradual(Servo &motor, int inicio, int fim);
int lerCor();
void rotinaColeta();
void rotinaDespejoFinal();

void setup() {
  Serial.begin(115200);

  inicioFuncionamento = millis();
  iniciarConexaoDados();

  // 1. LIGA MOTORES DE TRACAO DC
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pararMotores();

  // 2. LIGA SENSORES INFRAVERMELHOS
  pinMode(pinoIR_Esq, INPUT);
  pinMode(pinoIR_Dir, INPUT);

  // Configura os timers do PWM
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);

  // 3. LIGA A DIRECAO JUNTO COM O SISTEMA
  servoDirecao.attach(pinoDirecao, 500, 2400);
  servoDirecao.write(DIR_RETO);

  // Braco mecanico, cacamba e sensor de cor comecam desativados
  aguardarComServidor(2000);
}

void loop() {
  processarConexaoDados();

  int leituraEsq = digitalRead(pinoIR_Esq);
  int leituraDir = digitalRead(pinoIR_Dir);
  ultimaLeituraIR_Esq = leituraEsq;
  ultimaLeituraIR_Dir = leituraDir;

  // ---------------------------------------------------------
  // SEGUIDOR DE LINHA (Logica: LOW = Pista Preta | HIGH = Linha Branca)
  // ---------------------------------------------------------
  if (leituraEsq == LOW && leituraDir == LOW) {
    // Ambos na pista preta: anda reto
    servoDirecao.write(DIR_RETO);
    frente();
  }
  else if (leituraEsq == HIGH && leituraDir == LOW) {
    // Sensor esquerdo detectou branco: corrige para a esquerda
    servoDirecao.write(DIR_ESQ);
    frente();
  }
  else if (leituraEsq == LOW && leituraDir == HIGH) {
    // Sensor direito detectou branco: corrige para a direita
    servoDirecao.write(DIR_DIR);
    frente();
  }
  else if (leituraEsq == HIGH && leituraDir == HIGH) {
    // Ambos em HIGH: Cruzamento / Marcacao branca transversal detectada
    pararMotores();
    aguardarComServidor(1000);

    contadorParadas++;

    if (contadorParadas == 1 || contadorParadas == 2) {
      rotinaColeta();
      frente();
      aguardarComServidor(800); // Avanca para sair da marcacao branca
    }
    else if (contadorParadas == 3) {
      rotinaDespejoFinal();
      contadorParadas = 0;
      frente();
      aguardarComServidor(800);
    }
  }
}

// ==========================================
// FUNCOES DA CONEXAO DE DADOS
// O app le: http://192.168.4.1/status
// ==========================================
void iniciarConexaoDados() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(NOME_REDE_DADOS, SENHA_REDE_DADOS);

  servidorDados.on("/status", HTTP_GET, enviarDadosStatus);
  servidorDados.onNotFound(enviarRotaNaoEncontrada);
  servidorDados.begin();

  Serial.print("Rede do ESP32 criada: ");
  Serial.println(NOME_REDE_DADOS);
  Serial.print("IP para o app: ");
  Serial.println(WiFi.softAPIP());
}

void processarConexaoDados() {
  servidorDados.handleClient();
}

void aguardarComServidor(int tempoMs) {
  unsigned long inicioEspera = millis();

  while (millis() - inicioEspera < tempoMs) {
    processarConexaoDados();
    delay(5);
  }
}

void enviarDadosStatus() {
  servidorDados.sendHeader("Access-Control-Allow-Origin", "*");
  servidorDados.send(200, "application/json", montarJsonDados());
}

void enviarRotaNaoEncontrada() {
  servidorDados.sendHeader("Access-Control-Allow-Origin", "*");
  servidorDados.send(404, "application/json", "{\"erro\":\"rota_nao_encontrada\"}");
}

String montarJsonDados() {
  int uptimeMinutes = (millis() - inicioFuncionamento) / 60000;
  String rotaId = estadoAtual == "Descarregando" ? "Rota 2" : "Rota 1";
  String objetivoRota = rotaId == "Rota 2" ? "Jogar lixo no centro de lixo" : "Pegar lixo";
  String cargaTexto = cargaAtual ? "Com lixo" : "Vazio";

  String json = "{";
  json += "\"connectionStatus\":\"online\",";
  json += "\"state\":\"" + estadoAtual + "\",";
  json += "\"route\":{\"id\":\"" + rotaId + "\",\"purpose\":\"" + objetivoRota + "\"},";
  json += "\"load\":\"" + cargaTexto + "\",";
  json += "\"location\":\"" + localizacaoAtual + "\",";
  json += "\"irLeft\":" + String(ultimaLeituraIR_Esq) + ",";
  json += "\"irRight\":" + String(ultimaLeituraIR_Dir) + ",";
  json += "\"lineStatus\":\"" + textoEstadoLinha() + "\",";
  json += "\"redPulse\":" + String(pulsoVermelho) + ",";
  json += "\"greenPulse\":" + String(pulsoVerde) + ",";
  json += "\"bluePulse\":" + String(pulsoAzul) + ",";
  json += "\"colorCode\":" + String(ultimaCorIdentificada) + ",";
  json += "\"detectedColor\":\"" + textoCor(ultimaCorIdentificada) + "\",";
  json += "\"trashBinsCollected\":" + String(lixeirasColetadas) + ",";
  json += "\"stopCount\":" + String(contadorParadas) + ",";
  json += "\"uptimeMinutes\":" + String(uptimeMinutes) + ",";
  json += "\"lastEvent\":\"" + ultimoEvento + "\"";
  json += "}";

  return json;
}

String textoCor(int cor) {
  if (cor == 1) return "Azul";
  if (cor == 2) return "Amarelo";
  if (cor == 3) return "Verde";

  return "Indeterminado";
}

String textoEstadoLinha() {
  if (ultimaLeituraIR_Esq == LOW && ultimaLeituraIR_Dir == LOW) {
    return "Seguindo linha";
  }

  if (ultimaLeituraIR_Esq == HIGH && ultimaLeituraIR_Dir == LOW) {
    return "Corrigindo esquerda";
  }

  if (ultimaLeituraIR_Esq == LOW && ultimaLeituraIR_Dir == HIGH) {
    return "Corrigindo direita";
  }

  return "Parada detectada";
}

// ==========================================
// FUNCOES DE TRACAO E MOVIMENTO LENTO
// ==========================================
void frente() {
  estadoAtual = "Em rota";

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void pararMotores() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

void moverServoGradual(Servo &motor, int inicio, int fim) {
  if (inicio < fim) {
    for (int pos = inicio; pos <= fim; pos++) {
      motor.write(pos);
      aguardarComServidor(VELOCIDADE_BRACO);
    }
  } else {
    for (int pos = inicio; pos >= fim; pos--) {
      motor.write(pos);
      aguardarComServidor(VELOCIDADE_BRACO);
    }
  }
}

// ==========================================
// LEITURA DO SENSOR DE COR (Ativacao por demanda)
// ==========================================
int lerCor() {
  pinMode(pinoS2, OUTPUT);
  pinMode(pinoS3, OUTPUT);
  pinMode(pinoOUT, INPUT);

  digitalWrite(pinoS2, LOW);   digitalWrite(pinoS3, LOW);
  pulsoVermelho = pulseIn(pinoOUT, LOW); aguardarComServidor(50);
  digitalWrite(pinoS2, HIGH);  digitalWrite(pinoS3, HIGH);
  pulsoVerde = pulseIn(pinoOUT, LOW); aguardarComServidor(50);
  digitalWrite(pinoS2, LOW);   digitalWrite(pinoS3, HIGH);
  pulsoAzul = pulseIn(pinoOUT, LOW); aguardarComServidor(50);

  pinMode(pinoS2, INPUT);
  pinMode(pinoS3, INPUT);

  if (pulsoVerde > 10000 && pulsoAzul > 10000) return 0;
  if (pulsoVermelho > 10000 && pulsoVerde < 10) return 1;
  if (pulsoVerde > 10000 && pulsoVermelho < 10 && pulsoAzul < 10) return 2;
  if (pulsoVerde > 10000 && pulsoVermelho >= 10 && pulsoVermelho < 100) return 3;

  return 0;
}

// ==========================================
// ROTINAS DE COLETA E DESPEJO
// ==========================================
void rotinaColeta() {
  estadoAtual = "Coletando";
  localizacaoAtual = "Caminho das casas";
  ultimoEvento = "Iniciando coleta";

  servoOmbro.attach(pinoOmbro, 500, 2400);
  servoCotovelo.attach(pinoCotovelo, 500, 2400);
  servoGarra.attach(pinoGarra, 500, 2400);

  servoOmbro.write(OMBRO_RETO);
  servoCotovelo.write(COTOVELO_ALTO);
  servoGarra.write(GARRA_ABERTA);
  aguardarComServidor(200);

  moverServoGradual(servoCotovelo, COTOVELO_ALTO, COTOVELO_BAIXO);
  aguardarComServidor(500);

  int corIdentificada = lerCor();
  ultimaCorIdentificada = corIdentificada;

  moverServoGradual(servoGarra, GARRA_ABERTA, GARRA_FECHADA);
  aguardarComServidor(500);

  moverServoGradual(servoCotovelo, COTOVELO_BAIXO, COTOVELO_MEIO);
  aguardarComServidor(500);

  int alvoOmbro = OMBRO_RETO;
  if (corIdentificada == 1) alvoOmbro = OMBRO_ESQ;
  else if (corIdentificada == 2) alvoOmbro = OMBRO_RETO;
  else if (corIdentificada == 3) alvoOmbro = OMBRO_DIR;

  moverServoGradual(servoOmbro, OMBRO_RETO, alvoOmbro);
  aguardarComServidor(500);

  moverServoGradual(servoCotovelo, COTOVELO_MEIO, COTOVELO_ALTO);
  aguardarComServidor(1000);

  moverServoGradual(servoCotovelo, COTOVELO_ALTO, COTOVELO_BAIXO);
  aguardarComServidor(500);

  moverServoGradual(servoGarra, GARRA_FECHADA, GARRA_ABERTA);
  aguardarComServidor(500);

  moverServoGradual(servoCotovelo, COTOVELO_BAIXO, COTOVELO_ALTO);
  aguardarComServidor(500);

  moverServoGradual(servoOmbro, alvoOmbro, OMBRO_RETO);
  aguardarComServidor(500);

  servoOmbro.detach();
  servoCotovelo.detach();
  servoGarra.detach();

  lixeirasColetadas++;
  cargaAtual = true;
  localizacaoAtual = "Caminho das casas";
  ultimoEvento = "Lixo coletado";
  estadoAtual = "Em rota";
}

void rotinaDespejoFinal() {
  estadoAtual = "Descarregando";
  localizacaoAtual = "Centro de lixo";
  ultimoEvento = "Despejando carga no centro de lixo";

  servoCacamba.attach(pinoCacamba, 500, 2400);
  servoCacamba.write(CACAMBA_BAIXA);
  aguardarComServidor(200);

  moverServoGradual(servoCacamba, CACAMBA_BAIXA, CACAMBA_ALTA);
  aguardarComServidor(3000);

  moverServoGradual(servoCacamba, CACAMBA_ALTA, CACAMBA_BAIXA);
  aguardarComServidor(500);

  servoCacamba.detach();

  cargaAtual = false;
  localizacaoAtual = "Centro de lixo";
  ultimaCorIdentificada = 0;
  ultimoEvento = "Carga entregue no centro de lixo";
  estadoAtual = "Em rota";
}
