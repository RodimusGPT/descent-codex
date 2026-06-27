import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { PRECISION_SPECS, type PrecisionId } from "../../lib/quant";
import {
  GPU_CONFIGS,
  MODEL_CONFIGS,
  estimateConfig,
  formatEstimateBytes,
} from "../../lib/synthesis";

const precisionIds = Object.keys(PRECISION_SPECS) as PrecisionId[];

const ConfigSandbox = () => {
  const [modelId, setModelId] = useState<string>(MODEL_CONFIGS[0].id);
  const [precision, setPrecision] = useState<PrecisionId>("Q4");
  const [gpuId, setGpuId] = useState<string>(GPU_CONFIGS[0].id);
  const [contextLength, setContextLength] = useState(4096);
  const estimate = useMemo(
    () =>
      estimateConfig({
        contextLength,
        gpuId,
        modelId,
        precision,
      }),
    [contextLength, gpuId, modelId, precision],
  );
  const memoryBytes = estimate.gpu.memoryGb * 1024 ** 3;

  return (
    <section className="synthesis-viz config-sandbox" aria-labelledby="config-title">
      <div className="synthesis-viz__header">
        <div>
          <p className="eyebrow">Configuration sandbox</p>
          <h2 id="config-title">Model, quant, GPU: does it fit?</h2>
        </div>
        <p>
          Weight bytes, KV cache, runtime overhead, and memory bandwidth combine into a first-order
          fit-and-throughput estimate, not a benchmark.
        </p>
      </div>

      <div className="config-sandbox__controls">
        <div className="viz-controls" aria-label="Model">
          {MODEL_CONFIGS.map((model) => (
            <button
              aria-pressed={model.id === modelId}
              key={model.id}
              onClick={() => setModelId(model.id)}
              type="button"
            >
              {model.label}
            </button>
          ))}
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
        <div className="viz-controls" aria-label="GPU">
          {GPU_CONFIGS.map((gpu) => (
            <button
              aria-pressed={gpu.id === gpuId}
              key={gpu.id}
              onClick={() => setGpuId(gpu.id)}
              type="button"
            >
              {gpu.label}
            </button>
          ))}
        </div>
        <label>
          context {contextLength.toLocaleString()}
          <input
            max="32768"
            min="1024"
            onChange={(event) => setContextLength(Number(event.currentTarget.value))}
            step="1024"
            type="range"
            value={contextLength}
          />
        </label>
      </div>

      <div className="config-sandbox__bar" aria-label="Estimated memory used">
        <span
          style={
            {
              "--config-share": Math.min(1, estimate.totalBytes / memoryBytes),
            } as CSSProperties
          }
        >
          {estimate.fits ? "fits" : "over capacity"}
        </span>
      </div>

      <dl className="synthesis-readout">
        <div>
          <dt>Weights</dt>
          <dd>{formatEstimateBytes(estimate.weightBytes)}</dd>
        </div>
        <div>
          <dt>KV cache</dt>
          <dd>{formatEstimateBytes(estimate.kvBytes)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatEstimateBytes(estimate.totalBytes)}</dd>
        </div>
        <div>
          <dt>Throughput</dt>
          <dd>{estimate.tokPerSecond.toFixed(1)} tok/s</dd>
        </div>
      </dl>
    </section>
  );
};

export default ConfigSandbox;
