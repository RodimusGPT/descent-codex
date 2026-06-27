import { useMemo, useState } from "react";
import { COLOR, weightToColor } from "../../lib/encoding";
import {
  PRECISION_SPECS,
  type PrecisionId,
  SAMPLE_WEIGHTS,
  quantizeWeights,
} from "../../lib/quant";

const precisionIds = Object.keys(PRECISION_SPECS) as PrecisionId[];
const modelPresets = [7, 70] as const;

const QuantizationSlider = () => {
  const [precision, setPrecision] = useState<PrecisionId>("FP16");
  const [paramsBillions, setParamsBillions] = useState(7);
  const result = useMemo(
    () => quantizeWeights(SAMPLE_WEIGHTS, precision, paramsBillions),
    [precision, paramsBillions],
  );
  const maxCount = Math.max(...result.buckets.map((bucket) => bucket.count), 1);
  const barWidth = 640 / Math.max(1, result.buckets.length);

  return (
    <section className="quantization-slider" aria-labelledby="quantization-title">
      <div className="quantization-slider__header">
        <div>
          <p className="eyebrow">Quantization slider</p>
          <h2 id="quantization-title">Fewer bits, coarser weights</h2>
        </div>
        <p>
          Change precision to rebucket the same synthetic weight distribution and update the
          illustrative memory and quality readouts.
        </p>
      </div>

      <div className="viz-controls" aria-label="Precision">
        {precisionIds.map((precisionId) => (
          <button
            aria-pressed={precisionId === precision}
            key={precisionId}
            onClick={() => setPrecision(precisionId)}
            type="button"
          >
            {precisionId}
          </button>
        ))}
      </div>

      <div className="quantization-slider__model">
        <span>Params</span>
        {modelPresets.map((preset) => (
          <button
            aria-pressed={paramsBillions === preset}
            key={preset}
            onClick={() => setParamsBillions(preset)}
            type="button"
          >
            {preset}B
          </button>
        ))}
        <label>
          custom
          <input
            min="1"
            onChange={(event) => setParamsBillions(Number(event.currentTarget.value))}
            step="1"
            type="number"
            value={paramsBillions}
          />
        </label>
      </div>

      <svg
        aria-label={`Histogram with ${result.buckets.length} quantization buckets`}
        className="quantization-histogram"
        role="img"
        viewBox="0 0 640 240"
      >
        <title>Quantized weight histogram</title>
        <line stroke={COLOR.border} strokeWidth="2" x1="0" x2="640" y1="218" y2="218" />
        {result.buckets.map((bucket, index) => {
          const height = (bucket.count / maxCount) * 190;
          const normalized = result.buckets.length <= 1 ? 0 : index / (result.buckets.length - 1);

          return (
            <rect
              fill={weightToColor(normalized)}
              height={height}
              key={bucket.level.toFixed(5)}
              rx="2"
              width={Math.max(1.5, barWidth * 0.82)}
              x={index * barWidth}
              y={218 - height}
            />
          );
        })}
      </svg>

      <dl className="quantization-readout">
        <div>
          <dt>model size</dt>
          <dd>{result.modelSizeGb.toFixed(2)} GB</dd>
        </div>
        <div>
          <dt>buckets</dt>
          <dd>{result.buckets.length}</dd>
        </div>
        <div>
          <dt>mean error</dt>
          <dd>{result.meanError.toFixed(4)}</dd>
        </div>
        <div>
          <dt>illustrative quality proxy</dt>
          <dd>{result.qualityScore}/100</dd>
        </div>
      </dl>
    </section>
  );
};

export default QuantizationSlider;
