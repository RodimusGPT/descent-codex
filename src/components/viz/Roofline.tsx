import { useMemo, useState } from "react";
import { HARDWARE_PRESETS, rooflinePoint } from "../../lib/hardware";

const PLOT = {
  height: 240,
  left: 48,
  top: 24,
  width: 360,
};

const Roofline = () => {
  const [batchSize, setBatchSize] = useState(1);
  const [presetId, setPresetId] = useState<string>(HARDWARE_PRESETS[0].id);
  const hardware = HARDWARE_PRESETS.find((preset) => preset.id === presetId) ?? HARDWARE_PRESETS[0];
  const point = rooflinePoint(batchSize, hardware, 0.9);
  const maxIntensity = point.ridgePoint * 1.35;
  const pointX = PLOT.left + Math.min(1, point.arithmeticIntensity / maxIntensity) * PLOT.width;
  const pointY =
    PLOT.top +
    PLOT.height -
    Math.min(1, point.attainableTflops / hardware.peakTflops) * PLOT.height;
  const ridgeX = PLOT.left + Math.min(1, point.ridgePoint / maxIntensity) * PLOT.width;
  const memoryLine = useMemo(
    () => `M ${PLOT.left} ${PLOT.top + PLOT.height} L ${ridgeX} ${PLOT.top}`,
    [ridgeX],
  );
  const computeLine = `M ${ridgeX} ${PLOT.top} L ${PLOT.left + PLOT.width} ${PLOT.top}`;

  return (
    <section className="hardware-viz roofline" aria-labelledby="roofline-title">
      <div className="hardware-viz__header">
        <div>
          <p className="eyebrow">Roofline</p>
          <h2 id="roofline-title">Batch size moves decode up the roof</h2>
        </div>
        <p>
          Arithmetic intensity is FLOPs per byte. Low intensity hits the memory-bandwidth slope;
          high intensity reaches the compute roof.
        </p>
      </div>

      <div className="hardware-controls hardware-controls--split">
        <label>
          decode batch: {batchSize}
          <input
            max="512"
            min="1"
            onChange={(event) => setBatchSize(Number(event.currentTarget.value))}
            step="1"
            type="range"
            value={batchSize}
          />
        </label>
        <div className="viz-controls" aria-label="Hardware preset">
          {HARDWARE_PRESETS.map((preset) => (
            <button
              aria-pressed={preset.id === presetId}
              key={preset.id}
              onClick={() => setPresetId(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <svg className="roofline__plot" role="img" viewBox="0 0 440 300">
        <title>Roofline chart</title>
        <line className="roofline__axis" x1="48" x2="408" y1="264" y2="264" />
        <line className="roofline__axis" x1="48" x2="48" y1="24" y2="264" />
        <path className="roofline__memory" d={memoryLine} />
        <path className="roofline__compute" d={computeLine} />
        <line className="roofline__ridge" x1={ridgeX} x2={ridgeX} y1="24" y2="264" />
        <circle className="roofline__point" cx={pointX} cy={pointY} r="8" />
        <text className="roofline__label" x="50" y="286">
          arithmetic intensity
        </text>
        <text className="roofline__label" x="12" y="24">
          TFLOP/s
        </text>
      </svg>

      <dl className="hardware-readout">
        <div>
          <dt>Intensity</dt>
          <dd>{point.arithmeticIntensity.toFixed(1)} FLOP/B</dd>
        </div>
        <div>
          <dt>Bottleneck</dt>
          <dd>{point.bottleneck}</dd>
        </div>
        <div>
          <dt>Attainable</dt>
          <dd>{point.attainableTflops.toFixed(0)} TFLOP/s</dd>
        </div>
      </dl>
    </section>
  );
};

export default Roofline;
