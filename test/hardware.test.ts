import { describe, expect, it } from "vitest";
import {
  attentionTrafficBytes,
  decodeArithmeticIntensity,
  formatBytesCompact,
  gemmTileGrid,
  parallelismPlan,
  rooflinePoint,
} from "../src/lib/hardware";

const HARDWARE = {
  bandwidthTbps: 2,
  id: "test",
  label: "Test GPU",
  peakTflops: 20,
};

describe("roofline math", () => {
  it("raises decode arithmetic intensity with batch size", () => {
    expect(decodeArithmeticIntensity(8, 0.75)).toBeCloseTo(decodeArithmeticIntensity(1, 0.75) * 8);
  });

  it("maps points from memory-bound to compute-bound at the ridge", () => {
    const smallBatch = rooflinePoint(2, HARDWARE, 1);
    const largeBatch = rooflinePoint(16, HARDWARE, 1);

    expect(smallBatch.ridgePoint).toBe(10);
    expect(smallBatch.bottleneck).toBe("memory");
    expect(largeBatch.bottleneck).toBe("compute");
    expect(largeBatch.attainableTflops).toBe(HARDWARE.peakTflops);
  });
});

describe("hardware visual helpers", () => {
  it("tiles GEMMs without losing edge tiles", () => {
    expect(gemmTileGrid(130, 257, 64)).toEqual({
      cols: 5,
      rows: 3,
      tileCount: 15,
      tileSize: 64,
    });
  });

  it("keeps FlashAttention traffic below naive materialization", () => {
    const short = attentionTrafficBytes(128, 64, 2);
    const long = attentionTrafficBytes(256, 64, 2);

    expect(short.flashBytes).toBeLessThan(short.naiveBytes);
    expect(long.naiveBytes / short.naiveBytes).toBeGreaterThan(long.flashBytes / short.flashBytes);
  });

  it("generates communication plans by parallelism mode", () => {
    expect(parallelismPlan("tp", 2).map((step) => step.traffic)).toEqual([
      "all-reduce",
      "all-reduce",
    ]);
    expect(parallelismPlan("ep", 3).map((step) => step.traffic)).toEqual([
      "all-to-all",
      "all-to-all",
      "all-to-all",
    ]);
  });

  it("formats compact byte readouts", () => {
    expect(formatBytesCompact(1024 ** 2)).toBe("1.0 MiB");
    expect(formatBytesCompact(2 * 1024 ** 3)).toBe("2.00 GiB");
  });
});
