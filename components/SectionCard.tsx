import { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type SectionCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  accentColor?: string;
  borderColor?: string;
  shadowColor?: string;
};

export function SectionCard({
  title,
  icon,
  children,
  accentColor = "#D9447C",
  borderColor = "#F7D7E3",
  shadowColor = "#D9447C"
}: SectionCardProps) {
  return (
    <View style={[styles.card, { borderColor, shadowColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon} size={19} color={accentColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: "#7B6871",
    fontSize: 14,
    fontWeight: "700"
  }
});
