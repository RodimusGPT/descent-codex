import type { CSSProperties } from "react";
import { MEMORY_LEVELS } from "../../lib/hardware";

const SM_CLUSTERS = Array.from({ length: 16 }, (_, index) => ({
  id: `sm-${index + 1}`,
  label: `SM ${index + 1}`,
}));

const GpuFloorplan = () => {
  return (
    <section className="hardware-viz gpu-floorplan" aria-labelledby="gpu-floorplan-title">
      <div className="hardware-viz__header">
        <div>
          <p className="eyebrow">GPU floorplan</p>
          <h2 id="gpu-floorplan-title">Many small engines around fast memory</h2>
        </div>
        <p>
          Streaming multiprocessors hold tensor cores and local SRAM. HBM sits outside the chip core
          and feeds the work through much wider, slower paths.
        </p>
      </div>

      <div className="gpu-floorplan__stage">
        <div className="gpu-floorplan__chip" aria-label="Simplified GPU chip">
          <div className="gpu-floorplan__hbm">HBM stacks</div>
          <div className="gpu-floorplan__sm-grid">
            {SM_CLUSTERS.map((cluster) => (
              <span key={cluster.id}>{cluster.label}</span>
            ))}
          </div>
          <div className="gpu-floorplan__l2">L2 cache fabric</div>
        </div>

        <div className="memory-pyramid" aria-label="Memory hierarchy">
          {MEMORY_LEVELS.map((level) => (
            <div
              className="memory-pyramid__level"
              key={level.id}
              style={
                {
                  "--level-capacity": level.relativeCapacity / 12,
                  "--level-speed": level.relativeSpeed / 14,
                } as CSSProperties
              }
            >
              <strong>{level.label}</strong>
              <span>speed x{level.relativeSpeed}</span>
            </div>
          ))}
        </div>
      </div>

      <dl className="hardware-readout">
        <div>
          <dt>Compute</dt>
          <dd>SMs + tensor cores</dd>
        </div>
        <div>
          <dt>Near memory</dt>
          <dd>registers / SRAM</dd>
        </div>
        <div>
          <dt>Far memory</dt>
          <dd>HBM bandwidth</dd>
        </div>
      </dl>
    </section>
  );
};

export default GpuFloorplan;
