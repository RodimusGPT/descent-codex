export type HardwarePreset = {
  bandwidthTbps: number;
  id: string;
  label: string;
  peakTflops: number;
};

export type RooflinePoint = {
  arithmeticIntensity: number;
  attainableTflops: number;
  batchSize: number;
  bottleneck: "compute" | "memory";
  memoryLimitedTflops: number;
  ridgePoint: number;
};

export type GemmTileGrid = {
  cols: number;
  rows: number;
  tileCount: number;
  tileSize: number;
};

export type AttentionTraffic = {
  flashBytes: number;
  naiveBytes: number;
  savedBytes: number;
};

export type ParallelismMode = "tp" | "pp" | "ep";

export type ParallelismStep = {
  id: string;
  label: string;
  traffic: "all-reduce" | "pipeline" | "all-to-all";
};

export const HARDWARE_PRESETS = [
  {
    bandwidthTbps: 3.2,
    id: "datacenter",
    label: "Datacenter GPU",
    peakTflops: 1000,
  },
  {
    bandwidthTbps: 0.9,
    id: "workstation",
    label: "Workstation GPU",
    peakTflops: 240,
  },
] as const satisfies readonly HardwarePreset[];

export const MEMORY_LEVELS = [
  { id: "registers", label: "Registers", relativeCapacity: 1, relativeSpeed: 14 },
  { id: "sram", label: "SRAM / shared", relativeCapacity: 2, relativeSpeed: 10 },
  { id: "l2", label: "L2 cache", relativeCapacity: 4, relativeSpeed: 5 },
  { id: "hbm", label: "HBM", relativeCapacity: 12, relativeSpeed: 1 },
] as const;

export const decodeArithmeticIntensity = (batchSize: number, baseFlopsPerByte = 0.9) =>
  Math.max(1, Math.floor(batchSize)) * baseFlopsPerByte;

export const rooflinePoint = (
  batchSize: number,
  hardware: HardwarePreset,
  baseFlopsPerByte = 0.9,
): RooflinePoint => {
  const arithmeticIntensity = decodeArithmeticIntensity(batchSize, baseFlopsPerByte);
  const ridgePoint = hardware.peakTflops / hardware.bandwidthTbps;
  const memoryLimitedTflops = arithmeticIntensity * hardware.bandwidthTbps;
  const attainableTflops = Math.min(hardware.peakTflops, memoryLimitedTflops);

  return {
    arithmeticIntensity,
    attainableTflops,
    batchSize: Math.max(1, Math.floor(batchSize)),
    bottleneck: arithmeticIntensity >= ridgePoint ? "compute" : "memory",
    memoryLimitedTflops,
    ridgePoint,
  };
};

export const gemmTileGrid = (
  matrixRows: number,
  matrixCols: number,
  tileSize: number,
): GemmTileGrid => {
  const safeTileSize = Math.max(1, Math.floor(tileSize));
  const rows = Math.ceil(Math.max(0, matrixRows) / safeTileSize);
  const cols = Math.ceil(Math.max(0, matrixCols) / safeTileSize);

  return {
    cols,
    rows,
    tileCount: rows * cols,
    tileSize: safeTileSize,
  };
};

export const attentionTrafficBytes = (
  seqLen: number,
  headDim: number,
  bytesPerValue: number,
): AttentionTraffic => {
  const safeSeqLen = Math.max(1, Math.floor(seqLen));
  const safeHeadDim = Math.max(1, Math.floor(headDim));
  const safeBytes = Math.max(1, bytesPerValue);
  const qkvBytes = 3 * safeSeqLen * safeHeadDim * safeBytes;
  const outputBytes = safeSeqLen * safeHeadDim * safeBytes;
  const materializedScores = 2 * safeSeqLen * safeSeqLen * safeBytes;
  const streamingStats = 2 * safeSeqLen * safeBytes;
  const naiveBytes = qkvBytes + outputBytes + materializedScores;
  const flashBytes = qkvBytes + outputBytes + streamingStats;

  return {
    flashBytes,
    naiveBytes,
    savedBytes: naiveBytes - flashBytes,
  };
};

export const parallelismPlan = (mode: ParallelismMode, width: number): ParallelismStep[] => {
  const safeWidth = Math.max(2, Math.floor(width));

  if (mode === "tp") {
    return Array.from({ length: safeWidth }, (_, index) => ({
      id: `tp-${index}`,
      label: `matrix shard ${index + 1}`,
      traffic: "all-reduce",
    }));
  }

  if (mode === "pp") {
    return Array.from({ length: safeWidth }, (_, index) => ({
      id: `pp-${index}`,
      label: `layer stage ${index + 1}`,
      traffic: "pipeline",
    }));
  }

  return Array.from({ length: safeWidth }, (_, index) => ({
    id: `ep-${index}`,
    label: `expert group ${index + 1}`,
    traffic: "all-to-all",
  }));
};

export const formatBytesCompact = (bytes: number) => {
  const gib = bytes / 1024 ** 3;
  const mib = bytes / 1024 ** 2;

  if (gib >= 1) {
    return `${gib.toFixed(2)} GiB`;
  }

  return `${mib.toFixed(1)} MiB`;
};
