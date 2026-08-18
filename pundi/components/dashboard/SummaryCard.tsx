"use client";

/**
 * components/dashboard/SummaryCard.tsx
 * Kartu ringkasan angka finansial utama dengan count-up animation,
 * hover elevation, hairline micro-glow, dan delta indicator ▲/▼.
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatRupiah, formatDelta } from "@/lib/utils/formatter";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title:       string;
  amount:      number;
  delta?:      number;
  deltaLabel?: string;
  icon?:       LucideIcon;
  variant?:    "neutral" | "positive" | "negative";
  className?:  string;
  loading?:    boolean;
}

function useCountUp(target: number, duration: number = 400) {
  const [value, setValue] = useState(0);
  const prefersReduced = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (prefersReduced.current) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let raf: number;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function SummaryCard({
  title,
  amount,
  delta,
  deltaLabel = "vs bulan lalu",
  icon: Icon,
  variant = "neutral",
  className,
  loading = false,
}: SummaryCardProps) {
  const displayAmount = useCountUp(amount);

  if (loading) {
    return (
      <div
        className={cn("card animate-pulse", className)}
        style={{ borderColor: "var(--color-rule)" }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="h-4 w-24 rounded-sm bg-rule opacity-50" />
          <div className="h-8 w-8 rounded-sm bg-rule opacity-30" />
        </div>
        <div className="h-8 w-40 rounded-sm bg-rule opacity-50 mb-2" />
        <div className="h-4 w-20 rounded-sm bg-rule opacity-30" />
      </div>
    );
  }

  const deltaPositive = delta !== undefined && delta >= 0;

  return (
    <div
      className={cn(
        "card group relative overflow-hidden transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-card hover:border-pine/40 cursor-default select-none",
        className
      )}
      style={{
        borderColor: "var(--color-rule)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Subtle top accent gradient */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          variant === "positive" ? "bg-pine" : variant === "negative" ? "bg-ember" : "bg-pine"
        )}
      />

      {/* Header: title + icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="text-small font-medium tracking-tight text-ink-muted group-hover:text-ink transition-colors"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {title}
        </span>

        {Icon && (
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor:
                variant === "positive"
                  ? "var(--color-pine-10)"
                  : variant === "negative"
                  ? "var(--color-ember-10)"
                  : "var(--color-paper)",
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.8}
              style={{
                color:
                  variant === "positive"
                    ? "var(--color-pine)"
                    : variant === "negative"
                    ? "var(--color-ember)"
                    : "var(--color-ink-muted)",
              }}
            />
          </div>
        )}
      </div>

      {/* Amount — IBM Plex Mono, display-xl */}
      <div className="mb-2.5">
        <span
          className="tabular-nums font-mono leading-tight font-semibold tracking-tight"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-data-l)",
            color:
              variant === "positive"
                ? "var(--color-pine)"
                : variant === "negative"
                ? "var(--color-ember)"
                : "var(--color-ink)",
            display: "block",
            textAlign: "right",
          }}
        >
          {formatRupiah(displayAmount)}
        </span>
      </div>

      {/* Delta indicator pill */}
      {delta !== undefined && (
        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-rule/40">
          <span
            className="text-xs font-mono font-semibold flex items-center gap-0.5"
            style={{
              color: deltaPositive ? "var(--color-pine)" : "var(--color-ember)",
            }}
          >
            {formatDelta(delta)}
          </span>
          <span
            className="text-xs text-ink-muted"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {deltaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
