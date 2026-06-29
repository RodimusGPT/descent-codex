import { useMemo, useState } from "react";
import {
  BUILDER_OPTIONS,
  type BuilderProfile,
  CONCURRENCY_OPTIONS,
  type ConcurrencyClass,
  HARDWARE_OPTIONS,
  type HardwareBudget,
  MODEL_OPTIONS,
  type ModelClass,
  PRIVACY_OPTIONS,
  type PrivacyClass,
  selectLocalStack,
} from "../../lib/local-stack";

const LocalStackSelector = () => {
  const [builder, setBuilder] = useState<BuilderProfile>("team");
  const [model, setModel] = useState<ModelClass>("mid");
  const [concurrency, setConcurrency] = useState<ConcurrencyClass>("team");
  const [privacy, setPrivacy] = useState<PrivacyClass>("local-required");
  const [hardware, setHardware] = useState<HardwareBudget>("workstation");
  const recommendation = useMemo(
    () => selectLocalStack({ builder, concurrency, hardware, model, privacy }),
    [builder, concurrency, hardware, model, privacy],
  );

  return (
    <section className="synthesis-viz local-stack-selector" aria-labelledby="local-stack-title">
      <div className="synthesis-viz__header">
        <div>
          <p className="eyebrow">Local stack selector</p>
          <h2 id="local-stack-title">What should run the model?</h2>
        </div>
        <p>
          Choose the operating shape, model class, concurrency, and hardware tier to see the stack
          pattern that usually fits first.
        </p>
      </div>

      <div className="local-stack-selector__controls">
        <fieldset className="viz-controls">
          <legend>Operator</legend>
          {BUILDER_OPTIONS.map((option) => (
            <button
              aria-pressed={builder === option.id}
              key={option.id}
              onClick={() => setBuilder(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="viz-controls">
          <legend>Model</legend>
          {MODEL_OPTIONS.map((option) => (
            <button
              aria-pressed={model === option.id}
              key={option.id}
              onClick={() => setModel(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="viz-controls">
          <legend>Traffic</legend>
          {CONCURRENCY_OPTIONS.map((option) => (
            <button
              aria-pressed={concurrency === option.id}
              key={option.id}
              onClick={() => setConcurrency(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="viz-controls">
          <legend>Boundary</legend>
          {PRIVACY_OPTIONS.map((option) => (
            <button
              aria-pressed={privacy === option.id}
              key={option.id}
              onClick={() => setPrivacy(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="viz-controls">
          <legend>Hardware</legend>
          {HARDWARE_OPTIONS.map((option) => (
            <button
              aria-pressed={hardware === option.id}
              key={option.id}
              onClick={() => setHardware(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
      </div>

      <div
        className={`local-stack-selector__result local-stack-selector__result--${recommendation.fit}`}
      >
        <div>
          <p className="eyebrow">{recommendation.fit}</p>
          <h3>{recommendation.title}</h3>
          <p>{recommendation.summary}</p>
        </div>
        <dl>
          <div>
            <dt>Serving path</dt>
            <dd>{recommendation.serving}</dd>
          </div>
          <div>
            <dt>Hardware note</dt>
            <dd>{recommendation.hardware}</dd>
          </div>
          <div>
            <dt>Operations gap</dt>
            <dd>{recommendation.operations}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default LocalStackSelector;
