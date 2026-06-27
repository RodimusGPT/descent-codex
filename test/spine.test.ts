import { describe, expect, it } from "vitest";
import { PARTS } from "../src/lib/parts";
import { SANDBOXES } from "../src/lib/sandboxes";

describe("descent spine", () => {
  it("defines all six reachable parts in order", () => {
    expect(PARTS.map((part) => part.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(PARTS.map((part) => part.slug)).toEqual([
      "0-hook",
      "1-transformer",
      "2-weights",
      "3-software",
      "4-hardware",
      "5-synthesis",
    ]);
  });

  it("defines review sandboxes in milestone order", () => {
    expect(SANDBOXES.map((sandbox) => sandbox.path)).toEqual([
      "/dev/prompt-token",
      "/dev/tokenizer",
      "/dev/embedding",
      "/dev/stack",
      "/dev/attention",
      "/dev/qkv",
      "/dev/moe",
      "/dev/sampling",
      "/dev/weight-zoom",
      "/dev/float",
      "/dev/quant",
      "/dev/memory-budget",
      "/dev/prefill",
      "/dev/batching",
      "/dev/paged-attention",
      "/dev/speculative",
      "/dev/gpu-floorplan",
      "/dev/gemm-tiling",
      "/dev/flash-attention",
      "/dev/roofline",
      "/dev/parallelism",
      "/dev/full-stack",
      "/dev/config",
    ]);
    expect(SANDBOXES.map((sandbox) => sandbox.part)).toEqual([
      0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5,
    ]);
  });
});
