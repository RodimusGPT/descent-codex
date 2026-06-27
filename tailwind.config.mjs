/** @type {import("tailwindcss").Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--color-active)",
        background: "var(--color-bg)",
        border: "var(--color-border)",
        muted: "var(--color-text-muted)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
      },
      fontFamily: {
        mono: "var(--font-mono)",
        sans: "var(--font-sans)",
      },
    },
  },
  plugins: [],
};
