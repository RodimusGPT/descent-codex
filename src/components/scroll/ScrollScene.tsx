import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import Token from "./Token";

export type ScrollSceneStep = {
  id: string;
  narration: ReactNode;
  visualLabel?: ReactNode;
};

type ScrollSceneProps = {
  render?: (activeStep: number) => ReactNode;
  steps: ScrollSceneStep[];
  title?: string;
};

type ScrollamaInstance = {
  destroy: () => void;
  onStepEnter: (callback: (response: { index: number }) => void) => ScrollamaInstance;
  resize: () => void;
  setup: (options: { offset: number; step: Element[] }) => ScrollamaInstance;
};

const PlaceholderVisual = ({
  activeStep,
  steps,
}: {
  activeStep: number;
  steps: ScrollSceneStep[];
}) => {
  const current = steps[activeStep] ?? steps[0];
  const progress = steps.length <= 1 ? 1 : (activeStep + 1) / steps.length;

  return (
    <div
      className="placeholder-visual"
      style={{ "--placeholder-progress": progress } as CSSProperties}
    >
      <div className="placeholder-visual__lane" aria-hidden="true">
        <Token compact id={0} text="prompt" />
        <Token compact highlight={activeStep >= 1} id={1} text="context" />
        <Token compact highlight={activeStep >= 2} id={2} text="next" />
      </div>
      <div className="placeholder-visual__bar" />
      <p>{current?.visualLabel ?? "Placeholder visual: scroll to advance the descent."}</p>
    </div>
  );
};

const ScrollScene = ({ render, steps, title = "Scroll scene" }: ScrollSceneProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepElements = stepRefs.current.filter((step): step is HTMLElement => Boolean(step));
    const scroller = (scrollama as unknown as () => ScrollamaInstance)();

    scroller
      .setup({
        offset: reducedMotion ? 0.5 : 0.62,
        step: stepElements,
      })
      .onStepEnter(({ index }) => setActiveStep(index));

    const onResize = () => scroller.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scroller.destroy();
    };
  }, [steps.length]);

  const moveFocus = (fromIndex: number, direction: 1 | -1) => {
    const nextIndex = Math.min(steps.length - 1, Math.max(0, fromIndex + direction));
    setActiveStep(nextIndex);
    stepRefs.current[nextIndex]?.focus();
  };

  const onStepKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(index, 1);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(index, -1);
    }
  };

  return (
    <section aria-label={title} className="scroll-scene">
      <div aria-live="polite" className="scroll-scene__visual">
        {render ? render(activeStep) : <PlaceholderVisual activeStep={activeStep} steps={steps} />}
      </div>
      <div className="scroll-scene__steps">
        {steps.map((step, index) => (
          <button
            aria-current={activeStep === index ? "step" : undefined}
            className="scroll-scene__step"
            data-scroll-step={step.id}
            key={step.id}
            onClick={() => setActiveStep(index)}
            onFocus={() => setActiveStep(index)}
            onKeyDown={(event) => onStepKeyDown(event, index)}
            ref={(element) => {
              stepRefs.current[index] = element;
            }}
            type="button"
          >
            {step.narration}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ScrollScene;
