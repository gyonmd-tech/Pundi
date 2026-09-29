import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F7FC",
        surface: "#F9FBFF",
        brand: { 50: "#F3F7FF", 100: "#E7EFFF", 200: "#CADCFF", 300: "#8FBCFF", 400: "#5C8FF2", 500: "#2860E6", 600: "#2459DE", 700: "#1D48B5", 800: "#17368F", 900: "#142B87", 950: "#112772" },
        ink: { DEFAULT: "#17213D", muted: "#5F6982", soft: "#7B849B" },
        pine: {
          DEFAULT: "#2459DE",
          hover: "#1D48B5",
          10: "#E7EFFF",
          20: "#CADCFF",
          40: "#5C8FF2",
        },
        ember: { DEFAULT: "#E95766", ink: "#B83547", 10: "#FFE9EC", 20: "#F9BCC5" },
        brass: { DEFAULT: "#D99418", 10: "#FFF6DC" },
        warning: { DEFAULT: "#C98010", ink: "#855A00", 10: "#FFF5DD" },
        mint: { DEFAULT: "#159B78", ink: "#0B6B54", 10: "#E5F7F1" },
        sky: { DEFAULT: "#2860E6", 10: "#E7EFFF" },
        lavender: { DEFAULT: "#7B61D1", ink: "#5E46B8", 10: "#F0EAFE" },
        cyan: { DEFAULT: "#168AA0", ink: "#0F6B7B", 10: "#E4F7FA" },
        rule: { DEFAULT: "#DCE4F2", strong: "#C7D3E7" },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "Segoe UI", "system-ui", "sans-serif"],
        ui: ["var(--font-jakarta)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-jakarta)", "Segoe UI", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.15rem,4vw,3.25rem)", { lineHeight: "1.08" }],
        "display-l": ["clamp(1.65rem,2.5vw,2.1rem)", { lineHeight: "1.15" }],
        heading: ["1.125rem", { lineHeight: "1.35" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        small: ["0.8125rem", { lineHeight: "1.45" }],
        "data-l": ["clamp(1.45rem,2.5vw,2rem)", { lineHeight: "1.15" }],
        "data-m": ["0.9375rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "18": "4.5rem",
        sidebar: "16.5rem",
        "sidebar-sm": "5rem",
      },
      borderRadius: {
        card: "1.375rem",
        sm: "0.875rem",
        DEFAULT: "0.875rem",
      },
      boxShadow: {
        card: "0 2px 4px rgba(20,43,135,.04),0 10px 24px rgba(20,43,135,.07)",
        float: "0 12px 24px rgba(17,39,114,.10),0 28px 70px rgba(17,39,114,.16)",
        focus: "0 0 0 4px rgba(40,96,230,.16)",
      },
      maxWidth: { container: "90rem" },
      keyframes: {
        "count-up": { from: { opacity: "0", transform: "translateY(5px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "progress-fill": { from: { width: "0%" }, to: { width: "var(--progress-value,0%)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "count-up": "count-up .4s cubic-bezier(.2,.8,.2,1) both",
        "progress-fill": "progress-fill .6s cubic-bezier(.2,.8,.2,1) both",
        "fade-in": "fade-in .2s ease-out both",
        "slide-up": "slide-up .35s cubic-bezier(.2,.8,.2,1) both",
      },
      screens: { xs: "375px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    },
  },
  plugins: [],
};

export default config;
