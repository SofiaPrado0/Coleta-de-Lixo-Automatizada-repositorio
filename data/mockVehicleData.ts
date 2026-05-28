import { VehicleData } from "../types/VehicleData";

export const mockVehicleData: VehicleData[] = [
  {
    connectionStatus: "online",
    batteryLevel: 92,
    speed: 0.18,
    state: "Em rota",
    load: "Vazio",
    trashBinSensorColor: "Preto",
    location: "Rua residencial",
    route: {
      id: "Rota 1",
      purpose: "Pegar lixo"
    },
    trashBinsCollected: 0,
    uptimeMinutes: 28,
    lastEvent: "Caminhãozinho iniciou a Rota 1 para pegar lixo",
    updatedAt: "08:31"
  },
  {
    connectionStatus: "online",
    batteryLevel: 88,
    speed: 0.12,
    state: "Coletando",
    load: "Com lixo",
    trashBinSensorColor: "Verde",
    location: "Área das lixeiras",
    route: {
      id: "Rota 1",
      purpose: "Pegar lixo"
    },
    trashBinsCollected: 1,
    uptimeMinutes: 33,
    lastEvent: "Lixo coletado em uma lixeira",
    updatedAt: "08:36"
  },
  {
    connectionStatus: "online",
    batteryLevel: 84,
    speed: 0.16,
    state: "Em rota",
    load: "Com lixo",
    trashBinSensorColor: "Preto",
    location: "Rua das lixeiras",
    route: {
      id: "Rota 1",
      purpose: "Pegar lixo"
    },
    trashBinsCollected: 2,
    uptimeMinutes: 39,
    lastEvent: "Lixo coletado em mais uma lixeira",
    updatedAt: "08:42"
  },
  {
    connectionStatus: "online",
    batteryLevel: 79,
    speed: 0.09,
    state: "Descarregando",
    load: "Com lixo",
    trashBinSensorColor: "Vermelho",
    location: "Centro de lixo",
    route: {
      id: "Rota 2",
      purpose: "Jogar lixo no centro de lixo"
    },
    trashBinsCollected: 2,
    uptimeMinutes: 46,
    lastEvent: "Carga entregue no centro de lixo",
    updatedAt: "08:49"
  },
  {
    connectionStatus: "offline",
    batteryLevel: 77,
    speed: 0,
    state: "Parado",
    load: "Vazio",
    trashBinSensorColor: "Branco",
    location: "Centro de lixo",
    route: {
      id: "Rota 2",
      purpose: "Jogar lixo no centro de lixo"
    },
    trashBinsCollected: 2,
    uptimeMinutes: 48,
    lastEvent: "Sinal do caminhãozinho temporariamente indisponível",
    updatedAt: "08:51"
  }
];

export const getNextVehicleData = (currentIndex: number) => {
  const nextIndex = (currentIndex + 1) % mockVehicleData.length;

  return {
    index: nextIndex,
    data: mockVehicleData[nextIndex]
  };
};
