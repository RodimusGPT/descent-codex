import type { CSSProperties } from "react";

type TokenProps = {
  className?: string;
  compact?: boolean;
  highlight?: boolean;
  id?: string | number;
  text: string;
};

const Token = ({ className, compact = false, highlight = false, id, text }: TokenProps) => {
  const style = {
    "--token-bg": highlight ? "var(--color-active-wash)" : "var(--color-token-bg)",
    "--token-border": highlight ? "var(--color-active-strong)" : "var(--color-border)",
    "--token-color": highlight ? "var(--color-on-active-wash)" : "var(--color-token-text)",
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
