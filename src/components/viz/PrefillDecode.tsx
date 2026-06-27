import { useEffect, useMemo, useState } from "react";
import {
  MEMORY_PRESETS,
  decodeWorkUnits,
  formatBytes,
  kvCacheBytes,
  prefillDecodeWork,
} from "../../lib/memory";
import Token from "../scroll/Token";

const PROMPT_TOKENS = ["Explain", "KV", "cache", "during", "decode"];
const GENERATED_TOKENS = ["reuse", "keys", "values", "faster", "."];
const DISPLAY_CELLS = 36;

const PrefillDecode = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [noCache, setNoCache] = useState(false);
  const [contextLength, setContextLength] = useState(32);
  const [presetId, setPresetId] = useState<string>(MEMORY_PRESETS[1].id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const maxStep = GENERATED_TOKENS.length;
  const activePreset = MEMORY_PRESETS.find((preset) => preset.id === presetId) ?? MEMORY_PRESETS[1];
  const phase = step === 0 ? "prefill" : "decode";
  const generatedVisible = GENERATED_TOKENS.slice(0, step);
  const kvBytes = kvCacheBytes({
    bytesPerValue: 2,
    headDim: activePreset.headDim,
    nKvHeads: activePreset.nKvHeads,
    nLayers: activePreset.nLayers,
    seqLen: contextLength,
  });
  const work = prefillDecodeWork(contextLength, step, !noCache);
  const fullDecodeWaste = decodeWorkUnits(contextLength, maxStep, false);
  const cachedDecodeWork = decodeWorkUnits(contextLength, maxStep, true);
  const filledCells = Math.min(
    DISPLAY_CELLS,
    phase === "prefill"
      ? PROMPT_TOKENS.length
      : PROMPT_TOKENS.length + Math.ceil((step / maxStep) * (DISPLAY_CELLS - PROMPT_TOKENS.length)),
  );

  const cells = useMemo(
    () =>
      Array.from({ length: DISPLAY_CELLS }, (_, cell) => ({
        filled: cell < filledCells,
        id: `kv-cell-${cell}`,
        recompute: noCache && phase === "decode" && cell < filledCells,
      })),
    [filledCells, noCache, phase],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setStep((current) => (current >= maxStep ? 0 : current + 1));
    }, 850);

    return () => window.clearInterval(timer);
  }, [isPlaying, maxStep, reducedMotion]);

  const nextStep = () => setStep((current) => (current >= maxStep ? 0 : current + 1));
  const previousStep = () => setStep((current) => Math.max(0, current - 1));

  return (
    <section className="prefill-decode" aria-labelledby="prefill-decode-title">
      <div className="prefill-decode__header">
        <div>
          <p className="eyebrow">Prefill / decode</p>
          <h2 id="prefill-decode-title">Cache the past, emit the future</h2>
        </div>
        <p>
          Prefill processes the prompt in parallel. Decode then emits one token at a time while
          reading cached keys and values.
        </p>
      </div>

      <div className="prefill-controls">
        <button onClick={() => setIsPlaying((current) => !current)} type="button">
          {isPlaying && !reducedMotion ? "Pause" : "Play"}
        </button>
        <button onClick={previousStep} type="button">
          Prev
        </button>
        <button onClick={nextStep} type="button">
          Next
        </button>
        <label>
          <input
            checked={noCache}
            onChange={(event) => {
              setNoCache(event.currentTarget.checked);
              setStep(0);
            }}
            type="checkbox"
          />
          no cache
        </label>
      </div>

      <div className="prefill-decode__stage">
        <div className="phase-strip" aria-live="polite">
          <span
            className={phase === "prefill" ? "phase-strip__item is-active" : "phase-strip__item"}
          >
            prefill: compute-bound
          </span>
          <span
            className={phase === "decode" ? "phase-strip__item is-active" : "phase-strip__item"}
          >
            decode: memory-bound
          </span>
        </div>

        <div className="token-flow" aria-label="Prompt and generated tokens">
          <div>
            <strong>Prompt</strong>
            <div className="token-flow__row">
              {PROMPT_TOKENS.map((token) => (
                <Token compact highlight={phase === "prefill"} key={token} text={token} />
              ))}
            </div>
          </div>
          <div>
            <strong>Generated</strong>
            <div className="token-flow__row">
              {GENERATED_TOKENS.map((token, index) => (
                <Token
                  compact
                  highlight={phase === "decode" && index === step - 1}
                  key={token}
                  text={index < generatedVisible.length ? token : "..."}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="kv-cache" aria-label="KV cache grid">
          {cells.map((cell) => (
            <span
              className={[
                "kv-cache__cell",
                cell.filled ? "kv-cache__cell--filled" : "",
                cell.recompute ? "kv-cache__cell--recompute" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={cell.id}
            />
          ))}
        </div>
      </div>

      <div className="prefill-settings">
        <label>
          context length: {contextLength}
          <input
            max="128"
            min="8"
            onChange={(event) => setContextLength(Number(event.currentTarget.value))}
            step="8"
            type="range"
            value={contextLength}
          />
        </label>
        <div className="viz-controls" aria-label="KV-head preset">
          {MEMORY_PRESETS.map((preset) => (
            <button
              aria-pressed={preset.id === presetId}
              key={preset.id}
              onClick={() => setPresetId(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <dl className="prefill-readout">
        <div>
          <dt>KV cache</dt>
          <dd>{formatBytes(kvBytes)}</dd>
        </div>
        <div>
          <dt>KV heads</dt>
          <dd>{activePreset.nKvHeads}</dd>
        </div>
        <div>
          <dt>work this replay</dt>
          <dd>{work.totalWork} units</dd>
        </div>
        <div>
          <dt>cached vs no-cache decode</dt>
          <dd>
            {cachedDecodeWork} vs {fullDecodeWaste}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default PrefillDecode;
