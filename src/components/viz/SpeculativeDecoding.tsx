import { useMemo, useState } from "react";
import { speculativeDecodingEstimate } from "../../lib/serving";
import Token from "../scroll/Token";

const DRAFT_TOKENS = ["the", "KV", "cache", "stays", "hot", "."];

const SpeculativeDecoding = () => {
  const [candidateTokens, setCandidateTokens] = useState(4);
  const [acceptanceRate, setAcceptanceRate] = useState(0.72);
  const estimate = useMemo(
    () =>
      speculativeDecodingEstimate({
        acceptanceRate,
        candidateTokens,
        draftTokenMs: 12,
        targetTokenMs: 80,
        verifyPassMs: 88,
      }),
    [acceptanceRate, candidateTokens],
  );
  const visibleTokens = DRAFT_TOKENS.slice(0, candidateTokens);
  const expectedAccepted = Math.floor(estimate.expectedAcceptedDraftTokens);
  const expectedOutput = Math.max(1, Math.round(estimate.expectedOutputTokens));

  return (
    <section className="serving-viz speculative-decoding" aria-labelledby="speculative-title">
      <div className="serving-viz__header">
        <div>
          <p className="eyebrow">Speculative decoding</p>
          <h2 id="speculative-title">Draft fast, verify once</h2>
        </div>
        <p>
          A small draft model proposes several tokens. The target model checks those tokens in one
          pass, keeps the accepted prefix, and resumes from the first rejection.
        </p>
      </div>

      <div className="serving-controls serving-controls--split">
        <label>
          draft tokens: {candidateTokens}
          <input
            max="6"
            min="2"
            onChange={(event) => setCandidateTokens(Number(event.currentTarget.value))}
            step="1"
            type="range"
            value={candidateTokens}
          />
        </label>
        <label>
          acceptance: {Math.round(acceptanceRate * 100)}%
          <input
            max="0.95"
            min="0.25"
            onChange={(event) => setAcceptanceRate(Number(event.currentTarget.value))}
            step="0.05"
            type="range"
            value={acceptanceRate}
          />
        </label>
      </div>

      <div className="speculative-decoding__stage">
        <div className="speculative-lane">
          <span>draft</span>
          <div>
            {visibleTokens.map((token) => (
              <Token compact key={token} text={token} />
            ))}
          </div>
        </div>
        <div className="speculative-lane speculative-lane--verify">
          <span>target verify</span>
          <div>
            {visibleTokens.map((token, index) => (
              <Token compact highlight={index < expectedAccepted} key={token} text={token} />
            ))}
          </div>
        </div>
        <div className="speculative-lane speculative-lane--output">
          <span>accepted output</span>
          <div>
            {visibleTokens.map((token, index) => (
              <Token
                compact
                highlight={index < expectedOutput}
                key={token}
                text={index < expectedOutput ? token : "resample"}
              />
            ))}
          </div>
        </div>
      </div>

      <dl className="serving-readout">
        <div>
          <dt>Expected output</dt>
          <dd>{estimate.expectedOutputTokens.toFixed(2)} tokens</dd>
        </div>
        <div>
          <dt>Cycle time</dt>
          <dd>{estimate.cycleMs.toFixed(0)} ms</dd>
        </div>
        <div>
          <dt>Speedup</dt>
          <dd>{estimate.speedup.toFixed(2)}x</dd>
        </div>
      </dl>
    </section>
  );
};

export default SpeculativeDecoding;
