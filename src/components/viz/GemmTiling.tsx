import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { gemmTileGrid } from "../../lib/hardware";

const TILE_SIZES = [16, 32, 64] as const;
const MATRIX_ROWS = 128;
const MATRIX_COLS = 192;

const GemmTiling = () => {
  const [tileSize, setTileSize] = useState<(typeof TILE_SIZES)[number]>(32);
  const grid = gemmTileGrid(MATRIX_ROWS, MATRIX_COLS, tileSize);
  const tiles = useMemo(
    () =>
      Array.from({ length: grid.tileCount }, (_, tile) => {
        const row = Math.floor(tile / grid.cols);
        const col = tile % grid.cols;

        return {
          col,
          id: `tile-${row}-${col}`,
          row,
        };
      }),
    [grid.cols, grid.tileCount],
  );

  return (
    <section className="hardware-viz gemm-tiling" aria-labelledby="gemm-title">
      <div className="hardware-viz__header">
        <div>
          <p className="eyebrow">GEMM tiling</p>
          <h2 id="gemm-title">Tensor cores eat tiles</h2>
        </div>
        <p>
          Matrix multiply is split into tiles that fit near the tensor cores. Larger tiles improve
          reuse but need more SRAM and register space.
        </p>
      </div>

      <div className="hardware-controls" aria-label="Tile size">
        {TILE_SIZES.map((size) => (
          <button
            aria-pressed={size === tileSize}
            key={size}
            onClick={() => setTileSize(size)}
            type="button"
          >
            {size}x{size}
          </button>
        ))}
      </div>

      <div className="gemm-tiling__grid" style={{ "--gemm-cols": grid.cols } as CSSProperties}>
        {tiles.map((tile) => (
          <span
            className={tile.row === 0 && tile.col === 0 ? "is-active" : undefined}
            key={tile.id}
          >
            {tile.row},{tile.col}
          </span>
        ))}
      </div>

      <dl className="hardware-readout">
        <div>
          <dt>Matrix</dt>
          <dd>
            {MATRIX_ROWS}x{MATRIX_COLS}
          </dd>
        </div>
        <div>
          <dt>Tile size</dt>
          <dd>{grid.tileSize}</dd>
        </div>
        <div>
          <dt>Tiles</dt>
          <dd>{grid.tileCount}</dd>
        </div>
      </dl>
    </section>
  );
};

export default GemmTiling;
