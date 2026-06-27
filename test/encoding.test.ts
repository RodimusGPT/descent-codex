import { describe, expect, it } from "vitest";
import { COLOR, DARK_COLOR, LIGHT_COLOR, weightToColor } from "../src/lib/encoding";

const channelToLinear = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) => {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const red = channelToLinear((value >> 16) & 255);
  const green = channelToLinear((value >> 8) & 255);
  const blue = channelToLinear(value & 255);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrastRatio = (foreground: string, background: string) => {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));

  return (light + 0.05) / (dark + 0.05);
};

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

describe("palette contrast", () => {
  it("keeps core light and dark semantic pairs above AA contrast", () => {
    const pairs = [
      [LIGHT_COLOR.text, LIGHT_COLOR.bg],
      [LIGHT_COLOR.textMuted, LIGHT_COLOR.bg],
      [LIGHT_COLOR.text, LIGHT_COLOR.surface],
      [LIGHT_COLOR.tokenText, LIGHT_COLOR.tokenBg],
      [LIGHT_COLOR.onActive, LIGHT_COLOR.active],
      [LIGHT_COLOR.onActiveWash, LIGHT_COLOR.activeWash],
      [DARK_COLOR.text, DARK_COLOR.bg],
      [DARK_COLOR.textMuted, DARK_COLOR.bg],
      [DARK_COLOR.text, DARK_COLOR.surface],
      [DARK_COLOR.tokenText, DARK_COLOR.tokenBg],
      [DARK_COLOR.onActive, DARK_COLOR.active],
      [DARK_COLOR.onActiveWash, DARK_COLOR.activeWash],
    ];

    for (const [foreground, background] of pairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
