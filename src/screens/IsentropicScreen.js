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

function computeIsentropic({ mach, gamma }) {
  const temperatureRatio = 1 + ((gamma - 1) / 2) * mach ** 2;
  const pressureRatio = temperatureRatio ** (gamma / (gamma - 1));
  const densityRatio = temperatureRatio ** (1 / (gamma - 1));
  const areaRatioBase =
    ((2 / (gamma + 1)) * (1 + ((gamma - 1) / 2) * mach ** 2)) **
    ((gamma + 1) / (2 * (gamma - 1)));
  const areaRatio = areaRatioBase / mach;
  const machAngleRad = Math.asin(1 / mach);

  return {
    temperatureRatio: 1 / temperatureRatio,
    pressureRatio: 1 / pressureRatio,
    densityRatio: 1 / densityRatio,
    areaRatio,
    machAngleDeg: (machAngleRad * 180) / Math.PI,
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

export default function IsentropicScreen() {
  const [machInput, setMachInput] = useState(DEFAULT_MACH);
  const [gammaInput, setGammaInput] = useState(DEFAULT_GAMMA);
  const [scratchInput, setScratchInput] = useState("");
  const [scratchResult, setScratchResult] = useState(null);

  const { results, error } = useMemo(() => {
    const mach = Number.parseFloat(machInput);
    const gamma = Number.parseFloat(gammaInput);

    if (!Number.isFinite(mach) || mach <= 0) {
      return { error: "Mach number must be a positive value.", results: null };
    }
    if (!Number.isFinite(gamma) || gamma <= 1) {
      return { error: "Specific heat ratio (gamma) must be greater than 1.", results: null };
    }

    return { results: computeIsentropic({ mach, gamma }), error: null };
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
        <Text style={styles.title}>Isentropic Flow</Text>
        <Text style={styles.subtitle}>
          Enter a Mach number and specific heat ratio (gamma) to compute common ratios.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inputs</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mach number (M)</Text>
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
              <ResultRow
                label="T / T0"
                value={formatNumber(results.temperatureRatio)}
                onPress={() => handleRatioPress(results.temperatureRatio)}
              />
              <ResultRow
                label="P / P0"
                value={formatNumber(results.pressureRatio)}
                onPress={() => handleRatioPress(results.pressureRatio)}
              />
              <ResultRow
                label="ρ / ρ0"
                value={formatNumber(results.densityRatio)}
                onPress={() => handleRatioPress(results.densityRatio)}
              />
              <ResultRow label="A / A*" value={formatNumber(results.areaRatio)} />
              <ResultRow
                label="Mach angle"
                value={formatNumber(results.machAngleDeg)}
                unit="deg"
              />
            </View>
          ) : (
            <Text style={styles.mutedText}>Enter valid inputs to see results.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scratch Pad</Text>
          <Text style={styles.mutedText}>
            Tap a ratio above to start a multiplication. Then add your value and press Compute.
          </Text>
          <View style={styles.scratchRow}>
            <TextInput
              keyboardType="decimal-pad"
              value={scratchInput}
              onChangeText={setScratchInput}
              style={[styles.input, styles.scratchInput]}
              placeholder="e.g. 0.001*300"
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#4C566A",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFB",
  },
  errorText: {
    color: "#B42318",
    marginTop: 4,
    fontWeight: "600",
  },
  mutedText: {
    color: "#667085",
    marginBottom: 12,
  },
  scratchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scratchInput: {
    flex: 1,
  },
  equals: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: "600",
  },
  resultText: {
    minWidth: 80,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
});
