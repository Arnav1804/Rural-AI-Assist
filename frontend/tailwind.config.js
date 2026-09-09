/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F4F1EA",
          card: "#FCFBF8",
          stone: "#E2DDD3",
          silt: "#5E6861",
        },
        loam: {
          DEFAULT: "#1C2620",
          light: "#2C3831",
        },
        moss: {
          DEFAULT: "#255940",
          light: "#317454",
          soft: "#E8F0EB",
        },
        river: {
          DEFAULT: "#26526E",
          light: "#356E93",
          soft: "#E8F1F5",
        },
        wheat: {
          DEFAULT: "#945F16",
          light: "#B87820",
          soft: "#FAF3E3",
        },
        brick: {
          DEFAULT: "#8A3535",
          soft: "#F8ECEC",
        },
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
