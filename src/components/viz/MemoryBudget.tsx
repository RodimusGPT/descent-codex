import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { formatBytes, kvCacheBytes, memoryBudgetBreakdown } from "../../lib/memory";
import { PRECISION_SPECS, type PrecisionId, getPrecisionSpec } from "../../lib/quant";

const precisionIds = Object.keys(PRECISION_SPECS) as PrecisionId[];
const modelPresets = [
  { headDim: 128, label: "7B", layers: 32, paramsBillions: 7, kvHeads: 8 },
  { headDim: 128, label: "70B", layers: 80, paramsBillions: 70, kvHeads: 8 },
] as const;

const MemoryBudget = () => {
  const [modelIndex, setModelIndex] = useState(0);
  const [precision, setPrecision] = useState<PrecisionId>("Q4");
  const [contextLength, setContextLength] = useState(4096);
  const model = modelPresets[modelIndex] ?? modelPresets[0];
  const kvBytes = kvCacheBytes({
    bytesPerValue: 2,
    headDim: model.headDim,
    nKvHeads: model.kvHeads,
    nLayers: model.layers,
    seqLen: contextLength,
  });
  const budget = useMemo(
    () =>
      memoryBudgetBreakdown({
        kvBytes,
        paramsBillions: model.paramsBillions,
        weightBytesPerParam: getPrecisionSpec(precision).bytesPerParam,
      }),
    [kvBytes, model.paramsBillions, precision],
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
          {modelPresets.map((preset, index) => (
            <button
              aria-pressed={modelIndex === index}
              key={preset.label}
              onClick={() => setModelIndex(index)}
              type="button"
            >
              {preset.label}
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
