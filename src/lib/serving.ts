export type ServeRequest = {
  arrivalStep: number;
  decodeSteps: number;
  id: string;
  label: string;
  promptTokens: number;
};

export type TimelineCellState = "empty" | "waiting" | "active" | "done";

export type TimelineCell = {
  state: TimelineCellState;
  step: number;
};

export type ScheduledRequest = ServeRequest & {
  cells: TimelineCell[];
  endStep: number;
  startStep: number;
  waitSteps: number;
};

export type BlockTableEntry = {
  logicalBlock: number;
  physicalBlock: number;
  tokenEnd: number;
  tokenStart: number;
  usedTokens: number;
  wasteTokens: number;
};

export type PagedKvStats = {
  allocatedTokens: number;
  blockSize: number;
  totalBlocks: number;
  usedTokens: number;
  wasteTokens: number;
};

export type PrefixSharingSavings = {
  blocksSaved: number;
  sharedBlocks: number;
  tokensSaved: number;
};

export type SpeculativeInput = {
  acceptanceRate: number;
  candidateTokens: number;
  draftTokenMs: number;
  targetTokenMs: number;
  verifyPassMs: number;
};

export type SpeculativeEstimate = {
  cycleMs: number;
  expectedAcceptedDraftTokens: number;
  expectedOutputTokens: number;
  baselineMs: number;
  speedup: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const scheduleBatchTimeline = (
  requests: readonly ServeRequest[],
  totalSteps: number,
  admissionInterval: number,
): ScheduledRequest[] => {
  const interval = Math.max(1, Math.floor(admissionInterval));

  return requests.map((request) => {
    const startStep = Math.ceil(request.arrivalStep / interval) * interval;
    const endStep = startStep + request.decodeSteps;
    const cells = Array.from({ length: totalSteps }, (_, step): TimelineCell => {
      if (step < request.arrivalStep) {
        return { state: "empty", step };
      }

      if (step < startStep) {
        return { state: "waiting", step };
      }

      if (step < endStep) {
        return { state: "active", step };
      }

      return { state: "done", step };
    });

    return {
      ...request,
      cells,
      endStep,
      startStep,
      waitSteps: startStep - request.arrivalStep,
    };
  });
};

export const averageWaitSteps = (rows: readonly ScheduledRequest[]) =>
  rows.length === 0 ? 0 : rows.reduce((sum, row) => sum + row.waitSteps, 0) / rows.length;

export const activeSlotsByStep = (rows: readonly ScheduledRequest[], totalSteps: number) =>
  Array.from(
    { length: totalSteps },
    (_, step) => rows.filter((row) => step >= row.startStep && step < row.endStep).length,
  );

export const buildBlockTable = (
  seqLen: number,
  blockSize: number,
  physicalOffset = 0,
): BlockTableEntry[] => {
  if (seqLen <= 0 || blockSize <= 0) {
    return [];
  }

  const blockCount = Math.ceil(seqLen / blockSize);

  return Array.from({ length: blockCount }, (_, logicalBlock) => {
    const tokenStart = logicalBlock * blockSize;
    const tokenEnd = Math.min(seqLen, tokenStart + blockSize);
    const usedTokens = tokenEnd - tokenStart;

    return {
      logicalBlock,
      physicalBlock: physicalOffset + logicalBlock,
      tokenEnd,
      tokenStart,
      usedTokens,
      wasteTokens: blockSize - usedTokens,
    };
  });
};

export const pagedKvStats = (
  sequenceLengths: readonly number[],
  blockSize: number,
): PagedKvStats => {
  const safeBlockSize = Math.max(1, blockSize);
  const totalBlocks = sequenceLengths.reduce(
    (sum, seqLen) => sum + Math.ceil(Math.max(0, seqLen) / safeBlockSize),
    0,
  );
  const usedTokens = sequenceLengths.reduce((sum, seqLen) => sum + Math.max(0, seqLen), 0);
  const allocatedTokens = totalBlocks * safeBlockSize;

  return {
    allocatedTokens,
    blockSize: safeBlockSize,
    totalBlocks,
    usedTokens,
    wasteTokens: allocatedTokens - usedTokens,
  };
};

export const prefixSharingSavings = (
  sequenceCount: number,
  sharedPrefixTokens: number,
  blockSize: number,
): PrefixSharingSavings => {
  const safeSequenceCount = Math.max(0, Math.floor(sequenceCount));
  const safeBlockSize = Math.max(1, blockSize);
  const sharedBlocks = Math.floor(Math.max(0, sharedPrefixTokens) / safeBlockSize);
  const blocksSaved = Math.max(0, safeSequenceCount - 1) * sharedBlocks;

  return {
    blocksSaved,
    sharedBlocks,
    tokensSaved: blocksSaved * safeBlockSize,
  };
};

export const expectedAcceptedDraftTokens = (candidateTokens: number, acceptanceRate: number) => {
  const candidates = Math.max(0, Math.floor(candidateTokens));
  const acceptance = clamp(acceptanceRate, 0, 1);

  return Array.from({ length: candidates }, (_, index) => acceptance ** (index + 1)).reduce(
    (sum, value) => sum + value,
    0,
  );
};

export const expectedSpeculativeOutputTokens = (
  candidateTokens: number,
  acceptanceRate: number,
) => {
  const candidates = Math.max(1, Math.floor(candidateTokens));
  const acceptance = clamp(acceptanceRate, 0, 1);

  return Array.from({ length: candidates }, (_, index) => acceptance ** index).reduce(
    (sum, value) => sum + value,
    0,
  );
};

export const speculativeDecodingEstimate = ({
  acceptanceRate,
  candidateTokens,
  draftTokenMs,
  targetTokenMs,
  verifyPassMs,
}: SpeculativeInput): SpeculativeEstimate => {
  const candidates = Math.max(1, Math.floor(candidateTokens));
  const expectedOutputTokens = expectedSpeculativeOutputTokens(candidates, acceptanceRate);
  const cycleMs = candidates * draftTokenMs + verifyPassMs;
  const baselineMs = expectedOutputTokens * targetTokenMs;

  return {
    baselineMs,
    cycleMs,
    expectedAcceptedDraftTokens: expectedAcceptedDraftTokens(candidates, acceptanceRate),
    expectedOutputTokens,
    speedup: baselineMs / cycleMs,
  };
};
