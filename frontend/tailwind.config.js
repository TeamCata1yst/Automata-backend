/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: "Yellix, sans-serif",
      },
      colors: {
        "auto-red": "#5B8588",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
