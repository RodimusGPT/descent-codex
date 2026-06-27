import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { buildBlockTable, pagedKvStats, prefixSharingSavings } from "../../lib/serving";

const BLOCK_SIZES = [8, 16, 32] as const;

const PagedAttention = () => {
  const [blockSize, setBlockSize] = useState<(typeof BLOCK_SIZES)[number]>(16);
  const [seqLen, setSeqLen] = useState(54);
  const table = useMemo(() => buildBlockTable(seqLen, blockSize, 20), [blockSize, seqLen]);
  const logicalTokens = useMemo(
    () =>
      Array.from({ length: seqLen }, (_, token) => ({ id: `token-${token + 1}`, value: token })),
    [seqLen],
  );
  const stats = pagedKvStats([seqLen, 38, 24], blockSize);
  const sharing = prefixSharingSavings(3, 32, blockSize);

  return (
    <section className="serving-viz paged-attention" aria-labelledby="paged-title">
      <div className="serving-viz__header">
        <div>
          <p className="eyebrow">PagedAttention</p>
          <h2 id="paged-title">Page KV cache into blocks</h2>
        </div>
        <p>
          The cache can grow token by token while the allocator hands out fixed-size blocks and a
          block table maps logical positions to physical memory pages.
        </p>
      </div>

      <div className="serving-controls serving-controls--split">
        <label>
          sequence length: {seqLen}
          <input
            max="80"
            min="12"
            onChange={(event) => setSeqLen(Number(event.currentTarget.value))}
            step="2"
            type="range"
            value={seqLen}
          />
        </label>
        <div className="viz-controls" aria-label="KV block size">
          {BLOCK_SIZES.map((size) => (
            <button
              aria-pressed={size === blockSize}
              key={size}
              onClick={() => setBlockSize(size)}
              type="button"
            >
              {size} tokens
            </button>
          ))}
        </div>
      </div>

      <div className="paged-attention__stage">
        <div className="paged-attention__logical">
          <h3>Logical sequence</h3>
          <div className="paged-attention__tokens">
            {logicalTokens.map((token) => (
              <span key={token.id}>{token.value + 1}</span>
            ))}
          </div>
        </div>

        <div className="paged-attention__table">
          <h3>Block table</h3>
          {table.map((entry) => (
            <div className="paged-block" key={entry.logicalBlock}>
              <span>L{entry.logicalBlock}</span>
              <strong>phys {entry.physicalBlock}</strong>
              <span>
                {entry.tokenStart}-{entry.tokenEnd - 1}
              </span>
              <span
                className="paged-block__fill"
                style={
                  {
                    "--block-fill": entry.usedTokens / blockSize,
                  } as CSSProperties
                }
              >
                {entry.usedTokens}/{blockSize}
              </span>
            </div>
          ))}
        </div>
      </div>

      <dl className="serving-readout">
        <div>
          <dt>Blocks</dt>
          <dd>{stats.totalBlocks}</dd>
        </div>
        <div>
          <dt>Tail waste</dt>
          <dd>{stats.wasteTokens} tokens</dd>
        </div>
        <div>
          <dt>Prefix share</dt>
          <dd>{sharing.blocksSaved} blocks saved</dd>
        </div>
      </dl>
    </section>
  );
};

export default PagedAttention;
