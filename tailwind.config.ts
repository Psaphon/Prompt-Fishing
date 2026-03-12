import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Ocean theme colors
        ocean: {
          950: "#020f1a",
          900: "#041424",
          800: "#071e33",
          700: "#0a2a47",
          600: "#0e3a61",
          500: "#1a5276",
        },
      },
      fontFamily: {
        pixel: ["var(--font-press-start)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
