import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ResultRow({ label, value, unit, onPress }) {
  const RowComponent = onPress ? TouchableOpacity : View;

  return (
    <RowComponent
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value} {unit}
      </Text>
    </RowComponent>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
});
