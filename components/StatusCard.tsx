import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatusCardProps {
  status: "online" | "offline";
  updatedAt: Date | null;
  borderColor: string;
  shadowColor: string;
}

export function StatusCard({
  status,
  updatedAt,
  borderColor,
  shadowColor,
}: StatusCardProps) {
  const isOnline = status === "online";
  const bgColor = isOnline ? "#F0FDF4" : "#FEF2F2";
  const statusColor = isOnline ? "#1B9C5A" : "#C0392B";
  const iconName = isOnline ? "recycle" : "wifi-off";

  const timeString = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Nunca";

  return (
    <View style={[styles.card, { borderColor, shadowColor, backgroundColor: bgColor }]}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={32} color={statusColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isOnline ? "SISTEMA ONLINE" : "SISTEMA OFFLINE"}
          </Text>
          <Text style={styles.timeText}>
            Ultima atualizacao: {timeString}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: "#5A6B63",
    fontWeight: "500",
  },
});
