import type { CSSProperties } from "react";
import { COLOR } from "../../lib/encoding";

type TokenProps = {
  className?: string;
  compact?: boolean;
  highlight?: boolean;
  id?: string | number;
  text: string;
};

const Token = ({ className, compact = false, highlight = false, id, text }: TokenProps) => {
  const style = {
    "--token-bg": highlight ? COLOR.activeWash : COLOR.tokenBg,
    "--token-border": highlight ? COLOR.activeStrong : COLOR.border,
    "--token-color": COLOR.text,
    "--token-size": compact ? "0.78rem" : "0.9rem",
  } as CSSProperties;

  return (
    <span className={["token", className].filter(Boolean).join(" ")} style={style}>
      <span>{text}</span>
      {id !== undefined ? <span className="token__id">#{id}</span> : null}
    </span>
  );
};

export default Token;
