import { weightToColor } from "./encoding";

export type AttentionHead = {
  description: string;
  id: string;
  label: string;
  matrix: number[][];
};

export type AttentionGeometry = {
  opacity: number;
  width: number;
};

export const ATTENTION_TOKENS = [
  "The",
  "GPU",
  "keeps",
  "keys",
  "and",
  "values",
  "ready",
  "for",
  "decode",
  ".",
] as const;

const TOKEN_COUNT = ATTENTION_TOKENS.length;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const normalizeRow = (row: number[]) => {
  const total = row.reduce((sum, value) => sum + value, 0);
  return row.map((value) => value / total);
};

const makeRow = (boosts: Record<number, number>, fallback = 0.03) =>
  normalizeRow(
    Array.from({ length: TOKEN_COUNT }, (_, index) =>
      Object.hasOwn(boosts, index) ? boosts[index] : fallback,
    ),
  );

const previousTokenHead = Array.from({ length: TOKEN_COUNT }, (_, queryIndex) =>
  makeRow({
    [Math.max(0, queryIndex - 1)]: 0.72,
    [queryIndex]: 0.2,
  }),
);

const syntaxBridgeHead = [
  makeRow({ 0: 0.2, 1: 0.7 }),
  makeRow({ 1: 0.22, 2: 0.68 }),
  makeRow({ 1: 0.34, 2: 0.14, 3: 0.22, 5: 0.22 }),
  makeRow({ 2: 0.42, 3: 0.18, 5: 0.3 }),
  makeRow({ 3: 0.42, 4: 0.12, 5: 0.42 }),
  makeRow({ 2: 0.28, 3: 0.28, 5: 0.3 }),
  makeRow({ 5: 0.28, 6: 0.22, 8: 0.28 }),
  makeRow({ 7: 0.2, 8: 0.68 }),
  makeRow({ 6: 0.28, 7: 0.28, 8: 0.28 }),
  makeRow({ 8: 0.68, 9: 0.2 }),
];

const diffuseContextHead = Array.from({ length: TOKEN_COUNT }, (_, queryIndex) =>
  makeRow(
    Object.fromEntries(
      Array.from({ length: TOKEN_COUNT }, (_, keyIndex) => {
        const distance = Math.abs(queryIndex - keyIndex);
        const value = distance === 0 ? 0.18 : Math.max(0.05, 0.14 - distance * 0.015);
        return [keyIndex, value];
      }),
    ),
    0.05,
  ),
);

export const ATTENTION_HEADS = [
  {
    description: "Mostly reads the immediately preceding token.",
    id: "previous",
    label: "Previous token",
    matrix: previousTokenHead,
  },
  {
    description: "Bridges the subject, verb, and object-like tokens.",
    id: "syntax",
    label: "Syntax bridge",
    matrix: syntaxBridgeHead,
  },
  {
    description: "Spreads attention across nearby context instead of one strong target.",
    id: "diffuse",
    label: "Diffuse context",
    matrix: diffuseContextHead,
  },
] as const satisfies readonly AttentionHead[];

export const weightToGeometry = (weight: number): AttentionGeometry => {
  const clamped = clamp01(weight);

  return {
    opacity: 0.14 + clamped * 0.76,
    width: 0.75 + clamped * 5.25,
  };
};

export const tokenX = (index: number, count: number, width = 1000) => {
  if (count <= 1) {
    return width / 2;
  }

  const gutter = width * 0.06;
  const span = width - gutter * 2;

  return gutter + (span * index) / (count - 1);
};

export const attentionPath = (queryIndex: number, keyIndex: number, count: number) => {
  const queryX = tokenX(queryIndex, count);
  const keyX = tokenX(keyIndex, count);
  const lift = 84 + Math.abs(queryIndex - keyIndex) * 8;

  if (queryIndex === keyIndex) {
    return `M ${queryX} 76 C ${queryX - 22} 34 ${queryX + 22} 34 ${queryX} 76`;
  }

  return `M ${queryX} 76 C ${queryX} ${lift} ${keyX} ${lift} ${keyX} 76`;
};

export const attentionStrokeForWeight = (weight: number) => ({
  ...weightToGeometry(weight),
  color: weightToColor(weight),
});
