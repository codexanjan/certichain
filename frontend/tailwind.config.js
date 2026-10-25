/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0284C7",
          600: "#0369A1",
          700: "#075985",
          800: "#0C4A6E",
          900: "#082F49",
          950: "#040711",
        },
        navy: {
          700: "#1E293B",
          800: "#0F172A",
          900: "#0B1120",
          950: "#060913",
          1000: "#040711",
        },
        cyber: {
          cyan: "#00F2FE",
          blue: "#4FACFE",
          purple: "#7F00FF",
          indigo: "#6366F1",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        card: "0 4px 24px -2px rgba(0, 0, 0, 0.35)",
        glow: "0 0 30px -5px rgba(2, 132, 199, 0.4)",
        "glow-cyan": "0 0 35px -5px rgba(6, 182, 212, 0.45)",
        "glow-indigo": "0 0 35px -5px rgba(99, 102, 241, 0.45)",
        "glow-emerald": "0 0 35px -5px rgba(16, 185, 129, 0.45)",
      },
    },
  },
  plugins: [],
}

