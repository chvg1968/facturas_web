import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          "blue-50": "#EAF4FB",
          "blue-100": "#D6E6F2",
          "blue-200": "#BFD8E8",
          "blue-300": "#A7C7E7",
          "blue-500": "#6FA3C7",
          "blue-700": "#3E6E8E",
          "green-50": "#EEF8F1",
          "green-100": "#D6F0DC",
          "green-200": "#B5E8C6",
          "green-500": "#6FBF8A",
          "green-700": "#3E8E5F",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(63, 110, 142, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
