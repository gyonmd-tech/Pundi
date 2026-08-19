import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Color Palette (DESIGN.md § 4.2) ───────────────────
      // PENTING: Jangan tambah warna baru di sini tanpa referensi DESIGN.md
      colors: {
        paper:   "#EEF1EF",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#16201D",
          muted:   "#5B655F",
        },
        pine: {
          DEFAULT: "#1B4B3F",
          10:      "#E8F0EE",
          20:      "#C8DDD8",
          40:      "#7AADA4",
        },
        ember: {
          DEFAULT: "#9C4A2E",
          10:      "#F5EAE6",
          20:      "#E5BDB0",
        },
        brass: {
          DEFAULT: "#B08A3E",
          10:      "#F6F0E4",
        },
        warning: {
          DEFAULT: "#B8862E",
          10:      "#F6EFE1",
        },
        rule:    "#C8CDC7",
      },

      // ── Typography (DESIGN.md § 4.3) ──────────────────────
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        ui:      ["General Sans", "system-ui", "sans-serif"],
        mono:    ["IBM Plex Mono", "Courier New", "monospace"],
      },
      fontSize: {
        "display-xl": ["2.5rem",    { lineHeight: "2.75rem" }],
        "display-l":  ["1.75rem",   { lineHeight: "2.125rem" }],
        "heading":    ["1.25rem",   { lineHeight: "1.625rem" }],
        "body":       ["1rem",      { lineHeight: "1.5rem" }],
        "small":      ["0.875rem",  { lineHeight: "1.25rem" }],
        "data-l":     ["1.5rem",    { lineHeight: "1.75rem" }],
        "data-m":     ["1rem",      { lineHeight: "1.375rem" }],
      },

      // ── Spacing (DESIGN.md § 4.4, base 8px) ──────────────
      spacing: {
        "18": "4.5rem",   /* 72px */
        "sidebar": "15rem",     /* 240px */
        "sidebar-sm": "4rem",   /* 64px collapsed */
      },

      // ── Border Radius (DESIGN.md § 4.5) ──────────────────
      borderRadius: {
        card:  "6px",
        sm:    "4px",
        DEFAULT: "6px",
      },

      // ── Box Shadow (DESIGN.md § 4.5) ──────────────────────
      // Kartu pakai hairline border, BUKAN shadow
      boxShadow: {
        card:  "none",
        float: "0 4px 12px rgba(22, 32, 29, 0.08)",
        focus: "0 0 0 2px #1B4B3F",
      },

      // ── Max Width ─────────────────────────────────────────
      maxWidth: {
        container: "80rem", /* 1280px */
      },

      // ── Keyframes for motion (DESIGN.md § 4.8) ────────────
      keyframes: {
        "count-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to:   { width: "var(--progress-value, 0%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "count-up":     "count-up 0.4s ease-out both",
        "progress-fill":"progress-fill 0.5s ease-out both",
        "fade-in":      "fade-in 0.2s ease-out both",
        "slide-up":     "slide-up 0.3s ease-out both",
      },

      // ── Breakpoints (DESIGN.md § 6 & Responsive Optimization) ──
      screens: {
        xs:   "375px",
        sm:   "640px",
        md:   "768px",
        lg:   "1024px",
        xl:   "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
