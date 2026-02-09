import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../utils/ProfileContext";

export default function ProfileScreen() {
  const { profile, setProfile } = useProfile();

  const updateField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile Defaults</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reference Conditions</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Total pressure (P0)</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={profile.p0}
              onChangeText={(value) => updateField("p0", value)}
              style={styles.input}
              placeholder="e.g. 101325"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Total temperature (T0)</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={profile.t0}
              onChangeText={(value) => updateField("t0", value)}
              style={styles.input}
              placeholder="e.g. 288"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Default Mach number</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={profile.mach}
              onChangeText={(value) => updateField("mach", value)}
              style={styles.input}
              placeholder="e.g. 2.0"
            />
          </View>
          <Text style={styles.helperText}>
            Ratio rows will multiply by these defaults when you tap a pressure or temperature
            ratio.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFB",
  },
  helperText: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4,
  },
});
