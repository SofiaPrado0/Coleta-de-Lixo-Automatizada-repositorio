export type ConnectionStatus = "online" | "offline";

export type VehicleState = "Em rota" | "Coletando" | "Descarregando" | "Parado";

export type LoadStatus = "Vazio" | "Com lixo";

export type RouteId = "Rota 1" | "Rota 2";

export type TrashBinSensorColor = "Preto" | "Branco" | "Verde" | "Vermelho";

export type VehicleData = {
  connectionStatus: ConnectionStatus;
  batteryLevel: number;
  speed: number;
  state: VehicleState;
  load: LoadStatus;
  trashBinSensorColor: TrashBinSensorColor;
  location: string;
  route: {
    id: RouteId;
    purpose: string;
  };
  trashBinsCollected: number;
  uptimeMinutes: number;
  lastEvent: string;
  updatedAt: string;
};
