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
  pink: {
    label: "Rosa",
    accent: "#D9447C",
    secondary: "#B84F8E",
    tertiary: "#C65A75",
    sensor: "#8F6FBC",
    background: "#FFF5F8",
    soft: "#FFF0F5",
    border: "#F7D7E3",
    shadow: "#D9447C"
  },
  blue: {
    label: "Azul",
    accent: "#2F80ED",
    secondary: "#3A66D7",
    tertiary: "#2796B3",
    sensor: "#4769E8",
    background: "#F2F7FF",
    soft: "#EAF2FF",
    border: "#CFE0FF",
    shadow: "#2F80ED"
  },
  green: {
    label: "Verde",
    accent: "#2E9B66",
    secondary: "#168A75",
    tertiary: "#50A05A",
    sensor: "#2F7D5E",
    background: "#F3FBF6",
    soft: "#E9F7EF",
    border: "#CDEBD8",
    shadow: "#2E9B66"
  },
  yellow: {
    label: "Amarelo",
    accent: "#C78516",
    secondary: "#B7791F",
    tertiary: "#D29A22",
    sensor: "#A66B00",
    background: "#FFF9E8",
    soft: "#FFF2C2",
    border: "#F2D98B",
    shadow: "#C78516"
  }
} as const;

type ThemeName = keyof typeof THEMES;

const THEME_KEYS = Object.keys(THEMES) as ThemeName[];
const DEFAULT_ESP32_IP = ESP32_STATUS_URL.replace("http://", "").replace("/status", "");
const DEFAULT_ESP32_PASSWORD = "12345678";

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
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("pink");
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
  const stateColor = !isOnline || vehicleData.state === "Parado" ? "#A64B61" : theme.accent;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.brandIcon,
              { borderColor: theme.border, shadowColor: theme.shadow }
            ]}
          >
            <MaterialCommunityIcons name="truck-outline" size={27} color={theme.accent} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Maquete inteligente</Text>
            <Text style={styles.title}>Caminhãozinho de Lixo</Text>
          </View>
        </View>

        <View
          style={[
            styles.themeSelector,
            { borderColor: theme.border, shadowColor: theme.shadow }
          ]}
        >
          <View style={styles.themeSelectorLabel}>
            <Ionicons name="color-palette-outline" size={16} color={theme.accent} />
            <Text style={styles.themeSelectorText}>Tema</Text>
          </View>

          <View style={styles.themeButtons}>
            {THEME_KEYS.map((themeName) => {
              const option = THEMES[themeName];
              const isSelected = selectedTheme === themeName;

              return (
                <Pressable
                  key={themeName}
                  accessibilityLabel={`Selecionar tema ${option.label}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedTheme(themeName)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: option.soft,
                      borderColor: isSelected ? option.accent : "transparent"
                    }
                  ]}
                >
                  <View style={[styles.themeDot, { backgroundColor: option.accent }]} />
                  <Text
                    style={[
                      styles.themeButtonText,
                      isSelected && { color: option.accent }
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <StatusCard
          status={vehicleData.connectionStatus}
          updatedAt={vehicleData.updatedAt}
          borderColor={theme.border}
          shadowColor={theme.shadow}
          softBackground={theme.soft}
        />

        <View
          style={[
            styles.connectionCard,
            { borderColor: theme.border, shadowColor: theme.shadow }
          ]}
        >
          <View style={styles.connectionHeader}>
            <View style={styles.connectionTitleRow}>
              <Ionicons name="wifi-outline" size={18} color={theme.accent} />
              <Text style={styles.connectionTitle}>Conexão ESP32</Text>
            </View>
            <View style={[styles.connectionBadge, { backgroundColor: theme.soft }]}>
              <View
                style={[
                  styles.connectionBadgeDot,
                  { backgroundColor: isOnline ? "#2E9B66" : "#A64B61" }
                ]}
              />
              <Text style={styles.connectionBadgeText}>{connectionMessage}</Text>
            </View>
          </View>

          <View style={styles.connectionMeta}>
            <Text style={styles.connectionMetaText}>Rede: Caminhaozinho-ESP32</Text>
          </View>

          <View style={styles.connectionFields}>
            <View style={styles.connectionField}>
              <Text style={styles.connectionLabel}>IP</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                onChangeText={setEsp32Ip}
                placeholder={DEFAULT_ESP32_IP}
                placeholderTextColor="#B7A3AD"
                style={[styles.connectionInput, { borderColor: theme.border }]}
                value={esp32Ip}
              />
            </View>

            <View style={styles.connectionField}>
              <Text style={styles.connectionLabel}>Senha</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEsp32Password}
                placeholder={DEFAULT_ESP32_PASSWORD}
                placeholderTextColor="#B7A3AD"
                style={[styles.connectionInput, { borderColor: theme.border }]}
                value={esp32Password}
              />
            </View>
          </View>

          <View style={styles.connectionActions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleOpenWifiSettings}
              style={[
                styles.wifiButton,
                { borderColor: theme.border, backgroundColor: theme.soft }
              ]}
            >
              <Ionicons name="settings-outline" size={17} color={theme.accent} />
              <Text style={[styles.wifiButtonText, { color: theme.accent }]}>Wi-Fi</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isTestingConnection}
              onPress={handleConnect}
              style={[
                styles.connectButton,
                { backgroundColor: theme.accent },
                isTestingConnection && styles.connectButtonDisabled
              ]}
            >
              <Ionicons name="radio-outline" size={17} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>
                {isTestingConnection ? "Testando" : "Conectar"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.grid, isCompact && styles.gridCompact]}>
          <InfoCard
            label="Sensor de linha"
            value={isOnline ? vehicleData.lineSensors.status : "--"}
            helper={
              isOnline
                ? `Esq ${formatDigitalSensorValue(
                    vehicleData.lineSensors.left
                  )} | Dir ${formatDigitalSensorValue(vehicleData.lineSensors.right)}`
                : "Sem leitura"
            }
            icon="git-branch-outline"
            accentColor={theme.accent}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Cor detectada"
            value={isOnline ? vehicleData.colorSensor.detectedColor : "--"}
            helper={
              isOnline
                ? getColorSensorHelper(vehicleData.colorSensor.colorCode)
                : "Sem leitura"
            }
            icon="color-palette-outline"
            accentColor={theme.secondary}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Pulsos RGB"
            value={
              isOnline
                ? `${vehicleData.colorSensor.redPulse}/${vehicleData.colorSensor.greenPulse}/${vehicleData.colorSensor.bluePulse}`
                : "--"
            }
            helper="Vermelho | Verde | Azul"
            icon="pulse-outline"
            accentColor={theme.tertiary}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Rota"
            value={isOnline ? vehicleData.route.id : "--"}
            helper={isOnline ? vehicleData.route.purpose : "Sem leitura"}
            icon="map-outline"
            accentColor={theme.sensor}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Carga"
            value={isOnline ? vehicleData.load : "--"}
            helper={isOnline ? "Inferida pelo fim da coleta/despejo" : "Sem leitura"}
            icon="cube-outline"
            accentColor={theme.accent}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Localização"
            value={isOnline ? vehicleData.location : "--"}
            helper={isOnline ? "Inferida pela rotina dos servos" : "Sem leitura"}
            icon="location-outline"
            accentColor={theme.secondary}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />
        </View>

        <SectionCard
          title="Estado atual"
          icon="analytics-outline"
          accentColor={stateColor}
          borderColor={theme.border}
          shadowColor={theme.shadow}
        >
          <View style={styles.stateRow}>
            <View style={[styles.stateMarker, { backgroundColor: `${stateColor}18` }]}>
              <Ionicons name="navigate-outline" size={28} color={stateColor} />
            </View>

            <View style={styles.stateTextGroup}>
              <Text style={[styles.stateValue, { color: stateColor }]}>
                {vehicleData.state}
              </Text>
              <Text style={styles.stateDescription}>
                {isOnline
                  ? "Estado calculado pelo ESP32 a partir da rota e dos sensores."
                  : "Conecte o celular na rede Wi-Fi do ESP32 para receber os dados."}
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Resumo dos sensores"
          icon="stats-chart-outline"
          accentColor={theme.secondary}
          borderColor={theme.border}
          shadowColor={theme.shadow}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {isOnline ? vehicleData.trashBinsCollected : "--"}
              </Text>
              <Text style={styles.summaryLabel}>Lixeiras coletadas</Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {isOnline ? vehicleData.stopCount : "--"}
              </Text>
              <Text style={styles.summaryLabel}>Paradas no ciclo</Text>
            </View>
          </View>

          <View style={[styles.summaryDividerHorizontal, { backgroundColor: theme.border }]} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {isOnline ? formatUptime(vehicleData.uptimeMinutes) : "--"}
            </Text>
            <Text style={styles.summaryLabel}>Funcionamento do ESP32</Text>
          </View>
        </SectionCard>

        <SectionCard
          title="Último evento"
          icon="list-outline"
          accentColor={theme.accent}
          borderColor={theme.border}
          shadowColor={theme.shadow}
        >
          <Text style={styles.eventText}>{vehicleData.lastEvent}</Text>
        </SectionCard>

        <View
          style={[
            styles.updateIndicator,
            { borderColor: theme.border, shadowColor: theme.shadow }
          ]}
        >
          <View style={styles.pulseWrap}>
            <Animated.View
              style={[
                styles.pulse,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                  backgroundColor: isOnline ? "#2E9B66" : "#A64B61"
                }
              ]}
            />
            <View
              style={[
                styles.updateDot,
                { backgroundColor: isOnline ? "#2E9B66" : "#A64B61" }
              ]}
            />
          </View>
          <Text style={styles.updateText}>{updateLabel}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5F8",
    paddingTop: Platform.OS === "android" ? 30 : 0
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF5F8"
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 2
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F7D7E3",
    shadowColor: "#D9447C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
  },
  headerText: {
    flex: 1
  },
  themeSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2
  },
  themeSelectorLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10
  },
  themeSelectorText: {
    color: "#7B6871",
    fontSize: 13,
    fontWeight: "800"
  },
  themeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  themeButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  themeButtonText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "800"
  },
  eyebrow: {
    color: "#9C8791",
    fontSize: 13,
    fontWeight: "700"
  },
  title: {
    color: "#2E252A",
    fontSize: 31,
    fontWeight: "900",
    marginTop: 2
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  gridCompact: {
    gap: 10
  },
  connectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
  },
  connectionHeader: {
    gap: 10
  },
  connectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  connectionTitle: {
    color: "#2E252A",
    fontSize: 15,
    fontWeight: "900"
  },
  connectionBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  connectionBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  connectionBadgeText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "800"
  },
  connectionMeta: {
    marginTop: 12
  },
  connectionMetaText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "700"
  },
  connectionFields: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  connectionField: {
    flex: 1,
    gap: 6
  },
  connectionLabel: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "800"
  },
  connectionInput: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    color: "#2E252A",
    fontSize: 14,
    fontWeight: "700",
    backgroundColor: "#FFFFFF"
  },
  connectionActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  wifiButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14
  },
  wifiButtonText: {
    fontSize: 14,
    fontWeight: "900"
  },
  connectButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  connectButtonDisabled: {
    opacity: 0.72
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  stateMarker: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  stateTextGroup: {
    flex: 1
  },
  stateValue: {
    fontSize: 29,
    fontWeight: "900"
  },
  stateDescription: {
    color: "#7B6871",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  summaryItem: {
    flex: 1
  },
  summaryNumber: {
    color: "#2E252A",
    fontSize: 26,
    fontWeight: "900"
  },
  summaryLabel: {
    color: "#7B6871",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3
  },
  summaryDivider: {
    width: 1,
    height: 46,
    backgroundColor: "#F3CAD9",
    marginHorizontal: 18
  },
  summaryDividerHorizontal: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: "#F3CAD9",
    marginVertical: 16
  },
  eventText: {
    color: "#2E252A",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24
  },
  updateIndicator: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F7D7E3"
  },
  pulseWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  pulse: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  updateText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "800"
  }
});
