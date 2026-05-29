import {
  ConnectionStatus,
  DigitalSensorValue,
  LineSensorStatus,
  LoadStatus,
  OperationalLocation,
  RouteId,
  TrashBinSensorColor,
  VehicleData,
  VehicleState
} from "../types/VehicleData";

export const ESP32_STATUS_URL = "http://192.168.4.1/status";

const REQUEST_TIMEOUT_MS = 2500;

type Esp32RoutePayload = Partial<{
  id: unknown;
  purpose: unknown;
}>;

type Esp32VehiclePayload = {
  [key: string]: unknown;
  connectionStatus?: unknown;
  statusConexao?: unknown;
  state?: unknown;
  estado?: unknown;
  route?: Esp32RoutePayload;
  routeId?: unknown;
  routePurpose?: unknown;
  rota?: unknown;
  objetivoRota?: unknown;
  load?: unknown;
  carga?: unknown;
  location?: unknown;
  localizacao?: unknown;
  irLeft?: unknown;
  irRight?: unknown;
  irEsq?: unknown;
  irDir?: unknown;
  leituraEsq?: unknown;
  leituraDir?: unknown;
  lineStatus?: unknown;
  estadoLinha?: unknown;
  redPulse?: unknown;
  greenPulse?: unknown;
  bluePulse?: unknown;
  pulsoVermelho?: unknown;
  pulsoVerde?: unknown;
  pulsoAzul?: unknown;
  colorCode?: unknown;
  corIdentificada?: unknown;
  detectedColor?: unknown;
  trashBinSensorColor?: unknown;
  corSensor?: unknown;
  corLixeira?: unknown;
  cor?: unknown;
  trashBinsCollected?: unknown;
  lixeirasColetadas?: unknown;
  stopCount?: unknown;
  contadorParadas?: unknown;
  uptimeMinutes?: unknown;
  tempoFuncionamento?: unknown;
  uptime?: unknown;
  lastEvent?: unknown;
  ultimoEvento?: unknown;
  event?: unknown;
  updatedAt?: unknown;
  atualizadoEm?: unknown;
};

const getFirstValue = (...values: unknown[]) => {
  return values.find((value) => value !== undefined && value !== null && value !== "");
};

const normalizeText = (value: unknown) => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numberValue = Number(value.replace(",", "."));

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return fallback;
};

const toDigitalSensorValue = (value: unknown): DigitalSensorValue => {
  const normalized = normalizeText(value);

  if (value === 1 || value === true || normalized === "1" || normalized === "high") {
    return 1;
  }

  return 0;
};

const getCurrentTimeLabel = () => {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const createOfflineVehicleData = (): VehicleData => {
  return {
    connectionStatus: "offline",
    state: "Aguardando",
    route: {
      id: "Sem rota",
      purpose: "Aguardando conexão"
    },
    load: "Vazio",
    location: "Aguardando ESP32",
    lineSensors: {
      left: 0,
      right: 0,
      status: "Aguardando"
    },
    colorSensor: {
      redPulse: 0,
      greenPulse: 0,
      bluePulse: 0,
      colorCode: 0,
      detectedColor: "Sem leitura"
    },
    trashBinsCollected: 0,
    stopCount: 0,
    uptimeMinutes: 0,
    lastEvent: "Aguardando conexão com o ESP32",
    updatedAt: getCurrentTimeLabel()
  };
};

const parseConnectionStatus = (value: unknown): ConnectionStatus => {
  const normalized = normalizeText(value);

  if (
    normalized.includes("offline") ||
    normalized.includes("desconect") ||
    normalized.includes("erro")
  ) {
    return "offline";
  }

  return "online";
};

const parseVehicleState = (value: unknown, connectionStatus: ConnectionStatus): VehicleState => {
  const normalized = normalizeText(value);

  if (connectionStatus === "offline") {
    return "Aguardando";
  }

  if (normalized.includes("descar")) {
    return "Descarregando";
  }

  if (normalized.includes("colet")) {
    return "Coletando";
  }

  if (normalized.includes("parad")) {
    return "Parado";
  }

  return "Em rota";
};

const parseLineSensorStatus = (
  left: DigitalSensorValue,
  right: DigitalSensorValue,
  value: unknown
): LineSensorStatus => {
  const normalized = normalizeText(value);

  if (normalized.includes("parada")) {
    return "Parada detectada";
  }

  if (normalized.includes("esquerda")) {
    return "Corrigindo esquerda";
  }

  if (normalized.includes("direita")) {
    return "Corrigindo direita";
  }

  if (normalized.includes("linha")) {
    return "Seguindo linha";
  }

  if (left === 0 && right === 0) {
    return "Seguindo linha";
  }

  if (left === 1 && right === 0) {
    return "Corrigindo esquerda";
  }

  if (left === 0 && right === 1) {
    return "Corrigindo direita";
  }

  return "Parada detectada";
};

const parseLoadStatus = (value: unknown): LoadStatus => {
  if (typeof value === "boolean") {
    return value ? "Com lixo" : "Vazio";
  }

  const normalized = normalizeText(value);

  if (normalized.includes("com") || normalized.includes("chei")) {
    return "Com lixo";
  }

  return "Vazio";
};

const parseOperationalLocation = (value: unknown, state: VehicleState): OperationalLocation => {
  const normalized = normalizeText(value);

  if (normalized.includes("centro")) {
    return "Centro de lixo";
  }

  if (normalized.includes("casa")) {
    return "Caminho das casas";
  }

  if (state === "Descarregando") {
    return "Centro de lixo";
  }

  if (state === "Aguardando") {
    return "Aguardando ESP32";
  }

  return "Caminho das casas";
};

const parseTrashBinSensorColor = (
  colorValue: unknown,
  colorCodeValue: unknown
): TrashBinSensorColor => {
  const colorCode = toNumber(colorCodeValue, Number.NaN);

  if (colorCode === 1) {
    return "Azul";
  }

  if (colorCode === 2) {
    return "Amarelo";
  }

  if (colorCode === 3) {
    return "Verde";
  }

  const normalized = normalizeText(colorValue);

  if (normalized.includes("azul")) {
    return "Azul";
  }

  if (normalized.includes("amarel")) {
    return "Amarelo";
  }

  if (normalized.includes("verde")) {
    return "Verde";
  }

  if (normalized.includes("sem leitura")) {
    return "Sem leitura";
  }

  return "Indeterminado";
};

const parseRouteId = (value: unknown, state: VehicleState): RouteId => {
  const normalized = normalizeText(value);

  if (
    state === "Descarregando" ||
    normalized.includes("2") ||
    normalized.includes("centro") ||
    normalized.includes("despej")
  ) {
    return "Rota 2";
  }

  if (state === "Aguardando") {
    return "Sem rota";
  }

  return "Rota 1";
};

const parseRoute = (payload: Esp32VehiclePayload, state: VehicleState) => {
  const routePayload =
    payload.route && typeof payload.route === "object" ? payload.route : undefined;
  const id = parseRouteId(getFirstValue(routePayload?.id, payload.routeId, payload.rota), state);
  const purposeValue = getFirstValue(
    routePayload?.purpose,
    payload.routePurpose,
    payload.objetivoRota
  );
  const purpose =
    typeof purposeValue === "string" && purposeValue.trim().length > 0
      ? purposeValue
      : id === "Rota 2"
        ? "Jogar lixo no centro de lixo"
        : id === "Rota 1"
          ? "Pegar lixo"
          : "Aguardando conexão";

  return {
    id,
    purpose
  };
};

export const createVehicleDataFromEsp32 = (payload: Esp32VehiclePayload): VehicleData => {
  const connectionStatus = parseConnectionStatus(
    getFirstValue(payload.connectionStatus, payload.statusConexao)
  );
  const state = parseVehicleState(getFirstValue(payload.state, payload.estado), connectionStatus);
  const route = parseRoute(payload, state);
  const left = toDigitalSensorValue(
    getFirstValue(payload.irLeft, payload.irEsq, payload.leituraEsq)
  );
  const right = toDigitalSensorValue(
    getFirstValue(payload.irRight, payload.irDir, payload.leituraDir)
  );
  const lineStatus = parseLineSensorStatus(
    left,
    right,
    getFirstValue(payload.lineStatus, payload.estadoLinha)
  );
  const colorCode = toNumber(
    getFirstValue(payload.colorCode, payload.corIdentificada, payload.cor),
    0
  );
  const colorValue = getFirstValue(
    payload.detectedColor,
    payload.trashBinSensorColor,
    payload.corSensor,
    payload.corLixeira,
    payload.cor
  );
  const eventValue = getFirstValue(payload.lastEvent, payload.ultimoEvento, payload.event);
  const updatedAtValue = getFirstValue(payload.updatedAt, payload.atualizadoEm);
  const load = parseLoadStatus(getFirstValue(payload.load, payload.carga));
  const location = parseOperationalLocation(
    getFirstValue(payload.location, payload.localizacao),
    state
  );

  return {
    connectionStatus,
    state,
    route,
    load,
    location,
    lineSensors: {
      left,
      right,
      status: lineStatus
    },
    colorSensor: {
      redPulse: toNumber(getFirstValue(payload.redPulse, payload.pulsoVermelho), 0),
      greenPulse: toNumber(getFirstValue(payload.greenPulse, payload.pulsoVerde), 0),
      bluePulse: toNumber(getFirstValue(payload.bluePulse, payload.pulsoAzul), 0),
      colorCode,
      detectedColor: parseTrashBinSensorColor(colorValue, colorCode)
    },
    trashBinsCollected: toNumber(
      getFirstValue(payload.trashBinsCollected, payload.lixeirasColetadas),
      0
    ),
    stopCount: toNumber(getFirstValue(payload.stopCount, payload.contadorParadas), 0),
    uptimeMinutes: toNumber(
      getFirstValue(payload.uptimeMinutes, payload.tempoFuncionamento, payload.uptime),
      0
    ),
    lastEvent:
      typeof eventValue === "string" && eventValue.trim().length > 0
        ? eventValue
        : "Dados recebidos do ESP32",
    updatedAt:
      typeof updatedAtValue === "string" && updatedAtValue.trim().length > 0
        ? updatedAtValue
        : getCurrentTimeLabel()
  };
};

export const fetchVehicleDataFromEsp32 = async (
  statusUrl = ESP32_STATUS_URL
): Promise<VehicleData | null> => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(statusUrl, {
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Esp32VehiclePayload;

    return createVehicleDataFromEsp32(payload);
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};
