import { useMemo, useState } from "react";
import { TOKENIZER_SAMPLE, tokenizeText } from "../../lib/transformer";
import Token from "../scroll/Token";

const Tokenizer = () => {
  const [text, setText] = useState(TOKENIZER_SAMPLE);
  const tokens = useMemo(() => tokenizeText(text), [text]);

  return (
    <section className="m4-panel tokenizer-viz" aria-labelledby="tokenizer-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Tokenizer</p>
        <h2 id="tokenizer-title">Text becomes token IDs</h2>
        <p>Type text and watch it split into word, subword, and punctuation pieces.</p>
      </div>
      <label className="tokenizer-viz__input">
        Prompt text
        <textarea onChange={(event) => setText(event.currentTarget.value)} rows={3} value={text} />
      </label>
      <div className="tokenizer-viz__tokens" aria-live="polite">
        {tokens.map((token) => (
          <Token
            compact
            highlight={token.kind === "subword"}
            id={token.id}
            key={`${token.position}-${token.id}`}
            text={token.text}
          />
        ))}
      </div>
      <p className="m4-note">{tokens.length} tokens. Subword pieces are highlighted.</p>
    </section>
  );
};

export default Tokenizer;
