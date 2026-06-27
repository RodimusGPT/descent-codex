import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  type Bit,
  FLOAT_FORMATS,
  FLOAT_PRESETS,
  type FloatFormatId,
  type FloatPresetId,
  bitsToString,
  decodeFloatBits,
  fieldForBit,
  getFieldRanges,
  presetToBits,
  toggleBit,
  valueToBits,
} from "../../lib/float";

const formatIds = Object.keys(FLOAT_FORMATS) as FloatFormatId[];

const formatValue = (value: number) => {
  if (Number.isNaN(value)) {
    return "NaN";
  }

  if (!Number.isFinite(value)) {
    return value > 0 ? "Infinity" : "-Infinity";
  }

  if (Object.is(value, -0)) {
    return "-0";
  }

  return Number.parseFloat(value.toPrecision(8)).toString();
};

const FloatExploder = () => {
  const [format, setFormat] = useState<FloatFormatId>("FP32");
  const [bits, setBits] = useState<Bit[]>(() => valueToBits("FP32", 0.1));
  const decoded = decodeFloatBits(format, bits);
  const spec = FLOAT_FORMATS[format];
  const fieldRanges = getFieldRanges(format);
  const bitCells = useMemo(
    () =>
      bits.map((bit, position) => ({
        bit,
        field: fieldForBit(format, position),
        id: `${format}-${position}`,
        position,
      })),
    [bits, format],
  );

  const changeFormat = (nextFormat: FloatFormatId) => {
    const currentValue = decoded.value;
    setFormat(nextFormat);
    setBits(valueToBits(nextFormat, currentValue));
  };

  const loadPreset = (preset: FloatPresetId) => {
    setBits(presetToBits(format, preset));
  };

  return (
    <section className="float-exploder" aria-labelledby="float-exploder-title">
      <div className="float-exploder__header">
        <div>
          <p className="eyebrow">Float exploder</p>
          <h2 id="float-exploder-title">Bits become a number</h2>
        </div>
        <p>Toggle any bit and watch the sign, exponent, mantissa, and represented value update.</p>
      </div>

      <div className="viz-controls" aria-label="Float format">
        {formatIds.map((formatId) => (
          <button
            aria-pressed={formatId === format}
            key={formatId}
            onClick={() => changeFormat(formatId)}
            type="button"
          >
            {formatId}
          </button>
        ))}
      </div>

      <div className="float-bit-grid" style={{ "--bit-count": spec.totalBits } as CSSProperties}>
        {bitCells.map(({ bit, field, id, position }) => (
          <button
            aria-label={`${field} bit ${position}, currently ${bit}`}
            aria-pressed={bit === 1}
            className={`float-bit float-bit--${field}`}
            key={id}
            onClick={() => setBits((current) => toggleBit(current, position))}
            type="button"
          >
            {bit}
          </button>
        ))}
      </div>

      <div className="float-fields" aria-label="Field boundaries">
        {fieldRanges.map((range) => (
          <span className={`float-field float-field--${range.field}`} key={range.field}>
            {range.field}: bits {range.start}-{range.end}
          </span>
        ))}
      </div>

      <div className="viz-controls" aria-label="Float presets">
        {FLOAT_PRESETS.map((preset) => (
          <button key={preset.id} onClick={() => loadPreset(preset.id)} type="button">
            {preset.label}
          </button>
        ))}
      </div>

      <dl className="float-readout">
        <div>
          <dt>value</dt>
          <dd>{formatValue(decoded.value)}</dd>
        </div>
        <div>
          <dt>category</dt>
          <dd>{decoded.category}</dd>
        </div>
        <div>
          <dt>exponent</dt>
          <dd>
            {decoded.exponentRaw} raw, {spec.exponentBits} bits
          </dd>
        </div>
        <div>
          <dt>mantissa</dt>
          <dd>
            {decoded.mantissaRaw} raw, {spec.mantissaBits} bits
          </dd>
        </div>
        <div>
          <dt>bits</dt>
          <dd>{bitsToString(bits)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default FloatExploder;
