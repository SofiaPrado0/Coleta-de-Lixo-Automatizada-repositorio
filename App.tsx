import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { InfoCard } from "./components/InfoCard";
import { SectionCard } from "./components/SectionCard";
import { StatusCard } from "./components/StatusCard";
import {
  createOfflineVehicleData,
  ESP32_STATUS_URL,
  fetchVehicleDataFromEsp32
} from "./services/esp32VehicleData";

const THEMES = {
  floresta: {
    label: "Floresta",
    accent: "#1B9C5A",
    secondary: "#168A75",
    tertiary: "#50A05A",
    sensor: "#2F7D5E",
    background: "#F3FBF6",
    soft: "#E9F7EF",
    border: "#CDEBD8",
    shadow: "#2E9B66",
    headerBg: "#0F4D2E"
  },
  oceano: {
    label: "Oceano",
    accent: "#1565C0",
    secondary: "#0D47A1",
    tertiary: "#1976D2",
    sensor: "#4769E8",
    background: "#F2F7FF",
    soft: "#EAF2FF",
    border: "#CFE0FF",
    shadow: "#2F80ED",
    headerBg: "#0A3268"
  },
  solar: {
    label: "Solar",
    accent: "#D4960C",
    secondary: "#B7791F",
    tertiary: "#D29A22",
    sensor: "#A66B00",
    background: "#FFF9E8",
    soft: "#FFF2C2",
    border: "#F2D98B",
    shadow: "#C78516",
    headerBg: "#6B4106"
  },
  terra: {
    label: "Terra",
    accent: "#8B5E3C",
    secondary: "#6D4C41",
    tertiary: "#8D6E63",
    sensor: "#5D4037",
    background: "#F5F1EE",
    soft: "#EFEBE9",
    border: "#D7CCC8",
    shadow: "#8B5E3C",
    headerBg: "#3D2815"
  }
} as const;

type ThemeName = keyof typeof THEMES;

const THEME_KEYS = Object.keys(THEMES) as ThemeName[];
const DEFAULT_ESP32_IP = ESP32_STATUS_URL.replace("http://", "").replace("/status", "");
const DEFAULT_ESP32_PASSWORD = "12345678";

const MOCK_SCHEDULE = [
  { id: "1", day: "Hoje", time: "08:30", type: "Reciclavel", color: "#1565C0", isNext: true },
  { id: "2", day: "Hoje", time: "14:00", type: "Organico", color: "#6D4C41", isNext: false },
  { id: "3", day: "Amanha", time: "08:30", type: "Papel e Papelao", color: "#D4960C", isNext: false },
  { id: "4", day: "Quinta", time: "14:00", type: "Metal e Vidro", color: "#546E7A", isNext: false },
  { id: "5", day: "Sexta", time: "08:30", type: "Nao reciclavel", color: "#616161", isNext: false }
];

const MOCK_NEXT_COLLECTION = { time: "08:30", type: "Reciclavel", countdown: "2h 15min", street: "Rua das Flores, 120" };

const buildEsp32StatusUrl = (ip: string) => {
  const host = ip
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");

  return `http://${host || DEFAULT_ESP32_IP}/status`;
};

const formatUptime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

const formatDigitalSensorValue = (value: 0 | 1) => {
  return value === 1 ? "HIGH" : "LOW";
};

const getColorSensorHelper = (colorCode: number) => {
  if (colorCode >= 1 && colorCode <= 3) {
    return `Código ${colorCode} calculado pelo ESP32`;
  }

  return "Sem cor válida identificada";
};

export default function App() {
  const [vehicleData, setVehicleData] = useState(createOfflineVehicleData);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("floresta");
  const [esp32Ip, setEsp32Ip] = useState(DEFAULT_ESP32_IP);
  const [esp32Password, setEsp32Password] = useState(DEFAULT_ESP32_PASSWORD);
  const [statusUrl, setStatusUrl] = useState(ESP32_STATUS_URL);
  const [connectionMessage, setConnectionMessage] = useState("Aguardando conexão");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const updateLabel = useMemo(() => {
    return vehicleData.connectionStatus === "online"
      ? "Dados atualizados"
      : "Aguardando ESP32";
  }, [vehicleData.connectionStatus]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    let isMounted = true;

    const updateVehicleData = async () => {
      const esp32Data = await fetchVehicleDataFromEsp32(statusUrl);

      if (!isMounted) {
        return;
      }

      setVehicleData(esp32Data ?? createOfflineVehicleData());

      if (esp32Data) {
        setConnectionMessage("Conectado ao ESP32");
      }
    };

    updateVehicleData();

    const interval = setInterval(updateVehicleData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [statusUrl]);

  const handleConnect = async () => {
    const nextStatusUrl = buildEsp32StatusUrl(esp32Ip);

    setIsTestingConnection(true);
    setStatusUrl(nextStatusUrl);

    const esp32Data = await fetchVehicleDataFromEsp32(nextStatusUrl);

    setVehicleData(esp32Data ?? createOfflineVehicleData());
    setConnectionMessage(
      esp32Data ? "Conectado ao ESP32" : "Sem resposta do ESP32"
    );
    setIsTestingConnection(false);
  };

  const handleOpenWifiSettings = async () => {
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.WIFI_SETTINGS");
        return;
      }

      await Linking.openSettings();
    } catch {
      setConnectionMessage("Abra o Wi-Fi do celular");
    }
  };

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45]
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.2]
  });

  const theme = THEMES[selectedTheme];
  const isOnline = vehicleData.connectionStatus === "online";
  const stateColor = !isOnline || vehicleData.state === "Parado" ? "#C0392B" : theme.accent;

  return (
    <View style={[styles.root, { backgroundColor: theme.headerBg, paddingTop: Platform.OS === "android" ? 30 : 0 }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} bounces={false} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.headerSection, { backgroundColor: theme.headerBg }]}>
            <MaterialCommunityIcons name="recycle" size={48} color="#FFFFFF" />
            <Text style={styles.eyebrow}>ECOBOT</Text>
            <Text style={styles.title}>Coleta Inteligente</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ESP32 {isOnline ? "CONECTADO" : "DESCONECTADO"}</Text>
            </View>
          </View>

          <View style={[styles.bodySection, { backgroundColor: theme.background }]}>
            
            <View style={[styles.themeSelector, { borderColor: theme.border, shadowColor: theme.shadow }]}>
              {THEME_KEYS.map((tKey) => {
                const t = THEMES[tKey];
                const isSelected = selectedTheme === tKey;
                return (
                  <Pressable
                    key={tKey}
                    onPress={() => setSelectedTheme(tKey)}
                    style={[
                      styles.themePill,
                      isSelected && { backgroundColor: t.accent }
                    ]}
                  >
                    <Text style={[styles.themePillText, isSelected && styles.themePillTextSelected]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.heroCard, { backgroundColor: theme.accent }]}>
              <View style={styles.heroCardHeader}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#FFFFFF" />
                <Text style={styles.heroCardTitle}>Próxima coleta na sua rua</Text>
              </View>
              <Text style={styles.heroCardTime}>{MOCK_NEXT_COLLECTION.time}</Text>
              <View style={styles.heroCardBadge}>
                <Text style={[styles.heroCardBadgeText, { color: theme.accent }]}>{MOCK_NEXT_COLLECTION.type}</Text>
              </View>
              <Text style={styles.heroCardStreet}>{MOCK_NEXT_COLLECTION.street}</Text>
              <Text style={styles.heroCardCountdown}>Chega em {MOCK_NEXT_COLLECTION.countdown}</Text>
            </View>

            <SectionCard
              title="Agenda de coleta"
              icon="calendar-month-outline"
              accentColor={theme.accent}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            >
              {MOCK_SCHEDULE.map((item) => (
                <View key={item.id} style={styles.scheduleItem}>
                  <View style={[styles.scheduleDot, { backgroundColor: item.color }]} />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleDay}>{item.day}</Text>
                    <Text style={styles.scheduleType}>{item.type}</Text>
                  </View>
                  <View style={styles.scheduleTimeContainer}>
                    <Text style={styles.scheduleTime}>{item.time}</Text>
                    {item.isNext && (
                      <View style={[styles.scheduleNextBadge, { backgroundColor: theme.accent }]}>
                        <Text style={styles.scheduleNextText}>Próximo</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </SectionCard>

            <StatusCard
              status={vehicleData.connectionStatus}
              updatedAt={vehicleData.updatedAt ? new Date(vehicleData.updatedAt) : null}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            />

            <SectionCard
              title="Conexão com ESP32"
              icon="wifi"
              accentColor={theme.accent}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Endereço IP (sem http://)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.soft }]}
                  value={esp32Ip}
                  onChangeText={setEsp32Ip}
                  placeholder="Ex: 192.168.0.100"
                  keyboardType="numeric"
                  placeholderTextColor="#A3B5AA"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha do Ponto de Acesso</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.soft }]}
                  value={esp32Password}
                  onChangeText={setEsp32Password}
                  placeholder="Senha do ESP32"
                  secureTextEntry
                  placeholderTextColor="#A3B5AA"
                />
              </View>

              <View style={styles.buttonGroup}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.accent },
                    isTestingConnection && { opacity: 0.7 }
                  ]}
                  onPress={handleConnect}
                  disabled={isTestingConnection}
                >
                  <MaterialCommunityIcons name="connection" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {isTestingConnection ? "Conectando..." : "Testar Conexão"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.secondaryButton, { borderColor: theme.accent }]}
                  onPress={handleOpenWifiSettings}
                >
                  <Ionicons name="settings-outline" size={18} color={theme.accent} />
                  <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
                    Ajustes de Wi-Fi
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.feedbackBox, { backgroundColor: theme.soft, borderColor: theme.border }]}>
                <MaterialCommunityIcons
                  name={isOnline ? "check-circle" : "alert-circle"}
                  size={16}
                  color={theme.accent}
                />
                <Text style={[styles.feedbackText, { color: theme.accent }]}>
                  {connectionMessage}
                </Text>
              </View>
            </SectionCard>

            <SectionCard
              title="Estado atual"
              icon="car-electric"
              accentColor={theme.accent}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            >
              <InfoCard
                label="Status de Operação"
                value={vehicleData.state}
                icon="robot-outline"
                accentColor={stateColor}
                borderColor={theme.border}
                shadowColor={theme.shadow}
              />
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Rota / Destino"
                    value={vehicleData.route.id}
                    icon="map-marker-path"
                    accentColor={theme.accent}
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Tempo Ligado"
                    value={formatUptime(vehicleData.uptimeMinutes)}
                    icon="clock-outline"
                    accentColor={theme.secondary}
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
              </View>
            </SectionCard>

            <SectionCard
              title="Resumo dos sensores"
              icon="memory"
              accentColor={theme.accent}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            >
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Carga"
                    value={vehicleData.load}
                    icon="dump-truck"
                    accentColor={theme.sensor}
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Lixeiras"
                    value={String(vehicleData.trashBinsCollected)}
                    helper="Coletadas"
                    icon="delete-empty"
                    accentColor={theme.tertiary}
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Cor (Sensor)"
                    value={vehicleData.colorSensor.detectedColor}
                    helper={getColorSensorHelper(vehicleData.colorSensor.colorCode)}
                    icon="palette-outline"
                    accentColor="#E67E22"
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InfoCard
                    label="Linha"
                    value={vehicleData.lineSensors.status}
                    icon="road-variant"
                    accentColor="#8E44AD"
                    borderColor={theme.border}
                    shadowColor={theme.shadow}
                  />
                </View>
              </View>
            </SectionCard>

            <SectionCard
              title="Último evento"
              icon="history"
              accentColor={theme.accent}
              borderColor={theme.border}
              shadowColor={theme.shadow}
            >
              <Text style={styles.eventText}>{vehicleData.lastEvent}</Text>
            </SectionCard>

            <View style={styles.footer}>
              <View style={[styles.footerPill, { backgroundColor: theme.soft, borderColor: theme.border }]}>
                <View style={styles.pulseContainer}>
                  <Animated.View
                    style={[
                      styles.pulseCircle,
                      {
                        backgroundColor: isOnline ? theme.accent : "#C0392B",
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }]
                      }
                    ]}
                  />
                  <View style={[styles.pulseCore, { backgroundColor: isOnline ? theme.accent : "#C0392B" }]} />
                </View>
                <Text style={styles.footerText}>{updateLabel}</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bodySection: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
    paddingTop: 32,
  },
  themeSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    marginBottom: 32,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  themePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 12,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A6B63",
  },
  themePillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heroCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroCardTime: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
  },
  heroCardBadge: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  heroCardBadgeText: {
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  heroCardStreet: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroCardCountdown: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  scheduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2E23",
  },
  scheduleType: {
    fontSize: 12,
    color: "#5A6B63",
    marginTop: 2,
  },
  scheduleTimeContainer: {
    alignItems: "flex-end",
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A2E23",
  },
  scheduleNextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  scheduleNextText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    marginHorizontal: -6,
  },
  halfWidth: {
    flex: 1,
    paddingHorizontal: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A6B63",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A2E23",
    fontWeight: "500",
  },
  buttonGroup: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  eventText: {
    fontSize: 15,
    color: "#5A6B63",
    fontWeight: "500",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  footerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pulseContainer: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  pulseCircle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7C8E83",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
