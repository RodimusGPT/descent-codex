import { describe, expect, it } from "vitest";
import {
  type ServeRequest,
  activeSlotsByStep,
  averageWaitSteps,
  buildBlockTable,
  expectedAcceptedDraftTokens,
  expectedSpeculativeOutputTokens,
  pagedKvStats,
  prefixSharingSavings,
  scheduleBatchTimeline,
  speculativeDecodingEstimate,
} from "../src/lib/serving";

const REQUESTS = [
  { arrivalStep: 0, decodeSteps: 4, id: "a", label: "A", promptTokens: 24 },
  { arrivalStep: 1, decodeSteps: 3, id: "b", label: "B", promptTokens: 14 },
  { arrivalStep: 4, decodeSteps: 2, id: "c", label: "C", promptTokens: 8 },
] as const satisfies readonly ServeRequest[];

describe("batch scheduling", () => {
  it("admits continuous requests immediately", () => {
    const rows = scheduleBatchTimeline(REQUESTS, 8, 1);

    expect(rows.map((row) => row.waitSteps)).toEqual([0, 0, 0]);
    expect(activeSlotsByStep(rows, 4)).toEqual([1, 2, 2, 2]);
  });

  it("adds wait time when admission happens in coarse windows", () => {
    const rows = scheduleBatchTimeline(REQUESTS, 8, 3);

    expect(rows.map((row) => row.startStep)).toEqual([0, 3, 6]);
    expect(averageWaitSteps(rows)).toBeCloseTo(4 / 3);
  });
});

describe("paged KV cache", () => {
  it("builds logical to physical block mappings with tail waste", () => {
    expect(buildBlockTable(33, 16, 20)).toEqual([
      {
        logicalBlock: 0,
        physicalBlock: 20,
        tokenEnd: 16,
        tokenStart: 0,
        usedTokens: 16,
        wasteTokens: 0,
      },
      {
        logicalBlock: 1,
        physicalBlock: 21,
        tokenEnd: 32,
        tokenStart: 16,
        usedTokens: 16,
        wasteTokens: 0,
      },
      {
        logicalBlock: 2,
        physicalBlock: 22,
        tokenEnd: 33,
        tokenStart: 32,
        usedTokens: 1,
        wasteTokens: 15,
      },
    ]);
  });

  it("counts reserved tokens and sharing savings", () => {
    expect(pagedKvStats([33, 31], 16)).toEqual({
      allocatedTokens: 80,
      blockSize: 16,
      totalBlocks: 5,
      usedTokens: 64,
      wasteTokens: 16,
    });
    expect(prefixSharingSavings(3, 48, 16)).toEqual({
      blocksSaved: 6,
      sharedBlocks: 3,
      tokensSaved: 96,
    });
  });
});

describe("speculative decoding", () => {
  it("estimates accepted draft tokens geometrically", () => {
    expect(expectedAcceptedDraftTokens(4, 0.5)).toBeCloseTo(0.9375);
    expect(expectedSpeculativeOutputTokens(4, 0.5)).toBeCloseTo(1.875);
  });

  it("turns higher acceptance into better speedup", () => {
    const low = speculativeDecodingEstimate({
      acceptanceRate: 0.35,
      candidateTokens: 4,
      draftTokenMs: 10,
      targetTokenMs: 80,
      verifyPassMs: 85,
    });
    const high = speculativeDecodingEstimate({
      acceptanceRate: 0.85,
      candidateTokens: 4,
      draftTokenMs: 10,
      targetTokenMs: 80,
      verifyPassMs: 85,
    });

    expect(high.speedup).toBeGreaterThan(low.speedup);
    expect(high.expectedOutputTokens).toBeGreaterThan(low.expectedOutputTokens);
  });
});
