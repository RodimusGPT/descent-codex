import { describe, expect, it } from "vitest";
import { COLOR, weightToColor } from "../src/lib/encoding";

describe("weightToColor", () => {
  it("maps the low end to inert", () => {
    expect(weightToColor(0)).toBe(COLOR.inert);
    expect(weightToColor(-1)).toBe(COLOR.inert);
  });

  it("maps the high end to active strong", () => {
    expect(weightToColor(1)).toBe(COLOR.activeStrong);
    expect(weightToColor(2)).toBe(COLOR.activeStrong);
  });

  it("returns a stable intermediate color", () => {
    expect(weightToColor(0.5)).toMatch(/^#[0-9a-f]{6}$/);
    expect(weightToColor(0.5)).not.toBe(COLOR.inert);
    expect(weightToColor(0.5)).not.toBe(COLOR.activeStrong);
  });
});
