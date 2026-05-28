# Caminhãozinho de Lixo - Dashboard Mobile

Aplicativo mobile em React Native com Expo para monitoramento de um caminhãozinho de lixo usado em uma maquete urbana inteligente.

O app exibe apenas dados de acompanhamento do caminhãozinho. Ele nao possui botoes de controle, tela de login, backend ou integracao direta com ESP32 nesta etapa.

## Tecnologias

- React Native
- Expo SDK 54
- TypeScript
- StyleSheet
- @expo/vector-icons

## Funcionalidades

- Status de conexao do caminhãozinho
- Nivel de bateria
- Velocidade atual
- Estado operacional
- Carga atual
- Cor captada pelo sensor das lixeiras
- Localizacao na maquete
- Rota atual do caminhãozinho
- Quantidade de lixeiras coletadas
- Tempo de funcionamento
- Ultimo evento registrado
- Indicador visual de atualizacao
- Seletor de tema com rosa, azul, verde e amarelo

## Dados simulados

Os dados iniciais ficam em:

```text
data/mockVehicleData.ts
```

A tela alterna automaticamente entre registros simulados a cada 4 segundos. No futuro, esse ponto pode ser substituido por uma chamada HTTP para a API do ESP32.

As rotas simuladas seguem a regra da maquete:

- Rota 1: pegar lixo nas lixeiras.
- Rota 2: jogar lixo no centro de lixo.

## Estrutura

```text
App.tsx
components/
  InfoCard.tsx
  SectionCard.tsx
  StatusCard.tsx
data/
  mockVehicleData.ts
types/
  VehicleData.ts
```

Os arquivos antigos da versao web estatica (`index.html`, `style.css` e `app.js`) foram preservados no repositorio.

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o Expo:

```bash
npm start
```

Depois, abra no celular Android usando o Expo Go ou execute:

```bash
npm run android
```

## Observacao

Este front-end esta preparado para receber integracao real futuramente. O comentario no `App.tsx` indica onde a chamada HTTP para o ESP32 deve entrar.

## Integracao futura com ESP32

Para a integracao real, a opcao escolhida para a maquete e fazer o ESP32 criar a propria rede Wi-Fi em modo Access Point.

Fluxo esperado:

```text
Celular conectado na rede Wi-Fi do ESP32
App Expo acessa http://192.168.4.1/status
ESP32 responde os dados atuais em JSON
```

O app deve continuar apenas exibindo dados de monitoramento. O controle do caminhãozinho, leitura do sensor de linha, leitura do sensor das lixeiras, rotas e contagem ficam no codigo do ESP32. A API do ESP32 apenas disponibiliza esses dados para a dashboard.
