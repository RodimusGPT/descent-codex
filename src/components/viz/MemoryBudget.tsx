import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { formatBytes, kvCacheBytes, memoryBudgetBreakdown } from "../../lib/memory";
import { PRECISION_SPECS, type PrecisionId, getPrecisionSpec } from "../../lib/quant";

const precisionIds = Object.keys(PRECISION_SPECS) as PrecisionId[];
const modelPresets = [7, 70] as const;

const MemoryBudget = () => {
  const [paramsBillions, setParamsBillions] = useState(7);
  const [precision, setPrecision] = useState<PrecisionId>("Q4");
  const [contextLength, setContextLength] = useState(4096);
  const kvBytes = kvCacheBytes({
    bytesPerValue: 2,
    headDim: 128,
    nKvHeads: 8,
    nLayers: 32,
    seqLen: contextLength,
  });
  const budget = useMemo(
    () =>
      memoryBudgetBreakdown({
        kvBytes,
        paramsBillions,
        weightBytesPerParam: getPrecisionSpec(precision).bytesPerParam,
      }),
    [kvBytes, paramsBillions, precision],
  );
  const bars = [
    { bytes: budget.weightBytes, id: "weights", label: "weights" },
    { bytes: budget.kvBytes, id: "kv", label: "KV cache" },
    { bytes: budget.overheadBytes, id: "overhead", label: "runtime overhead" },
  ];

  return (
    <section className="m4-panel memory-budget" aria-labelledby="memory-budget-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Memory budget</p>
        <h2 id="memory-budget-title">Weights are not the whole VRAM bill</h2>
        <p>Model weights dominate at short context; KV cache grows with context length.</p>
      </div>

      <div className="memory-budget__controls">
        <div className="viz-controls" aria-label="Model size">
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
        <label>
          context {contextLength.toLocaleString()}
          <input
            max="32768"
            min="512"
            onChange={(event) => setContextLength(Number(event.currentTarget.value))}
            step="512"
            type="range"
            value={contextLength}
          />
        </label>
      </div>

      <div className="memory-budget__bar" aria-label="Memory budget breakdown">
        {bars.map((bar) => (
          <span
            className={`memory-budget__segment memory-budget__segment--${bar.id}`}
            key={bar.id}
            style={{ "--segment-share": bar.bytes / budget.totalBytes } as CSSProperties}
          >
            {bar.label}
          </span>
        ))}
      </div>

      <dl className="memory-budget__readout">
        {bars.map((bar) => (
          <div key={bar.id}>
            <dt>{bar.label}</dt>
            <dd>{formatBytes(bar.bytes)}</dd>
          </div>
        ))}
        <div>
          <dt>total</dt>
          <dd>{formatBytes(budget.totalBytes)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default MemoryBudget;
