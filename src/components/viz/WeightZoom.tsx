import { useState } from "react";
import Token from "../scroll/Token";

const zoomSteps = [
  {
    id: "model",
    label: "Model",
    text: "Billions of parameters arranged into repeated blocks.",
  },
  {
    id: "layer",
    label: "Layer",
    text: "A transformer block contains attention and feed-forward matrices.",
  },
  {
    id: "matrix",
    label: "Matrix",
    text: "Inference repeatedly multiplies activations by weight matrices.",
  },
  {
    id: "weight",
    label: "One weight",
    text: "One stored number nudges one activation path up or down.",
  },
] as const;

const WeightZoom = () => {
  const [activeStep, setActiveStep] = useState(0);
  const active = zoomSteps[activeStep] ?? zoomSteps[0];

  return (
    <section className="m4-panel weight-zoom" aria-labelledby="weight-zoom-title">
      <div className="m4-panel__header">
        <p className="eyebrow">Weight zoom</p>
        <h2 id="weight-zoom-title">A model is a stack of numbers</h2>
        <p>Zoom from the whole model down to a single scalar in a matrix.</p>
      </div>

      <div className="weight-zoom__controls" aria-label="Zoom level">
        {zoomSteps.map((step, position) => (
          <button
            aria-pressed={position === activeStep}
            key={step.id}
            onClick={() => setActiveStep(position)}
            type="button"
          >
            {step.label}
          </button>
        ))}
      </div>

      <div className={`weight-zoom__stage weight-zoom__stage--${active.id}`}>
        <div className="weight-zoom__model" aria-hidden="true">
          {zoomSteps.map((step) => (
            <div className="weight-zoom__frame" key={step.id}>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="weight-zoom__readout">
          <Token compact highlight={active.id === "weight"} text="0.03125" />
          <strong>{active.label}</strong>
          <p>{active.text}</p>
        </div>
      </div>
    </section>
  );
};

export default WeightZoom;
