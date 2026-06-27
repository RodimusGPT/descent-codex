export type Part = {
  accent: "hook" | "model" | "numbers" | "software" | "hardware" | "synthesis";
  index: number;
  question: string;
  slug: string;
  title: string;
};

export const PARTS = [
  {
    accent: "hook",
    index: 0,
    question: "What just happened when I hit enter?",
    slug: "0-hook",
    title: "Hook",
  },
  {
    accent: "model",
    index: 1,
    question: "What is the model?",
    slug: "1-transformer",
    title: "The transformer",
  },
  {
    accent: "numbers",
    index: 2,
    question: "How are weights represented?",
    slug: "2-weights",
    title: "Weights as numbers",
  },
  {
    accent: "software",
    index: 3,
    question: "How is it served?",
    slug: "3-software",
    title: "Inference: software",
  },
  {
    accent: "hardware",
    index: 4,
    question: "How does the silicon run it?",
    slug: "4-hardware",
    title: "Inference: hardware",
  },
  {
    accent: "synthesis",
    index: 5,
    question: "Now show me the whole thing.",
    slug: "5-synthesis",
    title: "Put it together",
  },
] as const satisfies readonly Part[];
