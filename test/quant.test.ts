import { describe, expect, it } from "vitest";
import { SAMPLE_WEIGHTS, meanAbsoluteError, modelSizeGb, quantizeWeights } from "../src/lib/quant";

describe("quantization math", () => {
  it("computes model size from params and bytes per parameter", () => {
    expect(modelSizeGb(7, "FP16")).toBe(14);
    expect(modelSizeGb(70, "INT8")).toBe(70);
    expect(modelSizeGb(7, "Q4")).toBe(3.5);
    expect(modelSizeGb(7, "Q2")).toBe(1.75);
  });

  it("limits bucket counts by target precision", () => {
    const weights = [-1, -0.5, 0, 0.5, 1];

    expect(quantizeWeights(weights, "Q2").buckets.length).toBeLessThanOrEqual(4);
    expect(quantizeWeights(weights, "Q4").buckets.length).toBeLessThanOrEqual(16);
    expect(quantizeWeights(weights, "INT8").buckets.length).toBeLessThanOrEqual(256);
  });

  it("preserves the total sample count across buckets", () => {
    const result = quantizeWeights(SAMPLE_WEIGHTS, "Q4");
    const total = result.buckets.reduce((sum, bucket) => sum + bucket.count, 0);

    expect(total).toBe(SAMPLE_WEIGHTS.length);
  });

  it("keeps quantization error monotonic as precision drops", () => {
    const fp16 = quantizeWeights(SAMPLE_WEIGHTS, "FP16").meanError;
    const int8 = quantizeWeights(SAMPLE_WEIGHTS, "INT8").meanError;
    const q4 = quantizeWeights(SAMPLE_WEIGHTS, "Q4").meanError;
    const q2 = quantizeWeights(SAMPLE_WEIGHTS, "Q2").meanError;

    expect(fp16).toBeLessThanOrEqual(int8);
    expect(int8).toBeLessThanOrEqual(q4);
    expect(q4).toBeLessThanOrEqual(q2);
  });

  it("computes mean absolute error for paired arrays", () => {
    expect(meanAbsoluteError([1, 2, 3], [1, 1, 5])).toBe(1);
  });
});
