export type PrecisionId = "FP16" | "INT8" | "Q4" | "Q2";

export type PrecisionSpec = {
  bits: number;
  bytesPerParam: number;
  id: PrecisionId;
  label: string;
};

export type QuantBucket = {
  count: number;
  level: number;
};

export type QuantizationResult = {
  absMax: number;
  buckets: QuantBucket[];
  meanError: number;
  modelSizeGb: number;
  precision: PrecisionId;
  qualityScore: number;
  quantized: number[];
};

export const PRECISION_SPECS = {
  FP16: {
    bits: 16,
    bytesPerParam: 2,
    id: "FP16",
    label: "FP16",
  },
  INT8: {
    bits: 8,
    bytesPerParam: 1,
    id: "INT8",
    label: "INT8",
  },
  Q4: {
    bits: 4,
    bytesPerParam: 0.5,
    id: "Q4",
    label: "Q4",
  },
  Q2: {
    bits: 2,
    bytesPerParam: 0.25,
    id: "Q2",
    label: "Q2",
  },
} as const satisfies Record<PrecisionId, PrecisionSpec>;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const createWeightDistribution = (count = 384) => {
  let seed = 0x5eed1234;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  return Array.from({ length: count }, () => {
    const first = Math.max(random(), Number.EPSILON);
    const second = random();
    const gaussian = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    const shoulder = random() > 0.86 ? (random() - 0.5) * 1.6 : 0;
    return gaussian * 0.42 + shoulder;
  });
};

export const SAMPLE_WEIGHTS = createWeightDistribution();

export const getPrecisionSpec = (precision: PrecisionId) => PRECISION_SPECS[precision];

export const modelSizeGb = (paramsBillions: number, precision: PrecisionId) =>
  paramsBillions * getPrecisionSpec(precision).bytesPerParam;

const quantizeValue = (value: number, absMax: number, precision: PrecisionId) => {
  if (precision === "FP16" || absMax === 0) {
    return value;
  }

  const levels = 2 ** getPrecisionSpec(precision).bits;
  const step = (absMax * 2) / (levels - 1);

  return Math.round((value + absMax) / step) * step - absMax;
};

const bucketQuantizedValues = (quantized: readonly number[]): QuantBucket[] => {
  const counts = new Map<string, QuantBucket>();

  for (const value of quantized) {
    const key = value.toFixed(5);
    const current = counts.get(key);

    if (current) {
      current.count += 1;
    } else {
      counts.set(key, {
        count: 1,
        level: Number(key),
      });
    }
  }

  return [...counts.values()].sort((left, right) => left.level - right.level);
};

export const meanAbsoluteError = (actual: readonly number[], approximated: readonly number[]) => {
  if (actual.length !== approximated.length) {
    throw new RangeError("Cannot compare arrays with different lengths");
  }

  return (
    actual.reduce((sum, value, index) => sum + Math.abs(value - approximated[index]), 0) /
    Math.max(1, actual.length)
  );
};

export const qualityProxyScore = (meanError: number, absMax: number) => {
  if (absMax === 0) {
    return 100;
  }

  return Math.round(clamp01(1 - (meanError / absMax) * 8) * 100);
};

export const quantizeWeights = (
  weights: readonly number[],
  precision: PrecisionId,
  paramsBillions = 7,
): QuantizationResult => {
  const absMax = Math.max(...weights.map((weight) => Math.abs(weight)), 0);
  const quantized = weights.map((weight) => quantizeValue(weight, absMax, precision));
  const meanError = meanAbsoluteError(weights, quantized);

  return {
    absMax,
    buckets: bucketQuantizedValues(quantized),
    meanError,
    modelSizeGb: modelSizeGb(paramsBillions, precision),
    precision,
    qualityScore: qualityProxyScore(meanError, absMax),
    quantized,
  };
};
