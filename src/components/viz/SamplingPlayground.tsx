import { useEffect, useMemo, useState } from "react";
import {
  SAMPLING_CANDIDATES,
  candidateProbabilities,
  filterCandidates,
} from "../../lib/transformer";
import Token from "../scroll/Token";

const seedTokens = ["The", "model", "will"];

const SamplingPlayground = () => {
  const [temperature, setTemperature] = useState(0.9);
  const [topK, setTopK] = useState(4);
  const [topP, setTopP] = useState(0.9);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const probabilities = useMemo(
    () => candidateProbabilities(SAMPLING_CANDIDATES, temperature),
    [temperature],
  );
  const filtered = useMemo(
    () => filterCandidates(probabilities, topK, topP),
    [probabilities, topK, topP],
  );
  const generated = filtered.slice(0, Math.max(1, step + 1)).map((candidate) => candidate.token);

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
      setStep((current) => (current + 1) % Math.max(1, filtered.length));
    }, 900);

    return () => window.clearInterval(timer);
  }, [filtered.length, isPlaying, reducedMotion]);

  return (
    <section className="m4-panel sampling-playground" aria-labelledby="sampling-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Sampling</p>
        <h2 id="sampling-title">Logits become the next token</h2>
        <p>Temperature, top-k, and top-p reshape the distribution before one token is sampled.</p>
      </div>
      <div className="sampling-playground__controls">
        <label>
          temp {temperature.toFixed(1)}
          <input
            max="2"
            min="0.3"
            onChange={(event) => setTemperature(Number(event.currentTarget.value))}
            step="0.1"
            type="range"
            value={temperature}
          />
        </label>
        <label>
          top-k {topK}
          <input
            max="5"
            min="1"
            onChange={(event) => setTopK(Number(event.currentTarget.value))}
            step="1"
            type="range"
            value={topK}
          />
        </label>
        <label>
          top-p {topP.toFixed(2)}
          <input
            max="1"
            min="0.35"
            onChange={(event) => setTopP(Number(event.currentTarget.value))}
            step="0.05"
            type="range"
            value={topP}
          />
        </label>
      </div>
      <div className="sampling-playground__body">
        <div className="sampling-playground__bars">
          {probabilities.map((candidate) => {
            const active = filtered.some((item) => item.id === candidate.id);

            return (
              <div
                className={active ? "sampling-bar is-active" : "sampling-bar"}
                key={candidate.id}
              >
                <span>{candidate.token}</span>
                <meter max="1" min="0" value={candidate.probability}>
                  {Math.round(candidate.probability * 100)}%
                </meter>
                <strong>{active ? "kept" : "cut"}</strong>
              </div>
            );
          })}
        </div>
        <div className="sampling-playground__loop">
          <strong>Autoregression</strong>
          <div className="sampling-playground__tokens">
            {[...seedTokens, ...generated].map((token) => (
              <Token compact highlight={generated.includes(token)} key={token} text={token} />
            ))}
          </div>
          <button onClick={() => setIsPlaying((current) => !current)} type="button">
            {isPlaying && !reducedMotion ? "Pause loop" : "Play loop"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SamplingPlayground;
