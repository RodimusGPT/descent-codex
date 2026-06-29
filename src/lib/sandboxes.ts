export type Sandbox = {
  label: string;
  part: number;
  path: string;
  slug:
    | "prompt-token"
    | "tokenizer"
    | "embedding"
    | "stack"
    | "attention"
    | "qkv"
    | "moe"
    | "sampling"
    | "weight-zoom"
    | "float"
    | "quant"
    | "memory-budget"
    | "prefill"
    | "batching"
    | "paged-attention"
    | "speculative"
    | "gpu-floorplan"
    | "gemm-tiling"
    | "flash-attention"
    | "roofline"
    | "parallelism"
    | "full-stack"
    | "config"
    | "local-stack";
  title: string;
};

export const SANDBOXES = [
  {
    label: "Prompt to token",
    part: 0,
    path: "/dev/prompt-token",
    slug: "prompt-token",
    title: "Prompt to token",
  },
  {
    label: "Tokenizer",
    part: 1,
    path: "/dev/tokenizer",
    slug: "tokenizer",
    title: "Tokenizer",
  },
  {
    label: "Embedding space",
    part: 1,
    path: "/dev/embedding",
    slug: "embedding",
    title: "Embedding",
  },
  {
    label: "Transformer stack",
    part: 1,
    path: "/dev/stack",
    slug: "stack",
    title: "Stack",
  },
  {
    label: "Attention fan",
    part: 1,
    path: "/dev/attention",
    slug: "attention",
    title: "Attention",
  },
  {
    label: "Q/K/V heads",
    part: 1,
    path: "/dev/qkv",
    slug: "qkv",
    title: "QKV",
  },
  {
    label: "MoE router",
    part: 1,
    path: "/dev/moe",
    slug: "moe",
    title: "MoE",
  },
  {
    label: "Sampling playground",
    part: 1,
    path: "/dev/sampling",
    slug: "sampling",
    title: "Sampling",
  },
  {
    label: "Weight zoom",
    part: 2,
    path: "/dev/weight-zoom",
    slug: "weight-zoom",
    title: "Weight zoom",
  },
  {
    label: "Float exploder",
    part: 2,
    path: "/dev/float",
    slug: "float",
    title: "Float",
  },
  {
    label: "Quantization slider",
    part: 2,
    path: "/dev/quant",
    slug: "quant",
    title: "Quantization",
  },
  {
    label: "Memory budget",
    part: 2,
    path: "/dev/memory-budget",
    slug: "memory-budget",
    title: "Memory budget",
  },
  {
    label: "Prefill / decode",
    part: 3,
    path: "/dev/prefill",
    slug: "prefill",
    title: "Prefill",
  },
  {
    label: "Batching timeline",
    part: 3,
    path: "/dev/batching",
    slug: "batching",
    title: "Batching",
  },
  {
    label: "PagedAttention",
    part: 3,
    path: "/dev/paged-attention",
    slug: "paged-attention",
    title: "PagedAttention",
  },
  {
    label: "Speculative decoding",
    part: 3,
    path: "/dev/speculative",
    slug: "speculative",
    title: "Speculative decoding",
  },
  {
    label: "GPU floorplan",
    part: 4,
    path: "/dev/gpu-floorplan",
    slug: "gpu-floorplan",
    title: "GPU floorplan",
  },
  {
    label: "GEMM tiling",
    part: 4,
    path: "/dev/gemm-tiling",
    slug: "gemm-tiling",
    title: "GEMM tiling",
  },
  {
    label: "FlashAttention",
    part: 4,
    path: "/dev/flash-attention",
    slug: "flash-attention",
    title: "FlashAttention",
  },
  {
    label: "Roofline",
    part: 4,
    path: "/dev/roofline",
    slug: "roofline",
    title: "Roofline",
  },
  {
    label: "Parallelism",
    part: 4,
    path: "/dev/parallelism",
    slug: "parallelism",
    title: "Parallelism",
  },
  {
    label: "Full-stack replay",
    part: 5,
    path: "/dev/full-stack",
    slug: "full-stack",
    title: "Full-stack replay",
  },
  {
    label: "Config sandbox",
    part: 5,
    path: "/dev/config",
    slug: "config",
    title: "Config sandbox",
  },
  {
    label: "Local stack selector",
    part: 5,
    path: "/dev/local-stack",
    slug: "local-stack",
    title: "Local stack selector",
  },
] as const satisfies readonly Sandbox[];
