import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SectionCardProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
  accentColor: string;
  borderColor: string;
  shadowColor: string;
}

export function SectionCard({
  title,
  icon,
  children,
  accentColor,
  borderColor,
  shadowColor,
}: SectionCardProps) {
  return (
    <View style={[styles.card, { borderColor, shadowColor }]}>
      <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  topAccent: {
    height: 4,
    width: "100%",
  },
  inner: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  content: {
    gap: 12,
  },
});
