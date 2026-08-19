"use client";

/**
 * components/dashboard/GoalCard.tsx
 * Kartu progress tujuan tabungan dengan estimasi tanggal tercapai,
 * hover elevation, dan status tercapai (vintage brass styling).
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import {
  formatRupiah,
  formatDate,
  calcProgress,
  estimateGoalDate,
} from "@/lib/utils/formatter";
import { Target, CalendarDays, TrendingUp, CheckCircle2, Edit2, Trash2 } from "lucide-react";

interface GoalCardProps {
  name:            string;
  targetAmount:    number;
  currentAmount:   number;
  targetDate:      Date;
  monthlySavings?: number;
  className?:      string;
  loading?:        boolean;
  onEdit?:         () => void;
  onDelete?:       () => void;
}

export function GoalCard({
  name,
  targetAmount,
  currentAmount,
  targetDate,
  monthlySavings = 1_200_000,
  className,
  loading = false,
  onEdit,
  onDelete,
}: GoalCardProps) {
  if (loading) {
    return (
      <div className={cn("card animate-pulse", className)}>
        <div className="h-4 w-32 bg-rule opacity-40 rounded-sm mb-3" />
        <div className="h-2 w-full bg-rule opacity-30 rounded-full mb-2" />
        <div className="h-4 w-24 bg-rule opacity-40 rounded-sm" />
      </div>
    );
  }

  const progress = calcProgress(currentAmount, targetAmount);
  const isCompleted = progress >= 100;
  const estimatedDate = !isCompleted && monthlySavings
    ? estimateGoalDate(currentAmount, targetAmount, monthlySavings)
    : null;

  return (
    <div
      className={cn(
        "card group relative overflow-hidden transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-card hover:border-pine/40 cursor-default",
        isCompleted && "border-brass/60 bg-brass-10/20",
        className
      )}
      style={{
        borderColor: isCompleted ? "var(--color-brass)" : "var(--color-rule)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Header: icon + name + progress badge + inline actions */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-card flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: isCompleted
                ? "var(--color-brass-10)"
                : "var(--color-pine-10)",
              border: isCompleted ? "1px solid var(--color-brass-30)" : "1px solid var(--color-pine-30)",
            }}
          >
            {isCompleted ? (
              <CheckCircle2 size={16} strokeWidth={2} style={{ color: "var(--color-brass)" }} />
            ) : (
              <Target size={16} strokeWidth={1.8} style={{ color: "var(--color-pine)" }} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span
              className="text-body font-semibold truncate block text-ink group-hover:text-pine transition-colors leading-snug"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {name}
            </span>
            <span className="text-[11px] text-ink-muted block font-mono">
              Target: {formatRupiah(targetAmount)}
            </span>
          </div>
        </div>

        {/* Right: Progress Percentage Badge + Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className="tabular-nums text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: isCompleted ? "var(--color-brass-10)" : "var(--color-pine-10)",
              color: isCompleted ? "var(--color-brass)" : "var(--color-pine)",
            }}
          >
            {progress}%
          </span>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-0.5 border-l border-rule/50 pl-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1 rounded text-ink-muted hover:text-pine hover:bg-pine-10 transition-colors"
                  title="Edit tujuan"
                  aria-label="Edit tujuan"
                >
                  <Edit2 size={13} strokeWidth={2} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 rounded text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                  title="Hapus tujuan"
                  aria-label="Hapus tujuan"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="h-2 rounded-full mb-3 overflow-hidden shadow-inner"
        style={{ backgroundColor: "var(--color-rule)" }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: isCompleted
              ? "var(--color-brass)"
              : "var(--color-pine)",
          }}
        />
      </div>

      {/* Numerical Details */}
      <div className="flex items-center justify-between gap-2 mb-2.5 text-xs font-mono">
        <span className="text-ink-muted">
          Terkumpul: <strong className="text-ink font-semibold">{formatRupiah(currentAmount)}</strong>
        </span>
        <span className="text-ink-muted">
          Sisa: <strong className="text-pine">{formatRupiah(Math.max(targetAmount - currentAmount, 0))}</strong>
        </span>
      </div>

      {/* Footer: dates metadata */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-rule/50 text-xs">
        <div className="flex items-center gap-1 text-ink-muted">
          <CalendarDays size={12} strokeWidth={1.8} />
          <span suppressHydrationWarning style={{ fontFamily: "var(--font-ui)" }}>
            Batas: {formatDate(targetDate, "short")}
          </span>
        </div>

        {estimatedDate && !isCompleted && (
          <div className="flex items-center gap-1 text-pine font-medium">
            <TrendingUp size={12} strokeWidth={1.8} />
            <span suppressHydrationWarning style={{ fontFamily: "var(--font-ui)" }}>
              Estimasi: {formatDate(estimatedDate, "short")}
            </span>
          </div>
        )}

        {isCompleted && (
          <span className="text-brass font-bold flex items-center gap-1" style={{ color: "var(--color-brass)" }}>
            ✓ Selesai
          </span>
        )}
      </div>
    </div>
  );
}
