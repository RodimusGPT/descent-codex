import { describe, expect, it } from "vitest";
import {
  ATTENTION_HEADS,
  ATTENTION_TOKENS,
  attentionPath,
  attentionStrokeForWeight,
  tokenX,
  weightToGeometry,
} from "../src/lib/attention-data";
import { COLOR, weightToColor } from "../src/lib/encoding";

describe("attention data", () => {
  it("uses square matrices matching the token count", () => {
    for (const head of ATTENTION_HEADS) {
      expect(head.matrix).toHaveLength(ATTENTION_TOKENS.length);

      for (const row of head.matrix) {
        expect(row).toHaveLength(ATTENTION_TOKENS.length);
      }
    }
  });

  it("normalizes every query row", () => {
    for (const head of ATTENTION_HEADS) {
      for (const row of head.matrix) {
        const total = row.reduce((sum, value) => sum + value, 0);
        expect(total).toBeCloseTo(1, 8);
      }
    }
  });

  it("keeps the previous-token head strongest on the preceding token", () => {
    const previous = ATTENTION_HEADS.find((head) => head.id === "previous");
    expect(previous).toBeDefined();

    const row = previous?.matrix[4] ?? [];
    const strongestKey = row.indexOf(Math.max(...row));

    expect(strongestKey).toBe(3);
  });
});

describe("attention geometry", () => {
  it("derives line geometry monotonically from weight", () => {
    const low = weightToGeometry(0.1);
    const high = weightToGeometry(0.8);

    expect(high.opacity).toBeGreaterThan(low.opacity);
    expect(high.width).toBeGreaterThan(low.width);
  });

  it("clamps geometry outside the weight range", () => {
    expect(weightToGeometry(-1)).toEqual(weightToGeometry(0));
    expect(weightToGeometry(2)).toEqual(weightToGeometry(1));
  });

  it("positions tokens left to right inside the view box", () => {
    expect(tokenX(0, ATTENTION_TOKENS.length)).toBeLessThan(
      tokenX(ATTENTION_TOKENS.length - 1, ATTENTION_TOKENS.length),
    );
  });

  it("returns a stable path for self and cross attention", () => {
    expect(attentionPath(2, 2, ATTENTION_TOKENS.length)).toContain("C");
    expect(attentionPath(2, 5, ATTENTION_TOKENS.length)).toContain("M");
  });

  it("uses the shared color encoder for strokes", () => {
    expect(attentionStrokeForWeight(1).color).toBe(weightToColor(1));
    expect(attentionStrokeForWeight(1).color).toBe(COLOR.activeStrong);
  });
});
