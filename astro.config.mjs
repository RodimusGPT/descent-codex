import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const [, repositoryName = ""] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const isProjectPage = repositoryName !== "" && !repositoryName.endsWith(".github.io");
const githubPagesSite = process.env.GITHUB_REPOSITORY_OWNER
  ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
  : undefined;
const site = process.env.PUBLIC_SITE ?? githubPagesSite;
const base = process.env.PUBLIC_BASE ?? (isProjectPage ? `/${repositoryName}` : "/");

export default defineConfig({
  ...(site ? { site } : {}),
  base,
  output: "static",
  vite: {
    server: {
      allowedHosts: ["1fffad72-248c-4ef7-b11c-007acbd497e2-4322.consoleapp.sh"],
    },
  },
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
