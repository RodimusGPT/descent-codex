export const COLOR = {
  active: "#f5a524",
  activeStrong: "#ef5d3d",
  activeWash: "#fff2d2",
  bg: "#f8fafc",
  border: "#cbd5e1",
  cache: "#20a36b",
  hwAccent: "#0f766e",
  inert: "#64748b",
  inertSoft: "#e2e8f0",
  modelAccent: "#7c3aed",
  surface: "#ffffff",
  text: "#0f172a",
  textMuted: "#475569",
  tokenBg: "#eef2ff",
} as const;

export const TYPE_SCALE = {
  body: "1rem",
  caption: "0.8125rem",
  display: "clamp(2.6rem, 5vw, 5rem)",
  heading: "clamp(1.8rem, 3vw, 3rem)",
  mono: "0.875rem",
} as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

const mix = (from: string, to: string, amount: number) => {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const t = clamp01(amount);

  return rgbToHex({
    r: start.r + (end.r - start.r) * t,
    g: start.g + (end.g - start.g) * t,
    b: start.b + (end.b - start.b) * t,
  });
};

export const weightToColor = (weight: number) => mix(COLOR.inert, COLOR.activeStrong, weight);
