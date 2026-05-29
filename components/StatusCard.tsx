import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ConnectionStatus } from "../types/VehicleData";

type StatusCardProps = {
  status: ConnectionStatus;
  updatedAt: string;
  borderColor?: string;
  shadowColor?: string;
  softBackground?: string;
};

export function StatusCard({
  status,
  updatedAt,
  borderColor = "#F7D7E3",
  shadowColor = "#D9447C",
  softBackground = "#FFF5F8"
}: StatusCardProps) {
  const isOnline = status === "online";
  const color = isOnline ? "#2E9B66" : "#A64B61";
  const label = isOnline ? "Online" : "Offline";
  const message = isOnline
    ? "Recebendo dados reais do ESP32"
    : "Aguardando conexão com o ESP32";

  return (
    <View style={[styles.card, { borderColor, shadowColor }]}>
      <View style={styles.left}>
        <View style={[styles.statusIcon, { backgroundColor: `${color}18` }]}>
          <Ionicons
            name={isOnline ? "radio-outline" : "cloud-offline-outline"}
            size={24}
            color={color}
          />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.label}>Status geral</Text>
          <Text style={[styles.statusText, { color }]}>{label}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: softBackground }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.badgeText}>{updatedAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4
  },
  left: {
    flexDirection: "row",
    gap: 14
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  textGroup: {
    flex: 1
  },
  label: {
    color: "#8E7480",
    fontSize: 13,
    fontWeight: "600"
  },
  statusText: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2
  },
  message: {
    color: "#7B6871",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 16
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  badgeText: {
    color: "#7B6871",
    fontSize: 12,
    fontWeight: "700"
  }
});
