import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type InfoCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  borderColor?: string;
  shadowColor?: string;
};

export function InfoCard({
  label,
  value,
  helper,
  icon,
  accentColor = "#D9447C",
  borderColor = "#F7D7E3",
  shadowColor = "#D9447C"
}: InfoCardProps) {
  return (
    <View style={[styles.card, { borderColor, shadowColor }]}>
      <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  label: {
    color: "#7B6871",
    fontSize: 13,
    fontWeight: "600"
  },
  value: {
    color: "#2E252A",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 5
  },
  helper: {
    color: "#9C8791",
    fontSize: 12,
    marginTop: 4
  }
});
