import { HARDWARE_PRESETS } from "./hardware";
import { formatBytes, kvCacheBytes, memoryBudgetBreakdown, weightMemoryBytes } from "./memory";
import { type PrecisionId, getPrecisionSpec } from "./quant";
import {
  type Candidate,
  type CandidateProbability,
  candidateProbabilities,
  tokenizeText,
} from "./transformer";

export type ModelConfig = {
  headDim: number;
  id: string;
  kvHeads: number;
  label: string;
  layers: number;
  paramsBillions: number;
};

export type GpuConfig = {
  bandwidthTbps: number;
  id: string;
  label: string;
  memoryGb: number;
};

export type ConfigEstimateInput = {
  contextLength: number;
  gpuId: string;
  modelId: string;
  precision: PrecisionId;
};

export type ConfigEstimate = {
  fits: boolean;
  gpu: GpuConfig;
  kvBytes: number;
  model: ModelConfig;
  tokPerSecond: number;
  totalBytes: number;
  weightBytes: number;
};

export type ReplayStep = {
  detail: string;
  id: string;
  label: string;
};

const PROMPT_CANDIDATES = [
  { id: "token", logit: 3.6, token: "token" },
  { id: "decode", logit: 3.2, token: "decode" },
  { id: "cache", logit: 3.0, token: "cache" },
  { id: "hardware", logit: 2.65, token: "hardware" },
  { id: "weights", logit: 2.4, token: "weights" },
] as const satisfies readonly Candidate[];

export const MODEL_CONFIGS = [
  {
    headDim: 128,
    id: "7b",
    kvHeads: 8,
    label: "7B dense",
    layers: 32,
    paramsBillions: 7,
  },
  {
    headDim: 128,
    id: "70b",
    kvHeads: 8,
    label: "70B dense",
    layers: 80,
    paramsBillions: 70,
  },
] as const satisfies readonly ModelConfig[];

export const GPU_CONFIGS = [
  {
    bandwidthTbps: HARDWARE_PRESETS[1].bandwidthTbps,
    id: "24gb",
    label: "24 GB workstation",
    memoryGb: 24,
  },
  {
    bandwidthTbps: HARDWARE_PRESETS[0].bandwidthTbps,
    id: "80gb",
    label: "80 GB datacenter",
    memoryGb: 80,
  },
] as const satisfies readonly GpuConfig[];

export const STACK_REPLAY_STEPS = [
  {
    detail: "The prompt 'The GPU keeps KV cache ready for' is split into token IDs.",
    id: "text",
    label: "text",
  },
  {
    detail:
      "Embeddings, RoPE, attention, FFNs, and sampling turn that context into next-token logits.",
    id: "model",
    label: "model",
  },
  {
    detail:
      "Weights, activations, and KV cache are finite-precision numbers, so storage format affects fit and bandwidth.",
    id: "numbers",
    label: "numbers",
  },
  {
    detail:
      "The serving engine prefills the prompt, stores KV cache, batches decode steps, and keeps the loop moving.",
    id: "software",
    label: "software",
  },
  {
    detail:
      "Tensor cores run tiled GEMMs while HBM, SRAM, and network traffic decide the bottleneck.",
    id: "hardware",
    label: "hardware",
  },
  {
    detail:
      "A token such as 'decode' is appended, then the whole stack repeats for the next token.",
    id: "output",
    label: "output",
  },
] as const satisfies readonly ReplayStep[];

const promptBoosts = (prompt: string, candidate: Candidate) => {
  const lower = prompt.toLowerCase();
  let boost = 0;

  if (lower.includes("gpu") || lower.includes("hardware")) {
    boost += candidate.id === "hardware" ? 1.1 : 0;
  }

  if (lower.includes("cache") || lower.includes("decode")) {
    boost += candidate.id === "cache" || candidate.id === "decode" ? 0.8 : 0;
  }

  if (lower.includes("weight") || lower.includes("quant")) {
    boost += candidate.id === "weights" ? 1.5 : 0;
  }

  boost += Math.min(0.4, tokenizeText(prompt).length * 0.02);

  return boost;
};

export const promptCandidates = (prompt: string, temperature = 0.85): CandidateProbability[] => {
  const adjusted = PROMPT_CANDIDATES.map((candidate) => ({
    ...candidate,
    logit: candidate.logit + promptBoosts(prompt, candidate),
  }));

  return candidateProbabilities(adjusted, temperature);
};

export const predictedToken = (prompt: string, temperature = 0.85) =>
  promptCandidates(prompt, temperature)[0];

export const getModelConfig = (modelId: string) =>
  MODEL_CONFIGS.find((model) => model.id === modelId) ?? MODEL_CONFIGS[0];

export const getGpuConfig = (gpuId: string) =>
  GPU_CONFIGS.find((gpu) => gpu.id === gpuId) ?? GPU_CONFIGS[0];

export const estimateConfig = ({
  contextLength,
  gpuId,
  modelId,
  precision,
}: ConfigEstimateInput): ConfigEstimate => {
  const model = getModelConfig(modelId);
  const gpu = getGpuConfig(gpuId);
  const precisionSpec = getPrecisionSpec(precision);
  const kvBytes = kvCacheBytes({
    bytesPerValue: 2,
    headDim: model.headDim,
    nKvHeads: model.kvHeads,
    nLayers: model.layers,
    seqLen: contextLength,
  });
  const budget = memoryBudgetBreakdown({
    kvBytes,
    overheadRatio: 0.1,
    paramsBillions: model.paramsBillions,
    weightBytesPerParam: precisionSpec.bytesPerParam,
  });
  const memoryBytes = gpu.memoryGb * 1024 ** 3;
  const bytesReadPerToken = Math.max(
    1,
    weightMemoryBytes(model.paramsBillions, precisionSpec.bytesPerParam),
  );
  const tokPerSecond = (gpu.bandwidthTbps * 1_000_000_000_000) / bytesReadPerToken;

  return {
    fits: budget.totalBytes <= memoryBytes,
    gpu,
    kvBytes,
    model,
    tokPerSecond,
    totalBytes: budget.totalBytes,
    weightBytes: budget.weightBytes,
  };
};

export const formatEstimateBytes = formatBytes;
