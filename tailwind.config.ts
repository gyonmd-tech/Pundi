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
        // Semua warna merujuk custom property di styles/tokens.css (bukan
        // hex statis) supaya utility class Tailwind (bg-paper, text-ink,
        // dst.) ikut berubah saat tema gelap/warna aksen di-override lewat
        // CSS variable oleh components/providers/ThemeEffect.tsx — nilai
        // default di :root sama persis dengan hex lama, jadi tidak ada
        // perubahan visual di mode terang.
        paper: "var(--color-paper)",
        surface: {
          DEFAULT: "var(--color-surface)",
          soft: "var(--color-surface-soft)",
          high: "var(--color-surface-high)",
        },
        brand: {
          50: "var(--color-brand-50)", 100: "var(--color-brand-100)", 200: "var(--color-brand-200)",
          300: "var(--color-brand-300)", 400: "var(--color-brand-400)", 500: "var(--color-brand-500)",
          600: "var(--color-brand-600)", 700: "var(--color-brand-700)", 800: "var(--color-brand-800)",
          900: "var(--color-brand-900)", 950: "var(--color-brand-950)",
        },
        ink: { DEFAULT: "var(--color-ink)", muted: "var(--color-ink-muted)", soft: "var(--color-ink-soft)" },
        pine: {
          DEFAULT: "var(--color-pine)",
          hover: "var(--color-pine-hover)",
          10: "var(--color-pine-10)",
          20: "var(--color-pine-20)",
          40: "var(--color-pine-40)",
        },
        ember: { DEFAULT: "var(--color-ember)", ink: "var(--color-ember-ink)", 10: "var(--color-ember-10)", 20: "var(--color-ember-20)" },
        brass: { DEFAULT: "var(--color-brass)", 10: "var(--color-brass-10)" },
        warning: { DEFAULT: "var(--color-warning)", ink: "var(--color-warning-ink)", 10: "var(--color-warning-10)" },
        mint: { DEFAULT: "var(--color-mint)", ink: "var(--color-mint-ink)", 10: "var(--color-mint-10)" },
        sky: { DEFAULT: "var(--color-sky)", 10: "var(--color-sky-10)" },
        lavender: { DEFAULT: "var(--color-lavender)", ink: "var(--color-lavender-ink)", 10: "var(--color-lavender-10)" },
        cyan: { DEFAULT: "var(--color-cyan)", ink: "var(--color-cyan-ink)", 10: "var(--color-cyan-10)" },
        rule: { DEFAULT: "var(--color-rule)", strong: "var(--color-rule-strong)" },
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
