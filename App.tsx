import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { InfoCard } from "./components/InfoCard";
import { SectionCard } from "./components/SectionCard";
import { StatusCard } from "./components/StatusCard";
import { getNextVehicleData, mockVehicleData } from "./data/mockVehicleData";

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

const formatUptime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

const getTrashBinSensorHelper = (sensorColor: string) => {
  if (sensorColor === "Preto") {
    return "Lixeira detectada";
  }

  if (sensorColor === "Branco") {
    return "Sem lixeira";
  }

  return "Cor da lixeira";
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vehicleData, setVehicleData] = useState(mockVehicleData[0]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("pink");
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const updateLabel = useMemo(() => {
    return vehicleData.connectionStatus === "online"
      ? "Dados atualizados"
      : "Reconectando";
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
    const interval = setInterval(() => {
      // Aqui futuramente entra a chamada HTTP para o ESP32.
      setCurrentIndex((index) => {
        const next = getNextVehicleData(index);
        setVehicleData(next.data);
        return next.index;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
  const stateColor = vehicleData.state === "Parado" ? "#A64B61" : theme.accent;

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

        <View style={[styles.grid, isCompact && styles.gridCompact]}>
          <InfoCard
            label="Bateria"
            value={`${vehicleData.batteryLevel}%`}
            helper={vehicleData.batteryLevel > 30 ? "Nível estável" : "Nível baixo"}
            icon="battery-half-outline"
            accentColor={theme.accent}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Velocidade"
            value={`${vehicleData.speed.toFixed(2)} m/s`}
            helper={vehicleData.speed > 0 ? "Em movimento" : "Sem movimento"}
            icon="speedometer-outline"
            accentColor={theme.secondary}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Carga"
            value={vehicleData.load}
            helper={vehicleData.load === "Com lixo" ? "Carga detectada" : "Sem carga"}
            icon="cube-outline"
            accentColor={theme.tertiary}
            borderColor={theme.border}
            shadowColor={theme.shadow}
          />

          <InfoCard
            label="Sensor das lixeiras"
            value={vehicleData.trashBinSensorColor}
            helper={getTrashBinSensorHelper(vehicleData.trashBinSensorColor)}
            icon="color-palette-outline"
            accentColor={theme.sensor}
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
                Monitorando a rota atual do caminhãozinho na maquete.
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Localização atual"
          icon="location-outline"
          accentColor={theme.accent}
          borderColor={theme.border}
          shadowColor={theme.shadow}
        >
          <View style={styles.locationRow}>
            <Text style={styles.locationValue}>{vehicleData.location}</Text>
            <View style={[styles.routePill, { backgroundColor: theme.soft }]}>
              <Ionicons name="map-outline" size={15} color={theme.accent} />
              <View style={styles.routeTextGroup}>
                <Text style={[styles.routeTitle, { color: theme.accent }]}>
                  {vehicleData.route.id}
                </Text>
                <Text style={styles.routeText}>{vehicleData.route.purpose}</Text>
              </View>
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Resumo"
          icon="stats-chart-outline"
          accentColor={theme.secondary}
          borderColor={theme.border}
          shadowColor={theme.shadow}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{vehicleData.trashBinsCollected}</Text>
              <Text style={styles.summaryLabel}>Lixeiras coletadas</Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {formatUptime(vehicleData.uptimeMinutes)}
              </Text>
              <Text style={styles.summaryLabel}>Funcionamento</Text>
            </View>
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
    backgroundColor: "#FFF5F8"
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF5F8"
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
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
  locationRow: {
    gap: 12
  },
  locationValue: {
    color: "#2E252A",
    fontSize: 28,
    fontWeight: "900"
  },
  routePill: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFF5F8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  routeTextGroup: {
    flex: 1
  },
  routeTitle: {
    color: "#D9447C",
    fontSize: 12,
    fontWeight: "900"
  },
  routeText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "700"
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
