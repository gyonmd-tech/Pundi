"use client";

/**
 * components/dashboard/SummaryCard.tsx
 * Kartu ringkasan angka finansial utama dengan count-up animation,
 * hover elevation, hairline micro-glow, dan delta indicator ▲/▼.
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatAmount, formatDelta } from "@/lib/utils/formatter";
import type { LucideIcon } from "lucide-react";
import { SummarySparkline } from "./SummarySparkline";

interface SummaryCardProps {
  title:       string;
  amount:      number;
  delta?:      number;
  deltaLabel?: string;
  icon?:       LucideIcon;
  variant?:    "neutral" | "positive" | "negative";
  className?:  string;
  loading?:    boolean;
  trend?:      number[];
  caption?:    string;
  /** Pakai format Rupiah ringkas (mis. "Rp 8,6 jt") — preferences.compactNumbers. */
  compact?:    boolean;
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
  trend,
  caption,
  compact = false,
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
  const tone = {
    neutral: {
      surface: "border-brand-600/10 bg-surface-high",
      icon: "bg-brand-600 text-white",
      chart: "text-brand-600",
      delta: "text-brand-800",
    },
    positive: {
      surface: "border-brand-600/10 bg-surface-high",
      icon: "bg-mint-ink text-white",
      chart: "text-mint",
      delta: "text-mint-ink",
    },
    negative: {
      surface: "border-brand-600/10 bg-surface-high",
      icon: "bg-ember-ink text-white",
      chart: "text-ember",
      delta: "text-ember-ink",
    },
  }[variant];

  return (
    <div
      data-tone={variant}
      className={cn(
        "card group relative flex h-full flex-col overflow-hidden border transition-[border-color,box-shadow] duration-200",
        "cursor-default select-none",
        tone.surface,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-small font-semibold tracking-[-0.01em] text-ink-muted">{title}</span>
          {delta !== undefined && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn("text-xs font-semibold tabular-nums", deltaPositive ? tone.delta : "text-ember-ink")}>{formatDelta(delta)}</span>
              <span className="sr-only">{deltaLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[14px] shadow-card", tone.icon)}>
            <Icon size={18} strokeWidth={1.9} />
          </div>
        )}
      </div>

      {trend?.length ? <SummarySparkline values={trend} className={cn("mt-4 h-14 sm:mt-5 sm:h-20", tone.chart)} /> : <div className="min-h-5 flex-1" />}

      <div className="mt-auto pt-3">
        <span
          className="block whitespace-nowrap font-ui text-[clamp(1.05rem,5vw,1.25rem)] font-semibold leading-tight tracking-[-0.045em] text-ink tabular-nums sm:text-data-l"
        >
          {formatAmount(displayAmount, compact)}
        </span>
        {caption ? <p className="mt-1 text-xs text-ink-muted">{caption}</p> : null}
      </div>

    </div>
  );
}
