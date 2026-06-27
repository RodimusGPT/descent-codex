import { describe, expect, it } from "vitest";
import {
  EXPERTS,
  SAMPLING_CANDIDATES,
  candidateProbabilities,
  dot,
  filterCandidates,
  routeExperts,
  scaledDotScores,
  softmax,
  tokenizeText,
} from "../src/lib/transformer";

describe("tokenizeText", () => {
  it("splits words, plural suffixes, and punctuation into stable token pieces", () => {
    expect(tokenizeText("Keys decode.").map((token) => token.text)).toEqual([
      "key",
      "##s",
      "decode",
      ".",
    ]);
  });

  it("assigns stable numeric ids", () => {
    expect(tokenizeText("GPU")[0].id).toBe(tokenizeText("gpu")[0].id);
  });
});

describe("transformer math helpers", () => {
  it("computes dot products and scaled QK scores", () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(
      scaledDotScores(
        [1, 0],
        [
          [1, 0],
          [0, 1],
        ],
      )[0],
    ).toBeCloseTo(1 / Math.sqrt(2));
  });

  it("returns normalized softmax probabilities", () => {
    const probabilities = softmax([1, 2, 3]);
    expect(probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
    expect(probabilities[2]).toBeGreaterThan(probabilities[0]);
  });

  it("routes only top-k experts as active", () => {
    const routes = routeExperts([0.2, 0.9, 0.4], EXPERTS, 2);
    expect(routes.filter((route) => route.active)).toHaveLength(2);
    expect(routes[0].score).toBeGreaterThanOrEqual(routes[1].score);
  });

  it("temperature changes candidate probability sharpness", () => {
    const cold = candidateProbabilities(SAMPLING_CANDIDATES, 0.5);
    const hot = candidateProbabilities(SAMPLING_CANDIDATES, 1.8);
    expect(cold[0].probability).toBeGreaterThan(hot[0].probability);
  });

  it("applies top-k and top-p filtering", () => {
    const probabilities = candidateProbabilities(SAMPLING_CANDIDATES, 1);
    expect(filterCandidates(probabilities, 2, 1)).toHaveLength(2);
    expect(filterCandidates(probabilities, 5, 0.75).length).toBeLessThan(5);
  });
});
