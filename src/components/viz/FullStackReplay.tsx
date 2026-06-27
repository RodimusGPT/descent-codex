import { useState } from "react";
import { STACK_REPLAY_STEPS } from "../../lib/synthesis";
import Token from "../scroll/Token";

const FullStackReplay = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = STACK_REPLAY_STEPS[activeIndex];
  const previous = () => setActiveIndex((current) => Math.max(0, current - 1));
  const next = () =>
    setActiveIndex((current) => Math.min(STACK_REPLAY_STEPS.length - 1, current + 1));

  return (
    <section className="synthesis-viz full-stack-replay" aria-labelledby="full-stack-title">
      <div className="synthesis-viz__header">
        <div>
          <p className="eyebrow">Full-stack replay</p>
          <h2 id="full-stack-title">Follow one token down and back up</h2>
        </div>
        <p>
          The same token moves from text through the model, number formats, serving software, and
          hardware before it returns as the next visible word.
        </p>
      </div>

      <div className="synthesis-controls" aria-label="Replay controls">
        <button onClick={previous} type="button">
          Prev
        </button>
        <button onClick={next} type="button">
          Next
        </button>
      </div>

      <div className="full-stack-replay__stage">
        <div className="full-stack-replay__rail">
          {STACK_REPLAY_STEPS.map((step, index) => (
            <button
              aria-pressed={index === activeIndex}
              key={step.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className={`full-stack-replay__panel full-stack-replay__panel--${activeStep.id}`}>
          <Token compact highlight text={activeStep.id === "output" ? "descent" : "token"} />
          <h3>{activeStep.label}</h3>
          <p>{activeStep.detail}</p>
        </div>
      </div>

      <dl className="synthesis-readout">
        <div>
          <dt>Step</dt>
          <dd>
            {activeIndex + 1}/{STACK_REPLAY_STEPS.length}
          </dd>
        </div>
        <div>
          <dt>Layer</dt>
          <dd>{activeStep.label}</dd>
        </div>
        <div>
          <dt>Loop</dt>
          <dd>{activeStep.id === "output" ? "repeat" : "continue"}</dd>
        </div>
      </dl>
    </section>
  );
};

export default FullStackReplay;
