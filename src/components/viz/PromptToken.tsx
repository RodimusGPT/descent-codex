import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { promptCandidates } from "../../lib/synthesis";
import { tokenizeText } from "../../lib/transformer";
import Token from "../scroll/Token";

const DEFAULT_PROMPT = "Explain why the GPU keeps KV cache close";

const PromptToken = () => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [temperature, setTemperature] = useState(0.85);
  const tokens = useMemo(() => tokenizeText(prompt), [prompt]);
  const candidates = useMemo(() => promptCandidates(prompt, temperature), [prompt, temperature]);
  const selected = candidates[0];

  return (
    <section className="synthesis-viz prompt-token" aria-labelledby="prompt-token-title">
      <div className="synthesis-viz__header">
        <div>
          <p className="eyebrow">Prompt to token</p>
          <h2 id="prompt-token-title">The model continues the text</h2>
        </div>
        <p>
          A prompt becomes token IDs. The model scores possible next tokens, samples one, appends
          it, and repeats.
        </p>
      </div>

      <div className="prompt-token__controls">
        <label>
          Prompt
          <textarea
            onChange={(event) => setPrompt(event.currentTarget.value)}
            rows={3}
            value={prompt}
          />
        </label>
        <label>
          temperature {temperature.toFixed(2)}
          <input
            max="1.5"
            min="0.35"
            onChange={(event) => setTemperature(Number(event.currentTarget.value))}
            step="0.05"
            type="range"
            value={temperature}
          />
        </label>
      </div>

      <div className="prompt-token__stage">
        <div className="prompt-token__context" aria-label="Prompt tokens">
          {tokens.map((token) => (
            <Token compact id={token.id} key={`${token.position}-${token.id}`} text={token.text} />
          ))}
          {selected ? <Token compact highlight text={selected.token} /> : null}
        </div>

        <div className="prompt-token__candidates" aria-label="Next-token candidates">
          {candidates.map((candidate) => (
            <div className="prompt-token__candidate" key={candidate.id}>
              <span>{candidate.token}</span>
              <meter max="1" min="0" value={candidate.probability}>
                {Math.round(candidate.probability * 100)}%
              </meter>
              <strong>{Math.round(candidate.probability * 100)}%</strong>
            </div>
          ))}
        </div>
      </div>

      <dl className="synthesis-readout">
        <div>
          <dt>Prompt tokens</dt>
          <dd>{tokens.length}</dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd>{selected?.token}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{selected ? `${Math.round(selected.probability * 100)}%` : "n/a"}</dd>
        </div>
      </dl>
    </section>
  );
};

export default PromptToken;
