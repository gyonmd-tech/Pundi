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
        paper: "#F5F4FB",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#211F32", muted: "#716E82", soft: "#9894A8" },
        pine: {
          DEFAULT: "#5B4AEF",
          hover: "#4B3BD1",
          10: "#EFECFF",
          20: "#DCD6FF",
          40: "#978CF7",
        },
        ember: { DEFAULT: "#E95766", 10: "#FFF0F1", 20: "#F9BCC2" },
        brass: { DEFAULT: "#D99418", 10: "#FFF6DC" },
        warning: { DEFAULT: "#C98010", 10: "#FFF5DD" },
        mint: { DEFAULT: "#159B78", 10: "#E5F8F1" },
        sky: { DEFAULT: "#3E86ED", 10: "#EAF3FF" },
        rule: { DEFAULT: "#E4E0F0", strong: "#D4CEE5" },
      },
      fontFamily: {
        display: ["Manrope", "Segoe UI", "system-ui", "sans-serif"],
        ui: ["Manrope", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["Manrope", "Segoe UI", "system-ui", "sans-serif"],
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
        card: "0 10px 28px rgba(73,61,133,.08)",
        float: "0 22px 60px rgba(43,35,80,.20)",
        focus: "0 0 0 4px rgba(91,74,239,.18)",
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
