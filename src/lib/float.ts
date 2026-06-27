export type Bit = 0 | 1;
export type FloatFormatId = "FP32" | "FP16" | "BF16";
export type FloatField = "sign" | "exponent" | "mantissa";
export type FloatPresetId = "zero-point-one" | "one-third" | "max-normal" | "smallest-subnormal";

export type FloatFormatSpec = {
  bias: number;
  exponentBits: number;
  id: FloatFormatId;
  label: string;
  mantissaBits: number;
  totalBits: number;
};

export type FieldRange = {
  end: number;
  field: FloatField;
  start: number;
};

export type DecodedFloat = {
  category: "zero" | "subnormal" | "normal" | "infinity" | "nan";
  exponentRaw: number;
  fieldRanges: FieldRange[];
  mantissaRaw: number;
  sign: 1 | -1;
  value: number;
};

export const FLOAT_FORMATS = {
  FP32: {
    bias: 127,
    exponentBits: 8,
    id: "FP32",
    label: "FP32",
    mantissaBits: 23,
    totalBits: 32,
  },
  FP16: {
    bias: 15,
    exponentBits: 5,
    id: "FP16",
    label: "FP16",
    mantissaBits: 10,
    totalBits: 16,
  },
  BF16: {
    bias: 127,
    exponentBits: 8,
    id: "BF16",
    label: "BF16",
    mantissaBits: 7,
    totalBits: 16,
  },
} as const satisfies Record<FloatFormatId, FloatFormatSpec>;

export const FLOAT_PRESETS = [
  {
    id: "zero-point-one",
    label: "0.1",
  },
  {
    id: "one-third",
    label: "1/3",
  },
  {
    id: "max-normal",
    label: "max normal",
  },
  {
    id: "smallest-subnormal",
    label: "smallest subnormal",
  },
] as const satisfies readonly { id: FloatPresetId; label: string }[];

const float32Buffer = new ArrayBuffer(4);
const float32View = new DataView(float32Buffer);

const integerToBits = (value: number, bitCount: number): Bit[] =>
  Array.from(
    { length: bitCount },
    (_, position) => ((value >>> (bitCount - position - 1)) & 1) as Bit,
  );

const bitsToInteger = (bits: readonly Bit[]) =>
  bits.reduce<number>((value, bit) => value * 2 + bit, 0);

const float32ToUint = (value: number) => {
  float32View.setFloat32(0, value, false);
  return float32View.getUint32(0, false);
};

export const getFloatFormat = (format: FloatFormatId) => FLOAT_FORMATS[format];

export const getFieldRanges = (format: FloatFormatId): FieldRange[] => {
  const spec = getFloatFormat(format);
  const exponentStart = 1;
  const mantissaStart = exponentStart + spec.exponentBits;

  return [
    { end: 0, field: "sign", start: 0 },
    { end: mantissaStart - 1, field: "exponent", start: exponentStart },
    { end: spec.totalBits - 1, field: "mantissa", start: mantissaStart },
  ];
};

export const fieldForBit = (format: FloatFormatId, bitIndex: number): FloatField => {
  const range = getFieldRanges(format).find(
    (fieldRange) => bitIndex >= fieldRange.start && bitIndex <= fieldRange.end,
  );

  if (!range) {
    throw new RangeError(`Bit ${bitIndex} is outside ${format}`);
  }

  return range.field;
};

export const bitsToString = (bits: readonly Bit[]) => bits.join("");

export const toggleBit = (bits: readonly Bit[], bitIndex: number): Bit[] =>
  bits.map((bit, index) => (index === bitIndex ? ((bit === 1 ? 0 : 1) as Bit) : bit));

export const decodeFloatBits = (format: FloatFormatId, bits: readonly Bit[]): DecodedFloat => {
  const spec = getFloatFormat(format);

  if (bits.length !== spec.totalBits) {
    throw new RangeError(`${format} requires ${spec.totalBits} bits`);
  }

  const sign = bits[0] === 1 ? -1 : 1;
  const exponentRaw = bitsToInteger(bits.slice(1, 1 + spec.exponentBits));
  const mantissaRaw = bitsToInteger(bits.slice(1 + spec.exponentBits));
  const maxExponent = 2 ** spec.exponentBits - 1;
  const mantissaScale = 2 ** spec.mantissaBits;
  let category: DecodedFloat["category"] = "normal";
  let value: number;

  if (exponentRaw === maxExponent) {
    category = mantissaRaw === 0 ? "infinity" : "nan";
    value = mantissaRaw === 0 ? sign * Number.POSITIVE_INFINITY : Number.NaN;
  } else if (exponentRaw === 0) {
    if (mantissaRaw === 0) {
      category = "zero";
      value = sign === -1 ? -0 : 0;
    } else {
      category = "subnormal";
      value = sign * 2 ** (1 - spec.bias) * (mantissaRaw / mantissaScale);
    }
  } else {
    value = sign * 2 ** (exponentRaw - spec.bias) * (1 + mantissaRaw / mantissaScale);
  }

  return {
    category,
    exponentRaw,
    fieldRanges: getFieldRanges(format),
    mantissaRaw,
    sign,
    value,
  };
};

export const bitsToValue = (format: FloatFormatId, bits: readonly Bit[]) =>
  decodeFloatBits(format, bits).value;

const valueToFp16Integer = (value: number) => {
  const floatBits = float32ToUint(value);
  const sign = (floatBits >>> 16) & 0x8000;
  const exponent = (floatBits >>> 23) & 0xff;
  let mantissa = floatBits & 0x7fffff;

  if (exponent === 0xff) {
    return sign | (mantissa === 0 ? 0x7c00 : 0x7e00);
  }

  let halfExponent = exponent - 127 + 15;

  if (halfExponent >= 0x1f) {
    return sign | 0x7c00;
  }

  if (halfExponent <= 0) {
    if (halfExponent < -10) {
      return sign;
    }

    mantissa = (mantissa | 0x800000) >>> (1 - halfExponent);
    return sign | ((mantissa + 0x1000) >>> 13);
  }

  mantissa += 0x1000;

  if ((mantissa & 0x800000) !== 0) {
    mantissa = 0;
    halfExponent += 1;
  }

  if (halfExponent >= 0x1f) {
    return sign | 0x7c00;
  }

  return sign | (halfExponent << 10) | (mantissa >>> 13);
};

const valueToBf16Integer = (value: number) => {
  const floatBits = float32ToUint(value);

  if ((floatBits & 0x7fffffff) > 0x7f800000) {
    return ((floatBits >>> 16) | 0x0040) & 0xffff;
  }

  const roundingBias = 0x7fff + ((floatBits >>> 16) & 1);
  return ((floatBits + roundingBias) >>> 16) & 0xffff;
};

export const valueToBits = (format: FloatFormatId, value: number): Bit[] => {
  if (format === "FP32") {
    return integerToBits(float32ToUint(value), 32);
  }

  if (format === "FP16") {
    return integerToBits(valueToFp16Integer(value), 16);
  }

  return integerToBits(valueToBf16Integer(value), 16);
};

export const presetToBits = (format: FloatFormatId, preset: FloatPresetId): Bit[] => {
  const spec = getFloatFormat(format);

  if (preset === "zero-point-one") {
    return valueToBits(format, 0.1);
  }

  if (preset === "one-third") {
    return valueToBits(format, 1 / 3);
  }

  if (preset === "max-normal") {
    return [
      0,
      ...Array.from({ length: spec.exponentBits }, (_, index) =>
        index === spec.exponentBits - 1 ? 0 : 1,
      ),
      ...Array.from({ length: spec.mantissaBits }, () => 1),
    ] as Bit[];
  }

  return [
    0,
    ...Array.from({ length: spec.exponentBits }, () => 0),
    ...Array.from({ length: spec.mantissaBits - 1 }, () => 0),
    1,
  ] as Bit[];
};
