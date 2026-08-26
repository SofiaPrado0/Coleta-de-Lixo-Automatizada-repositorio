# Caminhãozinho de Lixo - Supervisório Mobile e Web

Aplicativo em React Native (Expo) criado para o projeto escolar de sustentabilidade. O sistema recebe e exibe dados reais do ESP32 embarcado no carrinho de lixo seletivo, apresentando os dados através de um dashboard moderno e temático.

O supervisório se conecta ao ESP32 via rede Wi-Fi local para leitura de dados. Caso o ESP32 não esteja conectado ou não responda, o app fica offline aguardando a conexão, mantendo a interface interativa.

## Novidades Visuais e Funcionalidades

O projeto passou por um redesenho completo para refletir a temática de sustentabilidade e coleta inteligente:
- **Temas Sustentáveis**: 4 paletas de cores disponíveis (Floresta, Oceano, Solar e Terra).
- **Modo Web**: O dashboard agora pode ser acessado pelo navegador, facilitando apresentações na maquete.
- **Agenda de Coletas**: Adição de uma seção ilustrativa (mockada) mostrando a "Próxima coleta na sua rua" e um calendário semanal para demonstrar a aplicação do aplicativo na vida real de uma cidade inteligente.

## Dados exibidos

O app exibe os dados lidos ou calculados pelo código embarcado no ESP32:

- Estado atual da rotina
- Rota atual (Destino)
- Carga inferida pelo fim da rotina de coleta/despejo
- Leituras dos sensores IR (linha)
- Cor identificada a partir dos pulsos (Sensor RGB)
- Quantidade de lixeiras coletadas e paradas no ciclo
- Tempo de funcionamento e último evento registrado

## Endpoint do ESP32

O app lê os dados no endpoint:
`http://192.168.4.1/status`

O ESP32 deve estar rodando o servidor HTTP e o dispositivo rodando o app (celular ou notebook) deve estar conectado na rede Wi-Fi criada por ele.

Rede padrão configurada no hardware:
- Nome: Caminhaozinho-ESP32
- Senha: 12345678

A tela de conexão permite informar o IP caso ele mude. O botão de ajustes Wi-Fi abre as configurações de rede do dispositivo.

## Código de referência do ESP32

O código fonte em C++ que roda no microcontrolador foi guardado no repositório para referência:
`esp32/coletaautomatizada/coletaautomatizada.ino`

## Como rodar o aplicativo

Para testar no seu computador (Web) ou celular:

1. Instale as dependências do projeto:
```bash
npm install
```

2. Para rodar diretamente no navegador (recomendado para ver as mudanças e uso em notebook):
```bash
npx expo start --web
```

3. Para rodar no celular (App Expo Go):
```bash
npx expo start
```
Após executar, leia o QR Code gerado pelo terminal com a câmera do seu aplicativo Expo Go.

## Estrutura do Código

```text
App.tsx
components/
  InfoCard.tsx
  SectionCard.tsx
  StatusCard.tsx
esp32/
  coletaautomatizada/
    coletaautomatizada.ino
services/
  esp32VehicleData.ts
types/
  VehicleData.ts
```
