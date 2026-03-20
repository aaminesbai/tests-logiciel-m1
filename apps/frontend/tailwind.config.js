/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        ocean: "#0b4f6c",
        sky: "#a7d8f0",
        coral: "#ff7f50",
        cream: "#fffaf0",
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.14)",
      },
    },
  },
  plugins: [],
};
