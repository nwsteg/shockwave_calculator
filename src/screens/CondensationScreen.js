import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import {
  classifyRegion,
  computeT0Min,
  generateIsentrope,
  generateSaturationCurve,
  interpolateMachByT,
  isentropicPressureRatio,
  isentropicTemperatureRatio,
  findIntersection,
  psiaToMmHg,
} from "../utils/condensation";

const DEFAULT_P0 = "350";
const DEFAULT_T0 = "300";
const DEFAULT_MACH_MIN = "2.9";
const DEFAULT_MACH_MAX = "7.2";
const DEFAULT_MACH_STAR = "5.0";

const MACH_MARKERS = [3, 4, 5, 6, 7];

function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

function buildLinePath(points, scaleX, scaleY) {
  return points
    .map((point, index) => {
      const x = scaleX(point.T);
      const y = scaleY(point.p);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getLogTicks(minValue, maxValue) {
  const minLog = Math.floor(Math.log10(minValue));
  const maxLog = Math.ceil(Math.log10(maxValue));
  const ticks = [];
  for (let exponent = minLog; exponent <= maxLog; exponent += 1) {
    ticks.push(10 ** exponent);
  }
  return ticks;
}

export default function CondensationScreen() {
  const [p0Input, setP0Input] = useState(DEFAULT_P0);
  const [t0Input, setT0Input] = useState(DEFAULT_T0);
  const [machMinInput, setMachMinInput] = useState(DEFAULT_MACH_MIN);
  const [machMaxInput, setMachMaxInput] = useState(DEFAULT_MACH_MAX);
  const [machStarInput, setMachStarInput] = useState(DEFAULT_MACH_STAR);
  const [showMarkers, setShowMarkers] = useState(true);

  const saturation = useMemo(() => generateSaturationCurve(), []);

  const derived = useMemo(() => {
    const p0 = Number.parseFloat(p0Input);
    const t0 = Number.parseFloat(t0Input);
    const machMin = Number.parseFloat(machMinInput);
    const machMax = Number.parseFloat(machMaxInput);
    const machStar = Number.parseFloat(machStarInput);

    if (!Number.isFinite(p0) || p0 <= 0) {
      return { error: "p0 must be a positive value.", data: null };
    }
    if (!Number.isFinite(t0) || t0 <= 0) {
      return { error: "T0 must be a positive value.", data: null };
    }
    if (!Number.isFinite(machMin) || !Number.isFinite(machMax) || machMin <= 1 || machMax <= machMin) {
      return { error: "Mach range must be valid and greater than 1.", data: null };
    }
    if (!Number.isFinite(machStar) || machStar <= 1) {
      return { error: "M* must be greater than 1.", data: null };
    }

    const p0MmHg = psiaToMmHg(p0);
    const isentrope = generateIsentrope({ p0MmHg, t0, machMin, machMax });
    const intersection = findIntersection({ saturation, isentrope });
    const region = classifyRegion(intersection);
    const t0Min = computeT0Min({ saturation, p0MmHg, mach: machStar });

    return {
      error: null,
      data: {
        p0,
        t0,
        p0MmHg,
        machMin,
        machMax,
        machStar,
        isentrope,
        intersection,
        region,
        t0Min,
      },
    };
  }, [p0Input, t0Input, machMinInput, machMaxInput, machStarInput, saturation]);

  const chart = useMemo(() => {
    if (!derived.data) {
      return null;
    }
    const allPoints = [...saturation, ...derived.data.isentrope];
    const tValues = allPoints.map((point) => point.T);
    const pValues = allPoints.map((point) => point.p);

    const tMin = Math.min(...tValues);
    const tMax = Math.max(...tValues);
    const pMin = Math.min(...pValues);
    const pMax = Math.max(...pValues);

    return {
      tMin,
      tMax,
      pMin,
      pMax,
      ticks: getLogTicks(pMin, pMax),
    };
  }, [derived.data, saturation]);

  const width = Dimensions.get("window").width - 32;
  const height = 230;
  const padding = { top: 20, right: 20, bottom: 40, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const scaleX = (value) => {
    if (!chart) {
      return padding.left;
    }
    return padding.left + ((value - chart.tMin) / (chart.tMax - chart.tMin)) * plotWidth;
  };
  const scaleY = (value) => {
    if (!chart) {
      return padding.top;
    }
    const logMin = Math.log10(chart.pMin);
    const logMax = Math.log10(chart.pMax);
    const logValue = Math.log10(value);
    return padding.top + (1 - (logValue - logMin) / (logMax - logMin)) * plotHeight;
  };

  const isentropePath = derived.data ? buildLinePath(derived.data.isentrope, scaleX, scaleY) : "";
  const saturationPath = buildLinePath(saturation, scaleX, scaleY);

  const markerPoints = derived.data
    ? MACH_MARKERS.map((mach) => {
        if (mach < derived.data.machMin || mach > derived.data.machMax) {
          return null;
        }
        const tRatio = isentropicTemperatureRatio(mach);
        const pRatio = isentropicPressureRatio(mach);
        return {
          mach,
          T: derived.data.t0 * tRatio,
          p: derived.data.p0MmHg * pRatio,
        };
      }).filter(Boolean)
    : [];

  const intersectionMach = useMemo(() => {
    if (!derived.data?.intersection) {
      return null;
    }
    const sortedIsentrope = [...derived.data.isentrope].sort((a, b) => a.T - b.T);
    return interpolateMachByT(sortedIsentrope, derived.data.intersection.Tc);
  }, [derived.data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Condensation</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inputs</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>p0 (psia)</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={p0Input}
                onChangeText={setP0Input}
                style={styles.input}
                placeholder="e.g. 14.7"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>T0 (K)</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={t0Input}
                onChangeText={setT0Input}
                style={styles.input}
                placeholder="e.g. 220"
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mach min</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={machMinInput}
                onChangeText={setMachMinInput}
                style={styles.input}
                placeholder="2.9"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mach max</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={machMaxInput}
                onChangeText={setMachMaxInput}
                style={styles.input}
                placeholder="7.0"
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>M* (for T0 min)</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={machStarInput}
                onChangeText={setMachStarInput}
                style={styles.input}
                placeholder="5.0"
              />
            </View>
            <View style={styles.switchGroup}>
              <Text style={styles.inputLabel}>Show Mach markers</Text>
              <Switch value={showMarkers} onValueChange={setShowMarkers} />
            </View>
          </View>
          {derived.error ? <Text style={styles.errorText}>{derived.error}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Equilibrium Vapor Pressure of Air</Text>
          <View style={styles.chartContainer}>
            {chart ? (
              <Svg width={width} height={height}>
                {chart.ticks.map((tick) => (
                  <Line
                    key={`grid-${tick}`}
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={scaleY(tick)}
                    y2={scaleY(tick)}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />
                ))}
                <Line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={height - padding.bottom}
                  y2={height - padding.bottom}
                  stroke="#9CA3AF"
                  strokeWidth={1}
                />
                <Line
                  x1={padding.left}
                  x2={padding.left}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  stroke="#9CA3AF"
                  strokeWidth={1}
                />
                <Path d={saturationPath} stroke="#6B7280" strokeWidth={2} fill="none" />
                {derived.data && (
                  <Path d={isentropePath} stroke="#2563EB" strokeWidth={2} fill="none" />
                )}
                {showMarkers &&
                  markerPoints.map((point) => (
                    <Circle
                      key={`mach-${point.mach}`}
                      cx={scaleX(point.T)}
                      cy={scaleY(point.p)}
                      r={3}
                      fill="#1D4ED8"
                    />
                  ))}
                {chart.ticks.map((tick) => (
                  <SvgText
                    key={`tick-${tick}`}
                    x={padding.left - 6}
                    y={scaleY(tick) + 4}
                    fontSize={10}
                    textAnchor="end"
                    fill="#6B7280"
                  >
                    {tick >= 1 ? tick.toFixed(0) : tick.toExponential(0)}
                  </SvgText>
                ))}
                <SvgText
                  x={width / 2}
                  y={height - 8}
                  fontSize={11}
                  textAnchor="middle"
                  fill="#6B7280"
                >
                  Temperature (K)
                </SvgText>
                <SvgText
                  x={14}
                  y={height / 2}
                  fontSize={11}
                  textAnchor="middle"
                  fill="#6B7280"
                  rotation={-90}
                  origin={`${14},${height / 2}`}
                >
                  Vapor Pressure (mmHg)
                </SvgText>
              </Svg>
            ) : (
              <Text style={styles.mutedText}>Enter valid inputs to render the plot.</Text>
            )}
          </View>
          {derived.data?.intersection ? (
            <Text style={styles.legendText}>
              p0 = {formatNumber(derived.data.p0, 2)} psia · Mc ≈
              {intersectionMach ? ` ${formatNumber(intersectionMach, 2)}` : " -"} · Tc ≈
              {formatNumber(derived.data.intersection.Tc, 1)} K
            </Text>
          ) : null}
          {derived.data ? (
            <Text style={styles.legendText}>Region: {derived.data.region}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Derived values</Text>
          {derived.data ? (
            <View>
              <Text style={styles.valueRow}>p0 = {formatNumber(derived.data.p0MmHg, 2)} mmHg</Text>
              {derived.data.intersection ? (
                <Text style={styles.valueRow}>
                  Tc ≈ {formatNumber(derived.data.intersection.Tc, 1)} K, Pc ≈
                  {formatNumber(derived.data.intersection.pSat, 2)} mmHg
                </Text>
              ) : (
                <Text style={styles.valueRow}>No intersection within plotted range.</Text>
              )}
              {derived.data.t0Min ? (
              <Text style={styles.valueRow}>
                T0 min @ M*={formatNumber(derived.data.machStar, 1)} ≈
                {formatNumber(derived.data.t0Min.t0Min, 1)} K (T_sat ≈
                {formatNumber(derived.data.t0Min.tSat, 1)} K @ p = p0·(p/p0)M*)
              </Text>
              ) : (
                <Text style={styles.valueRow}>T0 min unavailable for this M* and p0.</Text>
              )}
            </View>
          ) : (
            <Text style={styles.mutedText}>Enter valid inputs to compute results.</Text>
          )}
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
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
  switchGroup: {
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    color: "#B42318",
    marginTop: 4,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
  },
  legendText: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 6,
  },
  valueRow: {
    fontSize: 13,
    color: "#1F2937",
    marginBottom: 6,
  },
  mutedText: {
    color: "#667085",
  },
});
