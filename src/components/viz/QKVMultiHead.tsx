import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { QKV_HEADS, scaledDotScores, softmax } from "../../lib/transformer";

const keyLabels = ["previous", "subject", "decode"];

const QKVMultiHead = () => {
  const [headId, setHeadId] = useState<string>(QKV_HEADS[0].id);
  const activeHead = QKV_HEADS.find((head) => head.id === headId) ?? QKV_HEADS[0];
  const probabilities = useMemo(
    () => softmax(scaledDotScores(activeHead.query, activeHead.keys)),
    [activeHead],
  );

  return (
    <section className="m4-panel qkv-viz" aria-labelledby="qkv-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Q / K / V</p>
        <h2 id="qkv-title">Heads score different matches</h2>
        <p>
          A query vector is compared with key vectors, then softmax turns scores into attention.
        </p>
      </div>
      <div className="viz-controls" aria-label="Attention head">
        {QKV_HEADS.map((head) => (
          <button
            aria-pressed={head.id === activeHead.id}
            key={head.id}
            onClick={() => setHeadId(head.id)}
            type="button"
          >
            {head.label}
          </button>
        ))}
      </div>
      <div className="qkv-viz__grid">
        <div className="qkv-viz__vector">
          <strong>Query</strong>
          {activeHead.query.map((value) => (
            <span key={`query-${value}`} style={{ "--bar-value": value } as CSSProperties} />
          ))}
        </div>
        <div className="qkv-viz__scores">
          {probabilities.map((probability, position) => (
            <div key={keyLabels[position]}>
              <span>{keyLabels[position]}</span>
              <meter max="1" min="0" value={probability}>
                {Math.round(probability * 100)}%
              </meter>
              <strong>{Math.round(probability * 100)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QKVMultiHead;
