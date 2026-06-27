export type Sandbox = {
  label: string;
  part: number;
  path: string;
  slug: "attention" | "float" | "quant" | "prefill";
  title: string;
};

export const SANDBOXES = [
  {
    label: "Attention fan",
    part: 1,
    path: "/dev/attention",
    slug: "attention",
    title: "Attention",
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
