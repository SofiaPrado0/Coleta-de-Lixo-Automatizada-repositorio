export type ConnectionStatus = "online" | "offline";

export type VehicleState =
  | "Em rota"
  | "Coletando"
  | "Descarregando"
  | "Parado"
  | "Aguardando";

export type RouteId = "Rota 1" | "Rota 2" | "Sem rota";

export type LoadStatus = "Vazio" | "Com lixo";

export type OperationalLocation =
  | "Aguardando ESP32"
  | "Caminho das casas"
  | "Centro de lixo";

export type TrashBinSensorColor =
  | "Sem leitura"
  | "Azul"
  | "Amarelo"
  | "Verde"
  | "Indeterminado";

export type LineSensorStatus =
  | "Aguardando"
  | "Seguindo linha"
  | "Corrigindo esquerda"
  | "Corrigindo direita"
  | "Parada detectada";

export type DigitalSensorValue = 0 | 1;

export type VehicleData = {
  connectionStatus: ConnectionStatus;
  state: VehicleState;
  route: {
    id: RouteId;
    purpose: string;
  };
  load: LoadStatus;
  location: OperationalLocation;
  lineSensors: {
    left: DigitalSensorValue;
    right: DigitalSensorValue;
    status: LineSensorStatus;
  };
  colorSensor: {
    redPulse: number;
    greenPulse: number;
    bluePulse: number;
    colorCode: number;
    detectedColor: TrashBinSensorColor;
  };
  trashBinsCollected: number;
  stopCount: number;
  uptimeMinutes: number;
  lastEvent: string;
  updatedAt: string;
};
