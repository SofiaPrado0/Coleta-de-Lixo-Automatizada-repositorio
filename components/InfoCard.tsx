import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface InfoCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accentColor: string;
  borderColor: string;
  shadowColor: string;
}

export function InfoCard({
  label,
  value,
  helper,
  icon,
  accentColor,
  borderColor,
  shadowColor,
}: InfoCardProps) {
  return (
    <View style={[styles.card, { borderColor, shadowColor, borderLeftColor: accentColor }]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}15` }]}>
          <MaterialCommunityIcons name={icon} size={28} color={accentColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
          {helper && <Text style={styles.helper} numberOfLines={2}>{helper}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A6B63",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A2E23",
  },
  helper: {
    fontSize: 12,
    color: "#7C8E83",
    marginTop: 2,
  },
});
