"use client";

/**
 * components/dashboard/BudgetProgress.tsx
 * Progress bar per kategori anggaran dengan status badge, visual icon, dan hover highlight.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatRupiah, calcProgress, getBudgetStatus, type BudgetStatus } from "@/lib/utils/formatter";
import { CheckCircle2, AlertTriangle, AlertCircle, Edit2, Trash2 } from "lucide-react";
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
  onDelete?:     () => void;
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
  onDelete,
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
        "py-3.5 px-3.5 rounded-card border-b last:border-b-0 transition-all duration-200",
        "hover:bg-paper/80 group",
        className
      )}
      style={{ borderColor: "var(--color-rule)" }}
    >
      {/* Header: icon + kategori + status badge + action buttons (Inline & Non-overlapping) */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CategoryIcon icon={categoryIcon} color={categoryColor} size={15} containerSize="sm" />
          <div className="min-w-0 flex-1">
            <span
              className="text-body font-semibold text-ink truncate block group-hover:text-pine transition-colors leading-snug"
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

        {/* Right side: Badge + Action Buttons side-by-side */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-2xs"
            style={{
              backgroundColor: cfg.bgColor,
              color: cfg.textColor,
            }}
          >
            <StatusIcon size={12} strokeWidth={2.2} />
            <span style={{ fontFamily: "var(--font-ui)" }}>
              {cfg.label} ({progress}%)
            </span>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-0.5 ml-1 border-l border-rule/50 pl-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1 rounded text-ink-muted hover:text-pine hover:bg-pine-10 transition-colors"
                  title="Edit batas anggaran"
                  aria-label="Edit batas anggaran"
                >
                  <Edit2 size={13} strokeWidth={2} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 rounded text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                  title="Hapus anggaran"
                  aria-label="Hapus anggaran"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar with smooth fill */}
      <div
        className="h-2 rounded-full mb-2 overflow-hidden shadow-inner bg-rule/50"
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

      {/* Numerical Details Row (Crisp, non-broken layout) */}
      <div className="flex items-center justify-between gap-2 text-xs font-mono">
        <span className="text-ink-muted truncate">
          Terpakai: <strong className="text-ink font-semibold">{formatRupiah(spent)}</strong>
        </span>

        <span className="text-ink-muted truncate text-right">
          Batas: <strong className="text-ink font-semibold">{formatRupiah(limit)}</strong>
        </span>
      </div>

      {/* Status Sisa / Over sub-label */}
      <div className="mt-1 flex items-center justify-end text-[11px] font-mono">
        {status === "over" ? (
          <span className="text-ember font-semibold bg-ember-10 px-1.5 py-0.5 rounded">
            Melebihi batas +{formatRupiah(spent - limit)}
          </span>
        ) : (
          <span className="text-pine font-medium bg-pine-10 px-1.5 py-0.5 rounded">
            Sisa alokasi: {formatRupiah(remaining)}
          </span>
        )}
      </div>
    </div>
  );
}
