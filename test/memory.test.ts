import { describe, expect, it } from "vitest";
import {
  decodeWorkUnits,
  formatBytes,
  gqaSavingsRatio,
  kvCacheBytes,
  prefillDecodeWork,
  weightMemoryBytes,
} from "../src/lib/memory";

describe("memory formulas", () => {
  it("computes KV cache bytes from the standard formula", () => {
    expect(
      kvCacheBytes({
        bytesPerValue: 2,
        headDim: 128,
        nKvHeads: 8,
        nLayers: 32,
        seqLen: 1024,
      }),
    ).toBe(2 * 32 * 8 * 128 * 1024 * 2);
  });

  it("computes weight memory from params and bytes per parameter", () => {
    expect(weightMemoryBytes(7, 2)).toBe(14_000_000_000);
    expect(weightMemoryBytes(7, 0.5)).toBe(3_500_000_000);
  });

  it("shows GQA savings as the KV-head reduction ratio", () => {
    expect(gqaSavingsRatio(32, 8)).toBe(4);
    expect(gqaSavingsRatio(32, 1)).toBe(32);
  });

  it("formats byte readouts for the UI", () => {
    expect(formatBytes(1024 ** 2)).toBe("1.00 MiB");
    expect(formatBytes(2 * 1024 ** 3)).toBe("2.00 GiB");
  });
});

describe("prefill/decode work counters", () => {
  it("keeps cached decode linear in generated tokens", () => {
    expect(decodeWorkUnits(0, 20, true) / decodeWorkUnits(0, 10, true)).toBe(2);
  });

  it("makes no-cache recompute grow quadratically", () => {
    const ten = decodeWorkUnits(0, 10, false);
    const twenty = decodeWorkUnits(0, 20, false);

    expect(twenty / ten).toBeGreaterThan(3.5);
  });

  it("combines prefill and decode work", () => {
    expect(prefillDecodeWork(32, 4, true)).toEqual({
      decodeWork: 4,
      prefillWork: 32,
      totalWork: 36,
    });
  });
});
