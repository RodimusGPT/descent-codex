export type MemoryPreset = {
  headDim: number;
  id: string;
  label: string;
  nKvHeads: number;
  nLayers: number;
  paramsBillions: number;
};

export type KvCacheInput = {
  bytesPerValue: number;
  headDim: number;
  nKvHeads: number;
  nLayers: number;
  seqLen: number;
};

export type WorkEstimate = {
  decodeWork: number;
  prefillWork: number;
  totalWork: number;
};

export type MemoryBudgetInput = {
  overheadRatio?: number;
  paramsBillions: number;
  weightBytesPerParam: number;
  kvBytes: number;
};

export type MemoryBudgetBreakdown = {
  kvBytes: number;
  overheadBytes: number;
  totalBytes: number;
  weightBytes: number;
};

export const MEMORY_PRESETS = [
  {
    headDim: 128,
    id: "mha-7b",
    label: "7B MHA, 32 KV heads",
    nKvHeads: 32,
    nLayers: 32,
    paramsBillions: 7,
  },
  {
    headDim: 128,
    id: "gqa-7b",
    label: "7B GQA, 8 KV heads",
    nKvHeads: 8,
    nLayers: 32,
    paramsBillions: 7,
  },
  {
    headDim: 128,
    id: "mqa-7b",
    label: "7B MQA, 1 KV head",
    nKvHeads: 1,
    nLayers: 32,
    paramsBillions: 7,
  },
] as const satisfies readonly MemoryPreset[];

export const kvCacheBytes = ({ bytesPerValue, headDim, nKvHeads, nLayers, seqLen }: KvCacheInput) =>
  2 * nLayers * nKvHeads * headDim * seqLen * bytesPerValue;

export const weightMemoryBytes = (paramsBillions: number, bytesPerParam: number) =>
  paramsBillions * 1_000_000_000 * bytesPerParam;

export const memoryBudgetBreakdown = ({
  overheadRatio = 0.08,
  paramsBillions,
  weightBytesPerParam,
  kvBytes,
}: MemoryBudgetInput): MemoryBudgetBreakdown => {
  const weightBytes = weightMemoryBytes(paramsBillions, weightBytesPerParam);
  const overheadBytes = (weightBytes + kvBytes) * overheadRatio;

  return {
    kvBytes,
    overheadBytes,
    totalBytes: weightBytes + kvBytes + overheadBytes,
    weightBytes,
  };
};

export const decodeWorkUnits = (
  contextLength: number,
  generatedTokens: number,
  useCache: boolean,
) => {
  if (generatedTokens <= 0) {
    return 0;
  }

  if (useCache) {
    return generatedTokens;
  }

  return Array.from({ length: generatedTokens }, (_, index) => contextLength + index + 1).reduce(
    (sum, units) => sum + units,
    0,
  );
};

export const prefillDecodeWork = (
  contextLength: number,
  generatedTokens: number,
  useCache: boolean,
): WorkEstimate => {
  const prefillWork = contextLength;
  const decodeWork = decodeWorkUnits(contextLength, generatedTokens, useCache);

  return {
    decodeWork,
    prefillWork,
    totalWork: prefillWork + decodeWork,
  };
};

export const gqaSavingsRatio = (fullKvHeads: number, reducedKvHeads: number) =>
  fullKvHeads / reducedKvHeads;

export const formatBytes = (bytes: number) => {
  const gib = bytes / 1024 ** 3;

  if (gib >= 1) {
    return `${gib.toFixed(2)} GiB`;
  }

  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
};
