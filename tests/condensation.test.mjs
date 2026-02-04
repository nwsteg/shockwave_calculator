import assert from "node:assert/strict";
import {
  generateIsentrope,
  generateSaturationCurve,
  findIntersection,
  computeT0Min,
  isentropicPressureRatio,
  isentropicTemperatureRatio,
  psiaToMmHg,
} from "../src/utils/condensation.js";

const saturation = generateSaturationCurve();

const p0 = 14.7;
const t0 = 220;
const p0MmHg = psiaToMmHg(p0);
const isentrope = generateIsentrope({ p0MmHg, t0, machMin: 2.9, machMax: 7.0 });

assert.ok(saturation.length > 0, "Saturation curve should have points");
assert.ok(isentrope.length > 0, "Isentrope curve should have points");

const intersection = findIntersection({ saturation, isentrope });
assert.ok(intersection, "Intersection should be found for default ranges");
assert.ok(intersection.Tc > 0, "Intersection temperature should be positive");
assert.ok(intersection.pSat > 0, "Intersection pressure should be positive");

const mach = 5;
const pRatio = isentropicPressureRatio(mach);
const tRatio = isentropicTemperatureRatio(mach);
assert.ok(pRatio > 0 && pRatio < 1, "Pressure ratio should be between 0 and 1");
assert.ok(tRatio > 0 && tRatio < 1, "Temperature ratio should be between 0 and 1");

const t0Min = computeT0Min({ saturation, p0MmHg, mach });
assert.ok(t0Min, "T0 minimum should be computed");
assert.ok(t0Min.t0Min > 0, "T0 minimum should be positive");

console.log("Condensation utilities: all tests passed.");
