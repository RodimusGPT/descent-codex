import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ATTENTION_HEADS,
  ATTENTION_TOKENS,
  attentionPath,
  attentionStrokeForWeight,
  tokenX,
} from "../../lib/attention-data";
import { COLOR } from "../../lib/encoding";
import Token from "../scroll/Token";

const formatWeight = (value: number) => value.toFixed(3);

const AttentionFan = () => {
  const [activeHeadId, setActiveHeadId] = useState<string>(ATTENTION_HEADS[0].id);
  const [queryIndex, setQueryIndex] = useState(2);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const activeHead = useMemo(
    () => ATTENTION_HEADS.find((head) => head.id === activeHeadId) ?? ATTENTION_HEADS[0],
    [activeHeadId],
  );
  const weights = activeHead.matrix[queryIndex];
  const inspectedKey = hoveredKey ?? queryIndex;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  const moveQuery = (direction: 1 | -1) => {
    setQueryIndex((current) =>
      Math.min(ATTENTION_TOKENS.length - 1, Math.max(0, current + direction)),
    );
  };

  const onTokenKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveQuery(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveQuery(-1);
    }
  };

  return (
    <section className="attention-fan" aria-labelledby="attention-fan-title">
      <div className="attention-fan__header">
        <div>
          <p className="eyebrow">Attention fan</p>
          <h2 id="attention-fan-title">One token reads the context</h2>
        </div>
        <p>
          Select a query token, then switch heads to see a different attention pattern over the same
          sentence.
        </p>
      </div>

      <fieldset className="attention-fan__heads">
        <legend>Head</legend>
        {ATTENTION_HEADS.map((head) => (
          <button
            aria-pressed={head.id === activeHeadId}
            key={head.id}
            onClick={() => setActiveHeadId(head.id)}
            type="button"
          >
            {head.label}
          </button>
        ))}
      </fieldset>

      <div
        className={["attention-fan__stage", reducedMotion ? "attention-fan__stage--reduced" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <svg aria-hidden="true" className="attention-fan__lines" viewBox="0 0 1000 170">
          <title>Attention weights from the selected query token</title>
          {weights.map((weight, keyIndex) => {
            const stroke = attentionStrokeForWeight(weight);

            return (
              <path
                d={attentionPath(queryIndex, keyIndex, ATTENTION_TOKENS.length)}
                key={`${activeHead.id}-${queryIndex}-${keyIndex}`}
                opacity={stroke.opacity}
                stroke={stroke.color}
                strokeLinecap="round"
                strokeWidth={stroke.width}
              />
            );
          })}
          {ATTENTION_TOKENS.map((token, index) => (
            <circle
              cx={tokenX(index, ATTENTION_TOKENS.length)}
              cy="76"
              fill={index === queryIndex ? COLOR.activeStrong : COLOR.surface}
              key={token}
              r={index === queryIndex ? 6 : 4}
              stroke={COLOR.border}
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="attention-fan__tokens">
          {ATTENTION_TOKENS.map((token, index) => (
            <button
              aria-label={`Use token ${token} as query`}
              aria-pressed={index === queryIndex}
              className="attention-fan__token-button"
              key={token}
              onBlur={() => setHoveredKey(null)}
              onClick={() => setQueryIndex(index)}
              onFocus={() => setHoveredKey(index)}
              onKeyDown={onTokenKeyDown}
              onMouseEnter={() => setHoveredKey(index)}
              onMouseLeave={() => setHoveredKey(null)}
              style={
                {
                  "--attention-token-x": `${tokenX(index, ATTENTION_TOKENS.length) / 10}%`,
                } as CSSProperties
              }
              type="button"
            >
              <Token compact highlight={index === queryIndex} id={index} text={token} />
            </button>
          ))}
        </div>
      </div>

      <div className="attention-fan__readout" aria-live="polite">
        <strong>{activeHead.label}</strong>
        <span>{activeHead.description}</span>
        <span>
          query <Token compact text={ATTENTION_TOKENS[queryIndex]} /> to key{" "}
          <Token compact text={ATTENTION_TOKENS[inspectedKey]} /> weight{" "}
          {formatWeight(weights[inspectedKey])}
        </span>
      </div>
    </section>
  );
};

export default AttentionFan;
