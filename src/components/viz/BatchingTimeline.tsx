import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  type ServeRequest,
  activeSlotsByStep,
  averageWaitSteps,
  scheduleBatchTimeline,
} from "../../lib/serving";

const REQUESTS = [
  { arrivalStep: 0, decodeSteps: 5, id: "r1", label: "chat A", promptTokens: 28 },
  { arrivalStep: 1, decodeSteps: 4, id: "r2", label: "chat B", promptTokens: 12 },
  { arrivalStep: 3, decodeSteps: 5, id: "r3", label: "chat C", promptTokens: 40 },
  { arrivalStep: 5, decodeSteps: 3, id: "r4", label: "chat D", promptTokens: 18 },
] as const satisfies readonly ServeRequest[];

const MODES = [
  {
    id: "continuous",
    interval: 1,
    label: "Continuous",
  },
  {
    id: "windowed",
    interval: 3,
    label: "Windowed",
  },
] as const;

const TOTAL_STEPS = 10;
const STEP_MARKERS = Array.from({ length: TOTAL_STEPS }, (_, step) => ({
  id: `step-${step}`,
  value: step,
}));

const BatchingTimeline = () => {
  const [modeId, setModeId] = useState<(typeof MODES)[number]["id"]>("continuous");
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  const rows = useMemo(
    () => scheduleBatchTimeline(REQUESTS, TOTAL_STEPS, mode.interval),
    [mode.interval],
  );
  const activeSlots = activeSlotsByStep(rows, TOTAL_STEPS);
  const peakBatch = Math.max(...activeSlots);
  const averageWait = averageWaitSteps(rows);

  return (
    <section className="serving-viz batching-timeline" aria-labelledby="batching-title">
      <div className="serving-viz__header">
        <div>
          <p className="eyebrow">Batching timeline</p>
          <h2 id="batching-title">Keep decode slots full</h2>
        </div>
        <p>
          Static windows make late requests wait for the next batch. Continuous batching admits work
          as soon as a decode slot can join the loop.
        </p>
      </div>

      <div className="serving-controls" aria-label="Batching mode">
        {MODES.map((item) => (
          <button
            aria-pressed={item.id === modeId}
            key={item.id}
            onClick={() => setModeId(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="batching-timeline__stage">
        <div className="batching-timeline__axis" aria-hidden="true">
          <span />
          <div className="batching-timeline__steps">
            {STEP_MARKERS.map((step) => (
              <span key={step.id}>{step.value}</span>
            ))}
          </div>
        </div>

        {rows.map((row) => (
          <div className="batching-row" key={row.id}>
            <div className="batching-row__label">
              <strong>{row.label}</strong>
              <span>{row.promptTokens} prompt tokens</span>
            </div>
            <div className="batching-row__cells">
              {row.cells.map((cell) => (
                <span
                  className={`batching-cell batching-cell--${cell.state}`}
                  key={`${row.id}-${cell.step}`}
                  title={`${row.label}, step ${cell.step}: ${cell.state}`}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="batching-row batching-row--capacity">
          <div className="batching-row__label">
            <strong>active batch</strong>
            <span>requests in loop</span>
          </div>
          <div className="batching-row__cells">
            {STEP_MARKERS.map((step) => {
              const count = activeSlots[step.value] ?? 0;

              return (
                <span
                  className="batching-capacity"
                  key={`capacity-${step.id}`}
                  style={{ "--capacity": count / Math.max(1, peakBatch) } as CSSProperties}
                >
                  {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <dl className="serving-readout">
        <div>
          <dt>Admission</dt>
          <dd>{mode.interval === 1 ? "every step" : `every ${mode.interval} steps`}</dd>
        </div>
        <div>
          <dt>Avg wait</dt>
          <dd>{averageWait.toFixed(1)} steps</dd>
        </div>
        <div>
          <dt>Peak batch</dt>
          <dd>{peakBatch} requests</dd>
        </div>
      </dl>
    </section>
  );
};

export default BatchingTimeline;
