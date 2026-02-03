import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ResultRow from "../components/ResultRow";

const DEFAULT_GAMMA = "1.4";
const DEFAULT_MACH = "2.0";

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(4);
}

function computeNormalShock({ mach, gamma }) {
  const machSquared = mach ** 2;
  const numerator = 1 + ((gamma - 1) / 2) * machSquared;
  const denominator = gamma * machSquared - (gamma - 1) / 2;
  const mach2 = Math.sqrt(numerator / denominator);

  const pressureRatio = 1 + (2 * gamma / (gamma + 1)) * (machSquared - 1);
  const densityRatio = ((gamma + 1) * machSquared) / ((gamma - 1) * machSquared + 2);
  const temperatureRatio = pressureRatio / densityRatio;

  const term1 = ((gamma + 1) / 2) * machSquared;
  const term2 = 1 + ((gamma - 1) / 2) * machSquared;
  const totalPressureRatio =
    (term1 / term2) ** (gamma / (gamma - 1)) *
    ((gamma + 1) / (2 * gamma * machSquared - (gamma - 1))) ** (1 / (gamma - 1));

  const totalPressureToStatic1 = term2 ** (gamma / (gamma - 1));
  const staticToTotal2 = 1 / (totalPressureRatio * totalPressureToStatic1);

  return {
    mach2,
    pressureRatio,
    densityRatio,
    temperatureRatio,
    totalPressureRatio,
    staticToTotal2,
  };
}

function parseScratchExpression(expression) {
  const sanitized = expression.replace(/\s+/g, "");
  if (!sanitized) {
    return null;
  }

  const parts = sanitized.split("*");
  if (parts.length === 1) {
    const value = Number.parseFloat(parts[0]);
    return Number.isFinite(value) ? value : null;
  }

  if (parts.length === 2) {
    const left = Number.parseFloat(parts[0]);
    const right = Number.parseFloat(parts[1]);
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return null;
    }
    return left * right;
  }

  return null;
}

export default function NormalShockScreen() {
  const [machInput, setMachInput] = useState(DEFAULT_MACH);
  const [gammaInput, setGammaInput] = useState(DEFAULT_GAMMA);
  const [scratchInput, setScratchInput] = useState("");
  const [scratchResult, setScratchResult] = useState(null);

  const { results, error } = useMemo(() => {
    const mach = Number.parseFloat(machInput);
    const gamma = Number.parseFloat(gammaInput);

    if (!Number.isFinite(mach) || mach <= 1) {
      return { error: "Upstream Mach number must be greater than 1.", results: null };
    }
    if (!Number.isFinite(gamma) || gamma <= 1) {
      return { error: "Specific heat ratio (gamma) must be greater than 1.", results: null };
    }

    return { results: computeNormalShock({ mach, gamma }), error: null };
  }, [machInput, gammaInput]);

  const handleRatioPress = (value) => {
    if (!Number.isFinite(value)) {
      return;
    }
    setScratchInput(`${value.toFixed(4)}*`);
    setScratchResult(null);
  };

  const handleClear = () => {
    setScratchInput("");
    setScratchResult(null);
  };

  const handleCompute = () => {
    const computed = parseScratchExpression(scratchInput);
    setScratchResult(computed);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Normal Shock</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inputs</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Upstream Mach (M1)</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={machInput}
              onChangeText={setMachInput}
              style={styles.input}
              placeholder="e.g. 2.0"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gamma (γ)</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={gammaInput}
              onChangeText={setGammaInput}
              style={styles.input}
              placeholder="e.g. 1.4"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Results</Text>
          {results ? (
            <View>
              <ResultRow label="M2" value={formatNumber(results.mach2)} />
              <ResultRow
                label="P2 / P1"
                value={formatNumber(results.pressureRatio)}
                onPress={() => handleRatioPress(results.pressureRatio)}
              />
              <ResultRow
                label="ρ2 / ρ1"
                value={formatNumber(results.densityRatio)}
                onPress={() => handleRatioPress(results.densityRatio)}
              />
              <ResultRow
                label="T2 / T1"
                value={formatNumber(results.temperatureRatio)}
                onPress={() => handleRatioPress(results.temperatureRatio)}
              />
              <ResultRow
                label="P02 / P01"
                value={formatNumber(results.totalPressureRatio)}
                onPress={() => handleRatioPress(results.totalPressureRatio)}
              />
              <ResultRow
                label="P1 / P02"
                value={formatNumber(results.staticToTotal2)}
                onPress={() => handleRatioPress(results.staticToTotal2)}
              />
            </View>
          ) : (
            <Text style={styles.mutedText}>Enter valid inputs to see results.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scratch Pad</Text>
          <View style={styles.scratchRow}>
            <TextInput
              keyboardType="decimal-pad"
              value={scratchInput}
              onChangeText={setScratchInput}
              style={[styles.input, styles.scratchInput]}
              placeholder="e.g. 2.1000*300"
            />
            <Text style={styles.equals}>=</Text>
            <Text style={styles.resultText}>
              {scratchResult === null ? "-" : formatNumber(scratchResult)}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleClear}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCompute}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Compute</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
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
  errorText: {
    color: "#B42318",
    marginTop: 4,
    fontWeight: "600",
  },
  mutedText: {
    color: "#667085",
  },
  scratchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scratchInput: {
    flex: 1,
  },
  equals: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  resultText: {
    minWidth: 72,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
});
