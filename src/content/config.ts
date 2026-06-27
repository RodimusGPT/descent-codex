import { defineCollection, z } from "astro:content";

const parts = defineCollection({
  type: "content",
  schema: z.object({
    accent: z.enum(["hook", "model", "numbers", "software", "hardware", "synthesis"]),
    part: z.number().int().min(0).max(5),
    question: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  parts,
};
