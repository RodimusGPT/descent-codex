import { useState } from "react";
import { EMBEDDING_POINTS } from "../../lib/transformer";

const EmbeddingSpace = () => {
  const [selectedId, setSelectedId] = useState<string>(EMBEDDING_POINTS[0].id);
  const selectedPoint =
    EMBEDDING_POINTS.find((point) => point.id === selectedId) ?? EMBEDDING_POINTS[0];

  return (
    <section className="m4-panel embedding-space" aria-labelledby="embedding-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Embeddings</p>
        <h2 id="embedding-title">Meaning as position</h2>
        <p>Tokens with related roles cluster together in a learned vector space.</p>
      </div>
      <div className="embedding-space__body">
        <svg className="embedding-space__plot" viewBox="0 0 100 100" role="img">
          <title>2D projection of token embeddings</title>
          <line className="embedding-space__axis" x1="10" x2="90" y1="86" y2="86" />
          <line className="embedding-space__axis" x1="10" x2="10" y1="14" y2="86" />
          {EMBEDDING_POINTS.map((point) => (
            <circle
              className={
                point.id === selectedPoint.id
                  ? "embedding-space__point is-selected"
                  : "embedding-space__point"
              }
              cx={point.x}
              cy={point.y}
              key={point.id}
              r={point.id === selectedPoint.id ? 4.2 : 3.2}
            />
          ))}
        </svg>
        <div className="embedding-space__readout">
          <strong>{selectedPoint.label}</strong>
          <span>{selectedPoint.cluster} cluster</span>
          <p>
            Nearby tokens tend to carry related meaning or function. The real model keeps thousands
            of dimensions; this sandbox shows a 2D projection.
          </p>
          <div className="embedding-space__chips">
            {EMBEDDING_POINTS.map((point) => (
              <button
                aria-pressed={point.id === selectedPoint.id}
                key={point.id}
                onClick={() => setSelectedId(point.id)}
                type="button"
              >
                {point.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmbeddingSpace;
