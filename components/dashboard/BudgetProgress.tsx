"use client";

/**
 * components/dashboard/BudgetProgress.tsx
 * Progress bar per kategori anggaran dengan status badge, visual icon, dan hover highlight.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatRupiah, calcProgress, getBudgetStatus, type BudgetStatus } from "@/lib/utils/formatter";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface BudgetProgressProps {
  categoryName:  string;
  categoryIcon?: string;
  categoryColor?: string;
  spent:         number;
  limit:         number;
  period?:       string;
  className?:    string;
  loading?:      boolean;
  onEdit?:       () => void;
}

const statusConfig: Record<BudgetStatus, {
  barColor:    string;
  bgColor:     string;
  textColor:   string;
  label:       string;
  Icon:        typeof CheckCircle2;
}> = {
  safe: {
    barColor:  "var(--color-pine)",
    bgColor:   "var(--color-pine-10)",
    textColor: "var(--color-pine)",
    label:     "Aman",
    Icon:      CheckCircle2,
  },
  warning: {
    barColor:  "var(--color-warning)",
    bgColor:   "var(--color-warning-10)",
    textColor: "var(--color-warning)",
    label:     "Mendekati limit",
    Icon:      AlertTriangle,
  },
  over: {
    barColor:  "var(--color-ember)",
    bgColor:   "var(--color-ember-10)",
    textColor: "var(--color-ember)",
    label:     "Lewat limit",
    Icon:      AlertCircle,
  },
};

export function BudgetProgress({
  categoryName,
  categoryIcon,
  categoryColor = "#1B4B3F",
  spent,
  limit,
  period,
  className,
  loading = false,
  onEdit,
}: BudgetProgressProps) {
  if (loading) {
    return (
      <div className={cn("py-3.5 border-b", className)} style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex justify-between mb-2">
          <div className="h-4 w-28 bg-rule opacity-40 rounded-sm animate-pulse" />
          <div className="h-4 w-20 bg-rule opacity-40 rounded-sm animate-pulse" />
        </div>
        <div className="h-2 w-full bg-rule opacity-30 rounded-full animate-pulse" />
      </div>
    );
  }

  const progress = calcProgress(spent, limit);
  const status   = getBudgetStatus(spent, limit);
  const cfg      = statusConfig[status];
  const StatusIcon = cfg.Icon;
  const remaining  = Math.max(limit - spent, 0);

  return (
    <div
      className={cn(
        "py-3.5 px-3 rounded-card border-b last:border-b-0 transition-all duration-200",
        "hover:bg-paper/80 group",
        className
      )}
      style={{ borderColor: "var(--color-rule)" }}
    >
      {/* Header: icon + kategori + status badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <CategoryIcon icon={categoryIcon} color={categoryColor} size={14} containerSize="sm" />
          <div className="min-w-0">
            <span
              className="text-body font-semibold text-ink truncate block group-hover:text-pine transition-colors"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {categoryName}
            </span>
            {period && (
              <span className="text-[11px] text-ink-muted hidden sm:inline font-mono">
                {period}
              </span>
            )}
          </div>
        </div>

        {/* Status badge pill */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 shadow-xs"
          style={{
            backgroundColor: cfg.bgColor,
            color: cfg.textColor,
          }}
        >
          <StatusIcon size={12} strokeWidth={2.2} />
          <span
            className="text-[11px] font-semibold"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {cfg.label} ({progress}%)
          </span>
        </div>
      </div>

      {/* Progress Bar with smooth fill */}
      <div
        className="h-2 rounded-full mb-2 overflow-hidden shadow-inner"
        style={{ backgroundColor: "var(--color-rule)" }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${categoryName}: ${progress}% terpakai`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: cfg.barColor,
          }}
        />
      </div>

      {/* Numerical Details */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className="tabular-nums font-mono text-ink-muted"
        >
          Terpakai: <strong className="text-ink font-semibold">{formatRupiah(spent)}</strong>
        </span>

        <div className="flex items-center gap-1.5 font-mono">
          <span
            className="tabular-nums font-semibold"
            style={{
              color: status === "over" ? "var(--color-ember)" : "var(--color-pine)",
            }}
          >
            {status === "over"
              ? `+${formatRupiah(spent - limit)} (over)`
              : `sisa ${formatRupiah(remaining)}`}
          </span>
          <span className="text-rule">/</span>
          <span className="tabular-nums text-ink-muted">
            {formatRupiah(limit)}
          </span>
        </div>
      </div>
    </div>
  );
}
