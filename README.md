# Caminhãozinho de Lixo - Supervisório Mobile

Aplicativo mobile em React Native com Expo para receber e exibir dados reais do ESP32 do caminhãozinho de lixo.

O supervisório não usa dados simulados. Quando o ESP32 não está conectado ou não responde, o app fica offline aguardando a conexão.

## Dados exibidos

O app exibe apenas dados que o ESP32 consegue ler ou calcular a partir do código embarcado:

- Estado atual da rotina
- Rota atual calculada pelo ESP32
- Carga inferida pelo fim da rotina de coleta/despejo
- Localização operacional inferida pela rotina dos servos
- Leituras digitais dos sensores IR esquerdo e direito
- Estado tratado do sensor de linha
- Pulsos vermelho, verde e azul do sensor de cor
- Cor identificada a partir dos pulsos
- Quantidade de lixeiras coletadas
- Quantidade de paradas no ciclo
- Tempo de funcionamento do ESP32
- Último evento registrado pelo ESP32

Dados como bateria e velocidade real foram removidos porque exigem sensores próprios. Carga e localização permanecem porque são estados operacionais calculados pelas rotinas dos servos.

## Endpoint do ESP32

O app lê os dados no endpoint:

```text
http://192.168.4.1/status
```

O ESP32 deve estar rodando o servidor HTTP e o celular deve estar conectado na rede Wi-Fi criada por ele.

Rede configurada no sketch:

```text
Nome: Caminhaozinho-ESP32
Senha: 12345678
```

No APK, a tela de conexão permite informar o IP e a senha da rede do ESP32. O botão Wi-Fi abre as configurações de rede do Android; o botão Conectar testa o endpoint montado com o IP informado.

## Código de referência do ESP32

O sketch foi deixado no repositório apenas para não se perder:

```text
esp32/coletaautomatizada/coletaautomatizada.ino
```

Na prática, esse código roda no ESP32. O repositório do supervisório apenas consome os dados que o ESP32 disponibiliza.

## Estrutura

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

## Como rodar

Instale as dependências:

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
