export const AIR_A = 336.34;
export const AIR_B = 6.995;
export const GAMMA = 1.4;
export const PSIA_PER_MMHG = 0.0193368;

export function psiaToMmHg(psia) {
  return psia / PSIA_PER_MMHG;
}

export function mmHgToPsia(mmHg) {
  return mmHg * PSIA_PER_MMHG;
}

export function saturationPressureMmHg(T) {
  return 10 ** (-AIR_A / T + AIR_B);
}

export function isentropicPressureRatio(mach, gamma = GAMMA) {
  return (1 + ((gamma - 1) / 2) * mach ** 2) ** (-gamma / (gamma - 1));
}

export function isentropicTemperatureRatio(mach, gamma = GAMMA) {
  return (1 + ((gamma - 1) / 2) * mach ** 2) ** -1;
}

export function generateSaturationCurve({ tMin = 46, tMax = 125, points = 160 } = {}) {
  const data = [];
  for (let i = 0; i <= points; i += 1) {
    const T = tMin + ((tMax - tMin) * i) / points;
    data.push({ T, p: saturationPressureMmHg(T) });
  }
  return data;
}

export function generateIsentrope({
  p0MmHg,
  t0,
  machMin = 2.9,
  machMax = 7.0,
  points = 120,
  gamma = GAMMA,
} = {}) {
  const data = [];
  for (let i = 0; i <= points; i += 1) {
    const mach = machMin + ((machMax - machMin) * i) / points;
    const tRatio = isentropicTemperatureRatio(mach, gamma);
    const pRatio = isentropicPressureRatio(mach, gamma);
    data.push({
      mach,
      T: t0 * tRatio,
      p: p0MmHg * pRatio,
    });
  }
  return data;
}

export function interpolateByT(sortedData, targetT) {
  if (!sortedData.length) {
    return null;
  }
  if (targetT < sortedData[0].T || targetT > sortedData[sortedData.length - 1].T) {
    return null;
  }
  for (let i = 0; i < sortedData.length - 1; i += 1) {
    const left = sortedData[i];
    const right = sortedData[i + 1];
    if (targetT >= left.T && targetT <= right.T) {
      const fraction = (targetT - left.T) / (right.T - left.T || 1);
      return left.p + fraction * (right.p - left.p);
    }
  }
  return null;
}

export function interpolateMachByT(sortedData, targetT) {
  if (!sortedData.length) {
    return null;
  }
  if (targetT < sortedData[0].T || targetT > sortedData[sortedData.length - 1].T) {
    return null;
  }
  for (let i = 0; i < sortedData.length - 1; i += 1) {
    const left = sortedData[i];
    const right = sortedData[i + 1];
    if (targetT >= left.T && targetT <= right.T) {
      const fraction = (targetT - left.T) / (right.T - left.T || 1);
      return left.mach + fraction * (right.mach - left.mach);
    }
  }
  return null;
}

export function findIntersection({ saturation, isentrope }) {
  if (!saturation.length || !isentrope.length) {
    return null;
  }

  const sortedIsentrope = [...isentrope].sort((a, b) => a.T - b.T);
  let best = null;

  saturation.forEach((point) => {
    const pIsen = interpolateByT(sortedIsentrope, point.T);
    if (pIsen === null) {
      return;
    }
    const diff = pIsen - point.p;
    const absDiff = Math.abs(diff);
    if (!best || absDiff < best.absDiff) {
      best = {
        T: point.T,
        pSat: point.p,
        pIsen,
        absDiff,
        diff,
      };
    }
  });

  if (!best) {
    return null;
  }

  return {
    Tc: best.T,
    pSat: best.pSat,
    pIsen: best.pIsen,
    diff: best.diff,
  };
}

export function classifyRegion(intersection) {
  if (!intersection) {
    return "unknown";
  }
  return intersection.diff < 0 ? "condensation" : "vapor";
}

export function saturationTemperatureForPressure({ saturation, pTarget }) {
  if (!saturation.length) {
    return null;
  }
  const sorted = [...saturation].sort((a, b) => a.p - b.p);
  if (pTarget < sorted[0].p || pTarget > sorted[sorted.length - 1].p) {
    return null;
  }

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (pTarget >= left.p && pTarget <= right.p) {
      const fraction = (pTarget - left.p) / (right.p - left.p || 1);
      return left.T + fraction * (right.T - left.T);
    }
  }
  return null;
}

export function computeT0Min({ saturation, p0MmHg, mach, gamma = GAMMA }) {
  const pRatio = isentropicPressureRatio(mach, gamma);
  const tRatio = isentropicTemperatureRatio(mach, gamma);
  const pTarget = p0MmHg * pRatio;
  const tSat = saturationTemperatureForPressure({ saturation, pTarget });
  if (tSat === null) {
    return null;
  }
  return {
    tSat,
    t0Min: tSat / tRatio,
  };
}
