import type { ReactNode } from "react";

type DeeperBlockProps = {
  children: ReactNode;
  summary: ReactNode;
};

const DeeperBlock = ({ children, summary }: DeeperBlockProps) => (
  <details className="deeper-block">
    <summary>{summary}</summary>
    <div className="deeper-block__body">{children}</div>
  </details>
);

export default DeeperBlock;
