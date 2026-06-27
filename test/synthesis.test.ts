import { describe, expect, it } from "vitest";
import {
  STACK_REPLAY_STEPS,
  estimateConfig,
  predictedToken,
  promptCandidates,
} from "../src/lib/synthesis";

describe("prompt hook", () => {
  it("turns prompt context into stable ranked candidates", () => {
    const candidates = promptCandidates("Explain GPU cache");

    expect(candidates[0].probability).toBeGreaterThan(candidates[1].probability);
    expect(candidates.map((candidate) => candidate.id)).toContain("hardware");
  });

  it("boosts matching domains without changing the candidate set", () => {
    const cache = predictedToken("Why does decode cache help?");
    const weights = predictedToken("How do quantized weights fit?");

    expect(["cache", "decode"]).toContain(cache.id);
    expect(weights.id).toBe("weights");
  });
});

describe("full-stack synthesis helpers", () => {
  it("keeps replay steps in descent order", () => {
    expect(STACK_REPLAY_STEPS.map((step) => step.id)).toEqual([
      "text",
      "model",
      "numbers",
      "software",
      "hardware",
      "output",
    ]);
  });

  it("estimates model fit from weights, KV cache, overhead, and GPU memory", () => {
    const small = estimateConfig({
      contextLength: 4096,
      gpuId: "24gb",
      modelId: "7b",
      precision: "Q4",
    });
    const large = estimateConfig({
      contextLength: 4096,
      gpuId: "24gb",
      modelId: "70b",
      precision: "FP16",
    });

    expect(small.fits).toBe(true);
    expect(large.fits).toBe(false);
    expect(small.tokPerSecond).toBeGreaterThan(large.tokPerSecond);
  });
});
