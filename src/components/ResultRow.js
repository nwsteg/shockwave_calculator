import { StyleSheet, Text, View } from "react-native";

export default function ResultRow({ label, value, unit }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value} {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
