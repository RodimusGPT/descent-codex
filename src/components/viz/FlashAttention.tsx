import type { CSSProperties } from "react";
import { useState } from "react";
import { attentionTrafficBytes, formatBytesCompact } from "../../lib/hardware";

const MODES = [
  { id: "naive", label: "Naive" },
  { id: "flash", label: "Flash" },
] as const;

const FlashAttention = () => {
  const [modeId, setModeId] = useState<(typeof MODES)[number]["id"]>("flash");
  const [seqLen, setSeqLen] = useState(1024);
  const traffic = attentionTrafficBytes(seqLen, 128, 2);
  const activeBytes = modeId === "naive" ? traffic.naiveBytes : traffic.flashBytes;
  const trafficShare = activeBytes / traffic.naiveBytes;

  return (
    <section className="hardware-viz flash-attention" aria-labelledby="flash-title">
      <div className="hardware-viz__header">
        <div>
          <p className="eyebrow">FlashAttention</p>
          <h2 id="flash-title">Fuse attention through SRAM</h2>
        </div>
        <p>
          The naive path writes the attention score matrix to HBM. FlashAttention streams tiles
          through SRAM and keeps the online softmax state small.
        </p>
      </div>

      <div className="hardware-controls hardware-controls--split">
        <label>
          sequence length: {seqLen}
          <input
            max="4096"
            min="256"
            onChange={(event) => setSeqLen(Number(event.currentTarget.value))}
            step="256"
            type="range"
            value={seqLen}
          />
        </label>
        <div className="viz-controls" aria-label="Attention implementation">
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
      </div>

      <div className={`flash-attention__stage flash-attention__stage--${modeId}`}>
        <div className="flash-attention__pipeline">
          {(modeId === "naive"
            ? ["QK scores", "write n x n", "softmax", "read scores", "multiply V"]
            : ["Q/K/V tiles", "online max", "online sum", "SRAM reuse", "write output"]
          ).map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <div
          className="flash-attention__traffic"
          style={{ "--traffic-share": trafficShare } as CSSProperties}
        >
          <strong>{formatBytesCompact(activeBytes)}</strong>
          <span>HBM traffic</span>
        </div>
      </div>

      <dl className="hardware-readout">
        <div>
          <dt>Naive</dt>
          <dd>{formatBytesCompact(traffic.naiveBytes)}</dd>
        </div>
        <div>
          <dt>Flash</dt>
          <dd>{formatBytesCompact(traffic.flashBytes)}</dd>
        </div>
        <div>
          <dt>Saved</dt>
          <dd>{formatBytesCompact(traffic.savedBytes)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default FlashAttention;
