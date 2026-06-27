import { useMemo, useState } from "react";
import { ROUTER_TOKENS, routeExperts } from "../../lib/transformer";

const MoERouter = () => {
  const [tokenId, setTokenId] = useState<string>(ROUTER_TOKENS[0].id);
  const [topK, setTopK] = useState(2);
  const activeToken = ROUTER_TOKENS.find((token) => token.id === tokenId) ?? ROUTER_TOKENS[0];
  const routes = useMemo(
    () => routeExperts(activeToken.features, undefined, topK),
    [activeToken, topK],
  );

  return (
    <section className="m4-panel moe-router" aria-labelledby="moe-title">
      <div className="m4-panel__header">
        <p className="eyebrow">MoE router</p>
        <h2 id="moe-title">Only selected experts run</h2>
        <p>The router scores expert FFNs and activates a small top-k set for the current token.</p>
      </div>
      <div className="moe-router__controls">
        <div className="viz-controls" aria-label="Router token">
          {ROUTER_TOKENS.map((token) => (
            <button
              aria-pressed={token.id === activeToken.id}
              key={token.id}
              onClick={() => setTokenId(token.id)}
              type="button"
            >
              {token.label}
            </button>
          ))}
        </div>
        <label>
          top-k {topK}
          <input
            max="3"
            min="1"
            onChange={(event) => setTopK(Number(event.currentTarget.value))}
            type="range"
            value={topK}
          />
        </label>
      </div>
      <div className="moe-router__experts">
        {routes.map((route) => (
          <div
            className={route.active ? "moe-router__expert is-active" : "moe-router__expert"}
            key={route.expert.id}
          >
            <span>{route.expert.label}</span>
            <meter max="1" min="0" value={route.probability}>
              {Math.round(route.probability * 100)}%
            </meter>
            <strong>{route.active ? "active" : "idle"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoERouter;
