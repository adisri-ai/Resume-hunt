/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00F5FF",
        secondary: "#7C3AED",
        darkbg: "#0F172A",
        cardbg: "#1E293B"
      },
      boxShadow: {
        glow: "0 0 15px rgba(0, 245, 255, 0.6)",
        purpleGlow: "0 0 20px rgba(124, 58, 237, 0.5)"
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-in-out",
        float: "float 4s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    },
  },
  plugins: [],
}