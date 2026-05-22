/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Brand ────────────────────────── */
        brand: {
          white: "#F5F5F3",
          black: "#111111",
          graphite: "#2B2B2B",
          gray: "#EAEAEA",
          lime: "#C6FF00",
          yellow: "#F5E14B",
        },
        /* ── Status ───────────────────────── */
        status: {
          success: "#22C55E",
          warning: "#EAB308",
          error: "#EF4444",
          info: "#3B82F6",
        },
        /* ── Surface (dark theme) ─────────── */
        surface: {
          0: "#0A0A0A",
          1: "#111111",
          2: "#1A1A1A",
          3: "#222222",
          4: "#2B2B2B",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "heading": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "title": ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.6" }],
        "body": ["0.9375rem", { lineHeight: "1.6" }],
        "caption": ["0.8125rem", { lineHeight: "1.5" }],
        "micro": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.06)",
        "glow-lime": "0 0 20px rgba(198,255,0,0.3)",
        "glow-error": "0 0 20px rgba(239,68,68,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "robot-move": "robotMove 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        robotMove: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
