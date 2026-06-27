import { describe, expect, it } from "vitest";
import {
  type Bit,
  bitsToString,
  bitsToValue,
  fieldForBit,
  getFieldRanges,
  presetToBits,
  toggleBit,
  valueToBits,
} from "../src/lib/float";

describe("float field boundaries", () => {
  it("reports FP32 sign, exponent, and mantissa ranges", () => {
    expect(getFieldRanges("FP32")).toEqual([
      { end: 0, field: "sign", start: 0 },
      { end: 8, field: "exponent", start: 1 },
      { end: 31, field: "mantissa", start: 9 },
    ]);
  });

  it("reports FP16 and BF16 field ownership", () => {
    expect(fieldForBit("FP16", 5)).toBe("exponent");
    expect(fieldForBit("FP16", 6)).toBe("mantissa");
    expect(fieldForBit("BF16", 8)).toBe("exponent");
    expect(fieldForBit("BF16", 9)).toBe("mantissa");
  });
});

describe("float encode/decode", () => {
  it("round-trips known FP32 values", () => {
    expect(bitsToValue("FP32", valueToBits("FP32", 1))).toBe(1);
    expect(bitsToValue("FP32", valueToBits("FP32", -2))).toBe(-2);
    expect(bitsToValue("FP32", valueToBits("FP32", 0.1))).toBeCloseTo(0.1, 7);
  });

  it("encodes known FP16 bit patterns", () => {
    expect(bitsToString(valueToBits("FP16", 1))).toBe("0011110000000000");
    expect(bitsToString(valueToBits("FP16", -2))).toBe("1100000000000000");
  });

  it("decodes FP16 max normal and smallest subnormal presets", () => {
    expect(bitsToValue("FP16", presetToBits("FP16", "max-normal"))).toBe(65504);
    expect(bitsToValue("FP16", presetToBits("FP16", "smallest-subnormal"))).toBe(2 ** -24);
  });

  it("encodes BF16 with FP32 exponent width and fewer mantissa bits", () => {
    expect(bitsToString(valueToBits("BF16", 1))).toBe("0011111110000000");
    expect(bitsToValue("BF16", valueToBits("BF16", 1 / 3))).toBeCloseTo(1 / 3, 2);
  });

  it("toggles an individual bit", () => {
    const bits: Bit[] = [0, 1, 0, 1];
    expect(toggleBit(bits, 2)).toEqual([0, 1, 1, 1]);
  });
});
