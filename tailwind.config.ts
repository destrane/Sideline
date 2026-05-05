import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "#0A0A0A",
        "text-primary": "#EBEBEB",
        "text-secondary": "#888888",
        "text-muted": "#555555",
        "text-faint": "#333333",
        "border-subtle": "#1C1C1C",
        "border-dim": "#2A2A2A",
        up: "#5CAF72",
        down: "#CF5050",
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "flash": {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 2.4s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease forwards",
        "flash": "flash 0.25s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
