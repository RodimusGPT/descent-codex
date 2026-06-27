export const LIGHT_COLOR = {
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
  tokenText: "#312e81",
  onActive: "#0f172a",
  onActiveWash: "#0f172a",
} as const;

export const DARK_COLOR = {
  ...LIGHT_COLOR,
  active: "#fbbf24",
  activeStrong: "#fb923c",
  activeWash: "#3b2a12",
  bg: "#10131a",
  border: "#334155",
  cache: "#34d399",
  hwAccent: "#5eead4",
  inertSoft: "#1f2937",
  modelAccent: "#c4b5fd",
  surface: "#171c24",
  text: "#f8fafc",
  textMuted: "#cbd5e1",
  tokenBg: "#1e1b4b",
  tokenText: "#e0e7ff",
  onActive: "#0f172a",
  onActiveWash: "#f8fafc",
} as const;

export const COLOR = LIGHT_COLOR;

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
