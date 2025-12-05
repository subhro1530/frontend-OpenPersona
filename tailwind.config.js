const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#05040c",
        nebula: "#1b1d3a",
        aurora: "#5c4dff",
        pulse: "#ff7ee2",
        cyber: "#00f7ff",
        smoke: "#9da7ff",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 45px rgba(92, 77, 255, 0.35)",
        neon: "0 0 25px rgba(0, 247, 255, 0.45)",
      },
    },
  },
  plugins: [],
};
