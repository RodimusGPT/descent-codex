import { useState } from "react";
import { type ParallelismMode, parallelismPlan } from "../../lib/hardware";

const MODES = [
  { id: "tp", label: "Tensor" },
  { id: "pp", label: "Pipeline" },
  { id: "ep", label: "Expert" },
] as const satisfies readonly { id: ParallelismMode; label: string }[];

const MODE_COPY: Record<ParallelismMode, string> = {
  ep: "Experts are distributed; routed tokens create all-to-all traffic.",
  pp: "Layers are split into stages; microbatches reduce idle pipeline bubbles.",
  tp: "Matrices are sharded; each layer needs collectives to merge partial results.",
};

const Parallelism = () => {
  const [modeId, setModeId] = useState<ParallelismMode>("tp");
  const steps = parallelismPlan(modeId, 4);

  return (
    <section className="hardware-viz parallelism" aria-labelledby="parallelism-title">
      <div className="hardware-viz__header">
        <div>
          <p className="eyebrow">Parallelism</p>
          <h2 id="parallelism-title">Split the work, pay the network</h2>
        </div>
        <p>{MODE_COPY[modeId]}</p>
      </div>

      <div className="hardware-controls" aria-label="Parallelism mode">
        {MODES.map((mode) => (
          <button
            aria-pressed={mode.id === modeId}
            key={mode.id}
            onClick={() => setModeId(mode.id)}
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className={`parallelism__stage parallelism__stage--${modeId}`}>
        {steps.map((step) => (
          <div className="parallelism__device" key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.traffic}</span>
          </div>
        ))}
      </div>

      <dl className="hardware-readout">
        <div>
          <dt>Mode</dt>
          <dd>{modeId.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Traffic</dt>
          <dd>{steps[0]?.traffic}</dd>
        </div>
        <div>
          <dt>Width</dt>
          <dd>{steps.length} devices</dd>
        </div>
      </dl>
    </section>
  );
};

export default Parallelism;
