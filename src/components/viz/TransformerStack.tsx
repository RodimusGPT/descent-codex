import { useState } from "react";
import { TRANSFORMER_LAYERS } from "../../lib/transformer";

const TransformerStack = () => {
  const [activeLayer, setActiveLayer] = useState(1);
  const activeLabel = TRANSFORMER_LAYERS[activeLayer] ?? TRANSFORMER_LAYERS[0];

  return (
    <section className="m4-panel transformer-stack" aria-labelledby="stack-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Stack</p>
        <h2 id="stack-title">The same block repeats</h2>
        <p>
          Embeddings flow through layers built from attention, residual paths, norm, and FFN work.
        </p>
      </div>
      <div className="transformer-stack__body">
        <div className="transformer-stack__layers" aria-label="Transformer layers">
          {TRANSFORMER_LAYERS.map((layer) => (
            <button
              aria-pressed={TRANSFORMER_LAYERS[activeLayer] === layer}
              key={layer}
              onClick={() => setActiveLayer(TRANSFORMER_LAYERS.indexOf(layer))}
              type="button"
            >
              {layer}
            </button>
          ))}
        </div>
        <div className="transformer-stack__block">
          <strong>{activeLabel}</strong>
          <div>RMSNorm</div>
          <div>Attention</div>
          <div>Residual add</div>
          <div>RMSNorm</div>
          <div>FFN or MoE</div>
        </div>
      </div>
    </section>
  );
};

export default TransformerStack;
