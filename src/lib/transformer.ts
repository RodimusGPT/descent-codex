export type TokenKind = "word" | "subword" | "punctuation";

export type TokenPiece = {
  id: number;
  kind: TokenKind;
  position: number;
  text: string;
};

type UnpositionedTokenPiece = Omit<TokenPiece, "position">;

export type EmbeddingPoint = {
  cluster: "model" | "number" | "serving" | "hardware";
  id: string;
  label: string;
  x: number;
  y: number;
};

export type Expert = {
  id: string;
  label: string;
  weights: readonly number[];
};

export type ExpertRoute = {
  active: boolean;
  expert: Expert;
  probability: number;
  score: number;
};

export type Candidate = {
  id: string;
  logit: number;
  token: string;
};

export type CandidateProbability = Candidate & {
  probability: number;
};

export const TOKENIZER_SAMPLE = "The GPU keeps keys and values ready for decode.";

const vocabularySeed = new Map<string, number>([
  ["the", 464],
  ["gpu", 31817],
  ["keep", 5778],
  ["##s", 82],
  ["key", 2539],
  ["##s", 82],
  ["and", 323],
  ["value", 970],
  ["##s", 82],
  ["ready", 5527],
  ["for", 369],
  ["decode", 38340],
  [".", 13],
]);

export const EMBEDDING_POINTS = [
  { cluster: "model", id: "attention", label: "attention", x: 23, y: 32 },
  { cluster: "model", id: "query", label: "query", x: 32, y: 26 },
  { cluster: "model", id: "logits", label: "logits", x: 38, y: 40 },
  { cluster: "number", id: "float", label: "float", x: 60, y: 34 },
  { cluster: "number", id: "quant", label: "quant", x: 69, y: 42 },
  { cluster: "number", id: "matrix", label: "matrix", x: 58, y: 52 },
  { cluster: "serving", id: "prefill", label: "prefill", x: 38, y: 70 },
  { cluster: "serving", id: "decode", label: "decode", x: 48, y: 78 },
  { cluster: "serving", id: "cache", label: "KV cache", x: 55, y: 67 },
  { cluster: "hardware", id: "tensor", label: "tensor core", x: 78, y: 68 },
  { cluster: "hardware", id: "hbm", label: "HBM", x: 84, y: 52 },
  { cluster: "hardware", id: "sram", label: "SRAM", x: 72, y: 82 },
] as const satisfies readonly EmbeddingPoint[];

export const TRANSFORMER_LAYERS = [
  "embed",
  "layer 1",
  "layer 2",
  "layer 3",
  "layer 4",
  "norm",
  "logits",
] as const;

export const QKV_HEADS = [
  {
    id: "syntax",
    label: "Syntax head",
    query: [0.9, 0.15, 0.35],
    keys: [
      [0.7, 0.18, 0.25],
      [0.82, 0.22, 0.34],
      [0.12, 0.88, 0.3],
    ],
  },
  {
    id: "cache",
    label: "Cache head",
    query: [0.18, 0.92, 0.28],
    keys: [
      [0.24, 0.86, 0.24],
      [0.31, 0.7, 0.32],
      [0.76, 0.2, 0.18],
    ],
  },
] as const;

export const EXPERTS = [
  { id: "syntax", label: "Syntax", weights: [0.7, 0.1, 0.25] },
  { id: "retrieval", label: "Recall", weights: [0.1, 0.86, 0.34] },
  { id: "math", label: "Math", weights: [0.42, 0.28, 0.8] },
  { id: "code", label: "Code", weights: [0.24, 0.52, 0.9] },
] as const satisfies readonly Expert[];

export const ROUTER_TOKENS = [
  { id: "token-context", label: "context", features: [0.72, 0.28, 0.2] },
  { id: "token-cache", label: "KV cache", features: [0.16, 0.9, 0.42] },
  { id: "token-gemm", label: "GEMM", features: [0.3, 0.42, 0.84] },
] as const;

export const SAMPLING_CANDIDATES = [
  { id: "decode", logit: 4.6, token: "decode" },
  { id: "cache", logit: 4.15, token: "cache" },
  { id: "token", logit: 3.4, token: "token" },
  { id: "matrix", logit: 2.85, token: "matrix" },
  { id: "banana", logit: 1.2, token: "banana" },
] as const satisfies readonly Candidate[];

const stableId = (text: string) => {
  let hash = 2166136261;

  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return 1000 + Math.abs(hash % 50000);
};

const pieceId = (piece: string) => vocabularySeed.get(piece.toLowerCase()) ?? stableId(piece);

export const tokenizeText = (input: string): TokenPiece[] => {
  const rawPieces: string[] = input.match(/[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) ?? [];

  const pieces: UnpositionedTokenPiece[] = rawPieces.flatMap((piece): UnpositionedTokenPiece[] => {
    if (/^[^\sA-Za-z\d]$/.test(piece)) {
      return [{ id: pieceId(piece), kind: "punctuation" as const, text: piece }];
    }

    if (piece.length > 6) {
      const head = piece.slice(0, 5).toLowerCase();
      const tail = `##${piece.slice(5).toLowerCase()}`;

      return [
        { id: pieceId(head), kind: "word" as const, text: head },
        { id: pieceId(tail), kind: "subword" as const, text: tail },
      ];
    }

    if (piece.endsWith("s") && piece.length > 3) {
      return [
        {
          id: pieceId(piece.slice(0, -1)),
          kind: "word" as const,
          text: piece.slice(0, -1).toLowerCase(),
        },
        { id: pieceId("##s"), kind: "subword" as const, text: "##s" },
      ];
    }

    return [{ id: pieceId(piece), kind: "word" as const, text: piece.toLowerCase() }];
  });

  return pieces.map((piece, position) => ({ ...piece, position }));
};

export const dot = (left: readonly number[], right: readonly number[]) =>
  left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);

export const softmax = (values: readonly number[], temperature = 1) => {
  const safeTemperature = Math.max(0.05, temperature);
  const scaled = values.map((value) => value / safeTemperature);
  const max = Math.max(...scaled);
  const exp = scaled.map((value) => Math.exp(value - max));
  const total = exp.reduce((sum, value) => sum + value, 0);

  return exp.map((value) => value / total);
};

export const scaledDotScores = (query: readonly number[], keys: readonly (readonly number[])[]) => {
  const scale = Math.sqrt(query.length);
  return keys.map((key) => dot(query, key) / scale);
};

export const routeExperts = (
  features: readonly number[],
  experts: readonly Expert[] = EXPERTS,
  topK = 2,
): ExpertRoute[] => {
  const scores = experts.map((expert) => dot(features, expert.weights));
  const probabilities = softmax(scores);
  const activeIds = new Set(
    scores
      .map((score, index) => ({ index, score }))
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
      .map(({ index }) => experts[index].id),
  );

  return experts
    .map((expert, index) => ({
      active: activeIds.has(expert.id),
      expert,
      probability: probabilities[index],
      score: scores[index],
    }))
    .sort((left, right) => right.score - left.score);
};

export const candidateProbabilities = (
  candidates: readonly Candidate[] = SAMPLING_CANDIDATES,
  temperature = 1,
) => {
  const probabilities = softmax(
    candidates.map((candidate) => candidate.logit),
    temperature,
  );

  return candidates
    .map((candidate, index) => ({
      ...candidate,
      probability: probabilities[index],
    }))
    .sort((left, right) => right.probability - left.probability);
};

export const filterCandidates = (
  candidates: readonly CandidateProbability[],
  topK: number,
  topP: number,
) => {
  const byRank = [...candidates].sort((left, right) => right.probability - left.probability);
  const limited = byRank.slice(0, Math.max(1, topK));
  let cumulative = 0;
  const nucleus: CandidateProbability[] = [];

  for (const candidate of limited) {
    cumulative += candidate.probability;
    nucleus.push(candidate);

    if (cumulative >= topP) {
      break;
    }
  }

  return nucleus;
};
