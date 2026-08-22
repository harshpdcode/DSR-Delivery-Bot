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
        /* ── Brand Colors ────────────────────────── */
        brand: {
          white: "rgb(var(--brand-white-rgb, 255 255 255) / <alpha-value>)",
          black: "var(--brand-black, #0B0B0A)",
          graphite: "var(--brand-graphite, #181918)",
          gray: "rgb(var(--brand-gray-rgb, 95 95 94) / <alpha-value>)",
          lime: "var(--brand-lime, #39B54A)",
          /* Ather Delivery Robot App Palette */
          green: "#39B54A",
          "green-soft": "#B2CFB7",
          "green-light": "#E8F3EA",
          "primary-black": "#0B0B0A",
          "dark-surface": "#181918",
          "app-bg": "#F3F4F2",
          "text-grey": "#5F5F5E",
          "border-grey": "#D9DAD8",
          error: "#E04B4B",
          warning: "#E49A45",
          yellow: "#FFE234",
          mint: "#9CFF7A",
          teal: "#A8EFE1",
          darkcard: "#181918",
        },
        /* ── Surface Colors ──────────────────────── */
        surface: {
          0: "var(--surface-0, #0B0B0A)",
          1: "var(--surface-1, #181918)",
          2: "var(--surface-2, #212321)",
          3: "var(--surface-3, #2A2D2A)",
          4: "var(--surface-4, #363936)",
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
        "drive-wobble": "driveWobble 0.8s ease-in-out infinite",
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
        driveWobble: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-2px) rotate(-3deg)" },
          "50%": { transform: "translateY(0) rotate(0deg)" },
          "75%": { transform: "translateY(-2px) rotate(3deg)" },
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
