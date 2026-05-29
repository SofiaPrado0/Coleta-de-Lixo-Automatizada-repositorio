#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebServer.h>

// ==========================================
// CONEXAO DE DADOS PARA O APP
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
// LIMITES DOS SERVOS (Conforme solicitado)
// ==========================================
const int GARRA_ABERTA = 0;
const int GARRA_FECHADA = 160;

const int COTOVELO_ALTO = 90;
const int COTOVELO_MEIO = 150; // Posicao para girar o ombro sem arrastar no chao
const int COTOVELO_BAIXO = 180;

const int OMBRO_ESQ = 150;
const int OMBRO_RETO = 140;
const int OMBRO_DIR = 130;

const int DIR_ESQ = 70;
const int DIR_RETO = 100;
const int DIR_DIR = 120;

const int CACAMBA_BAIXA = 180;
const int CACAMBA_ALTA = 90;

const int VELOCIDADE_BRACO = 20; // Tempo em ms entre cada grau do servo

Servo servoOmbro;
Servo servoCotovelo;
Servo servoGarra;
Servo servoDirecao;
Servo servoCacamba;

int contadorParadas = 0;
int pulsoVermelho = 0, pulsoVerde = 0, pulsoAzul = 0;

void setup() {
  Serial.begin(115200);

  inicioFuncionamento = millis();
  iniciarConexaoDados();

  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pararMotores();

  pinMode(pinoIR_Esq, INPUT);
  pinMode(pinoIR_Dir, INPUT);

  pinMode(pinoS2, OUTPUT);
  pinMode(pinoS3, OUTPUT);
  pinMode(pinoOUT, INPUT);

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);

  servoOmbro.attach(pinoOmbro, 500, 2400);
  servoCotovelo.attach(pinoCotovelo, 500, 2400);
  servoGarra.attach(pinoGarra, 500, 2400);
  servoDirecao.attach(pinoDirecao, 500, 2400);
  servoCacamba.attach(pinoCacamba, 500, 2400);

  // Posicoes Iniciais
  servoOmbro.write(OMBRO_RETO);
  servoCotovelo.write(COTOVELO_ALTO);
  servoGarra.write(GARRA_ABERTA);
  servoDirecao.write(DIR_RETO);
  servoCacamba.write(CACAMBA_BAIXA);

  aguardarComServidor(2000);
}

void loop() {
  processarConexaoDados();

  int leituraEsq = digitalRead(pinoIR_Esq);
  int leituraDir = digitalRead(pinoIR_Dir);
  ultimaLeituraIR_Esq = leituraEsq;
  ultimaLeituraIR_Dir = leituraDir;

  // ---------------------------------------------------------
  // SEGUIDOR DE LINHA
  // ---------------------------------------------------------
  if (leituraEsq == LOW && leituraDir == LOW) {
    servoDirecao.write(DIR_RETO);
    frente();
  }
  else if (leituraEsq == HIGH && leituraDir == LOW) {
    servoDirecao.write(DIR_ESQ);
    frente();
  }
  else if (leituraEsq == LOW && leituraDir == HIGH) {
    servoDirecao.write(DIR_DIR);
    frente();
  }
  else if (leituraEsq == HIGH && leituraDir == HIGH) {
    // MARCACAO DE PARADA DETECTADA
    pararMotores();
    aguardarComServidor(1000);

    contadorParadas++;

    if (contadorParadas == 1 || contadorParadas == 2) {
      rotinaColeta();
      frente();
      aguardarComServidor(800); // Passa reto pela marcacao para nao ler duas vezes
    }
    else if (contadorParadas == 3) {
      rotinaDespejoFinal();
      contadorParadas = 0; // Reseta para continuar o loop infinito
      frente();
      aguardarComServidor(800);
    }
  }
}

// ==========================================
// FUNCAO NOVA: CONEXAO DOS DADOS
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
// LEITURA DO SENSOR DE COR
// Retorna: 1 (Azul), 2 (Amarelo), 3 (Verde), 0 (Erro)
// ==========================================
int lerCor() {
  digitalWrite(pinoS2, LOW);   digitalWrite(pinoS3, LOW);
  pulsoVermelho = pulseIn(pinoOUT, LOW); delay(50);
  digitalWrite(pinoS2, HIGH);  digitalWrite(pinoS3, HIGH);
  pulsoVerde = pulseIn(pinoOUT, LOW); delay(50);
  digitalWrite(pinoS2, LOW);   digitalWrite(pinoS3, HIGH);
  pulsoAzul = pulseIn(pinoOUT, LOW); delay(50);

  if (pulsoVerde > 10000 && pulsoAzul > 10000) return 0; // Vazio/Preto
  if (pulsoVermelho > 10000 && pulsoVerde < 10) return 1; // Azul
  if (pulsoVerde > 10000 && pulsoVermelho < 10 && pulsoAzul < 10) return 2; // Amarelo
  if (pulsoVerde > 10000 && pulsoVermelho >= 10 && pulsoVermelho < 100) return 3; // Verde

  return 0; // Indeterminado
}

// ==========================================
// ROTINAS DE COLETA E DESPEJO
// ==========================================
void rotinaColeta() {
  estadoAtual = "Coletando";
  localizacaoAtual = "Caminho das casas";
  ultimoEvento = "Iniciando coleta";

  // 1. Baixar o braco ate o chao
  moverServoGradual(servoCotovelo, COTOVELO_ALTO, COTOVELO_BAIXO);
  aguardarComServidor(500);

  // 2. Ler a cor da lixeira
  int corIdentificada = lerCor();
  ultimaCorIdentificada = corIdentificada;

  // 3. Fechar a garra
  moverServoGradual(servoGarra, GARRA_ABERTA, GARRA_FECHADA);
  aguardarComServidor(500);

  // 4. Levantar um pouco (sair do chao)
  moverServoGradual(servoCotovelo, COTOVELO_BAIXO, COTOVELO_MEIO);
  aguardarComServidor(500);

  // 5. Girar ombro para a cacamba correspondente
  int alvoOmbro = OMBRO_RETO; // Padrao
  if (corIdentificada == 1) alvoOmbro = OMBRO_ESQ;      // Azul -> Cacamba Esquerda
  else if (corIdentificada == 2) alvoOmbro = OMBRO_RETO; // Amarelo -> Cacamba Central
  else if (corIdentificada == 3) alvoOmbro = OMBRO_DIR;  // Verde -> Cacamba Direita

  moverServoGradual(servoOmbro, OMBRO_RETO, alvoOmbro);
  aguardarComServidor(500);

  // 6. Levantar o braco para o lixo cair na cacamba
  moverServoGradual(servoCotovelo, COTOVELO_MEIO, COTOVELO_ALTO);
  aguardarComServidor(1000); // Tempo para o lixo cair

  // 7. Baixar o braco novamente ate o chao
  moverServoGradual(servoCotovelo, COTOVELO_ALTO, COTOVELO_BAIXO);
  aguardarComServidor(500);

  // 8. Abrir a garra para soltar a lixeira
  moverServoGradual(servoGarra, GARRA_FECHADA, GARRA_ABERTA);
  aguardarComServidor(500);

  // 9. Levantar o braco para a posicao inicial
  moverServoGradual(servoCotovelo, COTOVELO_BAIXO, COTOVELO_ALTO);
  aguardarComServidor(500);

  // 10. Voltar o ombro para o centro
  moverServoGradual(servoOmbro, alvoOmbro, OMBRO_RETO);
  aguardarComServidor(500);

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

  // Gira a cacamba para despejar (180 para 90)
  moverServoGradual(servoCacamba, CACAMBA_BAIXA, CACAMBA_ALTA);
  aguardarComServidor(3000); // Aguarda o lixo cair

  // Retorna a cacamba para a posicao normal (90 para 180)
  moverServoGradual(servoCacamba, CACAMBA_ALTA, CACAMBA_BAIXA);
  aguardarComServidor(1000);

  cargaAtual = false;
  localizacaoAtual = "Centro de lixo";
  ultimaCorIdentificada = 0;
  ultimoEvento = "Carga entregue no centro de lixo";
  estadoAtual = "Em rota";
}
