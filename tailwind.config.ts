import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Lisa palette (single source of truth) ────────────────────────────
        // ink    → near-black, used for text and dark detail work
        // bone   → the base surface. Kept white so the accent does the talking.
        // accent → the one bright brand colour (buttons, links, highlights)
        ink: "#111111",
        bone: "#ffffff",
        accent: {
          DEFAULT: "#FF2D87",
          dark: "#DB1A69",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
