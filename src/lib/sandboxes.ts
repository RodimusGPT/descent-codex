export type Sandbox = {
  label: string;
  part: number;
  path: string;
  slug:
    | "tokenizer"
    | "embedding"
    | "stack"
    | "attention"
    | "qkv"
    | "moe"
    | "sampling"
    | "float"
    | "quant"
    | "prefill";
  title: string;
};

export const SANDBOXES = [
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
    label: "Prefill / decode",
    part: 3,
    path: "/dev/prefill",
    slug: "prefill",
    title: "Prefill",
  },
] as const satisfies readonly Sandbox[];
