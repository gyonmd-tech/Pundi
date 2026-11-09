"use client";

/**
 * components/dashboard/GoalCard.tsx
 * Kartu tujuan tabungan: cincin kemajuan, jumlah terkumpul, sisa, batas &
 * estimasi tanggal tercapai. `children` dirender sebagai kaki kartu (mis.
 * kontribusi otomatis di halaman Tujuan).
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatRupiah, formatDate, calcProgress, estimateGoalDate } from "@/lib/utils/formatter";
import { CalendarDays, Check, Pencil, Sparkles, Trash2 } from "lucide-react";

interface GoalCardProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  monthlySavings?: number;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

const RING = 56;
const STROKE = 6;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ progress, completed }: { progress: number; completed: boolean }) {
  const value = Math.min(progress, 100);
  return (
    <div className="relative shrink-0" style={{ width: RING, height: RING }}>
      <svg width={RING} height={RING} className="-rotate-90" aria-hidden>
        <circle cx={RING / 2} cy={RING / 2} r={RADIUS} fill="none" stroke="var(--color-surface-soft)" strokeWidth={STROKE} />
        <circle
          className="goal-ring"
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          stroke={completed ? "var(--color-mint)" : "var(--color-brand-600)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - value / 100)}
          style={{ "--ring-from": CIRCUMFERENCE } as React.CSSProperties}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[13px] font-semibold text-ink tabular-nums">
        {completed ? <Check className="h-5 w-5 text-mint-ink" strokeWidth={2.5} /> : `${progress}%`}
      </span>
    </div>
  );
}

export function GoalCard({ name, targetAmount, currentAmount, targetDate, monthlySavings = 1_200_000, className, onEdit, onDelete, children }: GoalCardProps) {
  const progress = calcProgress(currentAmount, targetAmount);
  const isCompleted = progress >= 100;
  const estimatedDate = !isCompleted && monthlySavings ? estimateGoalDate(currentAmount, targetAmount, monthlySavings) : null;
  const remaining = Math.max(targetAmount - currentAmount, 0);

  return (
    <article className={cn("flex h-full flex-col rounded-card border bg-surface-high shadow-card", isCompleted ? "border-mint/35" : "border-rule", className)}>
      <div className="flex-1 p-4 sm:p-5">
        <header className="flex items-start gap-3.5">
          <ProgressRing progress={progress} completed={isCompleted} />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="line-clamp-2 break-words text-[15px] font-semibold leading-snug text-ink">{name}</h3>
            <p className="mt-0.5 text-xs text-ink-muted tabular-nums">Target {formatRupiah(targetAmount)}</p>
          </div>
          {(onEdit || onDelete) ? (
            <div className="-mr-2 -mt-2 flex shrink-0">
              {onEdit ? <button type="button" onClick={onEdit} title="Edit tujuan" aria-label="Edit tujuan" className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"><Pencil className="h-3.5 w-3.5" /></button> : null}
              {onDelete ? <button type="button" onClick={onDelete} title="Hapus tujuan" aria-label="Hapus tujuan" className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ember-10 hover:text-ember-ink"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          ) : null}
        </header>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">Terkumpul</p>
            <p className="figure-display mt-0.5 truncate text-[1.6rem] leading-none text-ink">{formatRupiah(currentAmount)}</p>
          </div>
          {!isCompleted ? (
            <p className="shrink-0 text-right text-xs text-ink-muted">Kurang<br /><b className="font-semibold text-ink tabular-nums">{formatRupiah(remaining)}</b></p>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint-10 px-2.5 py-1 text-[11px] font-semibold text-mint-ink"><Check className="h-3 w-3" />Tercapai</span>
          )}
        </div>

        <div className="progress-track mt-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Kemajuan ${name}`}>
          <span className={cn("progress-fill", isCompleted ? "bg-mint" : "bg-brand-600")} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1 text-ink-muted" suppressHydrationWarning><CalendarDays className="h-3.5 w-3.5" />Batas {formatDate(targetDate, "short")}</span>
          {estimatedDate ? (
            <span className="inline-flex items-center gap-1 font-medium text-brand-700" suppressHydrationWarning><Sparkles className="h-3.5 w-3.5" />Estimasi {formatDate(estimatedDate, "short")}</span>
          ) : null}
        </div>
      </div>
      {children ? <div className="border-t border-rule">{children}</div> : null}
    </article>
  );
}
