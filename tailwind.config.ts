import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "#151a30",
        "accent-cyan": "#00f0ff",
        "accent-pink": "#ff006e",
        "accent-purple": "#9d4edd",
        "xp-start": "#ffbe0b",
        "xp-end": "#fb5607",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 30px rgba(0, 240, 255, 0.5)" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.3)",
        "neon-pink": "0 0 20px rgba(255, 0, 110, 0.3)",
        "neon-purple": "0 0 20px rgba(157, 78, 221, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
