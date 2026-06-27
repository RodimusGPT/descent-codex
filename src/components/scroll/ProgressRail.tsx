import { useEffect, useMemo, useState } from "react";
import type { Part } from "../../lib/parts";

type ProgressRailProps = {
  currentPart: number;
  parts: readonly Part[];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const ProgressRail = ({ currentPart, parts }: ProgressRailProps) => {
  const [progress, setProgress] = useState(0);
  const activePart = useMemo(
    () => parts.find((part) => part.index === currentPart) ?? parts[0],
    [currentPart, parts],
  );

  useEffect(() => {
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollable <= 0 ? 0 : clamp01(window.scrollY / scrollable));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <nav
      aria-label="Descent progress"
      className="progress-rail"
      style={{ "--rail-progress": progress } as React.CSSProperties}
    >
      {parts.map((part) => (
        <a
          aria-current={part.index === currentPart ? "page" : undefined}
          aria-label={`Part ${part.index}: ${part.title}`}
          href={`/parts/${part.slug}`}
          key={part.slug}
          title={part.title}
        >
          {part.index}
        </a>
      ))}
      <span className="progress-rail__label">{activePart.title}</span>
    </nav>
  );
};

export default ProgressRail;
