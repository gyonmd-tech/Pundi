"use client";

/**
 * components/ui/BackgroundPattern.tsx
 * Elemen background material & partikel halus:
 * - Micro-dot grid texture (subtle ledger grid 24px)
 * - Soft ambient gradient glows (pine & brass highlights)
 * - Lightweight floating ambient particles
 */

import React from "react";

export function BackgroundPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Micro-dot Grid Texture (Material Buku Kas / Ledger Texture) */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(27, 75, 63, 0.12) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 2. Top-Right Ambient Pine Glow */}
      <div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-3xl opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, var(--color-pine) 0%, transparent 70%)",
        }}
      />

      {/* 3. Bottom-Left Ambient Brass Glow */}
      <div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, var(--color-brass) 0%, transparent 70%)",
        }}
      />

      {/* 4. Center Subtle Radial Mesh */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] rounded-full blur-[100px] opacity-[0.04]"
        style={{
          background: "radial-gradient(ellipse, var(--color-pine) 0%, transparent 75%)",
        }}
      />

      {/* 5. Subtle Floating Accent Particles (Lightweight SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="15%" cy="20%" r="2" fill="var(--color-pine)" className="animate-pulse" style={{ animationDuration: "6s" }} />
        <circle cx="85%" cy="35%" r="1.5" fill="var(--color-brass)" className="animate-pulse" style={{ animationDuration: "8s" }} />
        <circle cx="45%" cy="75%" r="2" fill="var(--color-pine)" className="animate-pulse" style={{ animationDuration: "7s" }} />
        <circle cx="70%" cy="85%" r="1.5" fill="var(--color-ember)" className="animate-pulse" style={{ animationDuration: "9s" }} />
        <circle cx="28%" cy="55%" r="1" fill="var(--color-brass)" className="animate-pulse" style={{ animationDuration: "5s" }} />
      </svg>
    </div>
  );
}
