"use client";

/**
 * components/budget/BudgetPaceCard.tsx
 * Kartu anggaran berbasis waktu: sisa jatah hari ini / minggu ini / bulan ini,
 * sisa jatah sebelumnya yang terbawa, grafik 7 hari, dan ritme bulanan
 * (lebih hemat / lebih boros dibanding jadwal). Ringkas secara default;
 * rincian dibuka lewat tombol "Rincian" agar daftar anggaran mudah dipindai.
 */
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, Pencil, Repeat, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CADENCE_LABEL, type BudgetPace } from "@/lib/utils/budgetPace";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface BudgetPaceCardProps {
  name: string;
  icon?: string;
  color?: string;
  pace: BudgetPace;
  onEdit?: () => void;
  onDelete?: () => void;
}

export type PaceStatus = "safe" | "warning" | "over";

export function paceStatus(pace: BudgetPace): PaceStatus {
  if (pace.unitRemaining < 0 || pace.monthSpent > pace.monthLimit) return "over";
  if (pace.unitAvailable > 0 && pace.unitSpent / pace.unitAvailable >= 0.8) return "warning";
  return "safe";
}

const statusStyle: Record<PaceStatus, { label: string; className: string; bar: string; Icon: typeof CheckCircle2 }> = {
  safe: { label: "Aman", className: "bg-mint-10 text-mint-ink", bar: "bg-mint", Icon: CheckCircle2 },
  warning: { label: "Hampir habis", className: "bg-warning-10 text-warning-ink", bar: "bg-warning", Icon: Clock3 },
  over: { label: "Lewat jatah", className: "bg-ember-10 text-ember-ink", bar: "bg-ember", Icon: AlertTriangle },
};

const shortDay = new Intl.DateTimeFormat("id-ID", { weekday: "narrow" });

export function BudgetPaceCard({ name, icon, color, pace, onEdit, onDelete }: BudgetPaceCardProps) {
  const [open, setOpen] = useState(false);
  const labels = CADENCE_LABEL[pace.cadence];
  const status = paceStatus(pace);
  const style = statusStyle[status];
  const unitPct = pace.unitAvailable > 0 ? Math.min(100, (pace.unitSpent / pace.unitAvailable) * 100) : pace.unitSpent > 0 ? 100 : 0;
  const monthPct = pace.monthLimit > 0 ? Math.min(100, (pace.monthSpent / pace.monthLimit) * 100) : 0;
  const schedulePct = pace.monthLimit > 0 ? Math.min(100, (pace.allowanceToDate / pace.monthLimit) * 100) : 0;
  const maxBar = Math.max(pace.cadenceAmount && pace.cadence === "daily" ? pace.cadenceAmount : 0, ...pace.lastDays.map((day) => Math.max(day.spent, day.allowance)), 1);
  const detailsId = `budget-${name.replace(/\W+/g, "-")}-rincian`;

  return (
    <article className={cn("rounded-card border bg-surface-high p-4 shadow-card transition-colors sm:p-5", status === "over" ? "border-ember/35" : "border-rule")}>
      <header className="flex items-center gap-3">
        <CategoryIcon icon={icon} color={color} size={16} containerSize="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-ink">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-muted">
            {labels.adjective} · {formatRupiah(pace.cadenceAmount)}{labels.per}
            {pace.rollover ? <Repeat aria-label="Fleksibel: sisa jatah terbawa" className="h-3 w-3 shrink-0" /> : null}
          </p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", style.className)}>
          <style.Icon className="h-3 w-3" />{style.label}
        </span>
      </header>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-muted">{pace.unitRemaining >= 0 ? `Sisa ${labels.current}` : `Lewat ${labels.current}`}</p>
          <p className={cn("figure-display mt-0.5 text-[1.75rem] leading-none", pace.unitRemaining >= 0 ? "text-ink" : "text-ember-ink")}>
            {pace.unitRemaining < 0 ? "−" : ""}{formatRupiah(Math.abs(pace.unitRemaining))}
          </p>
        </div>
        <p className="shrink-0 pb-0.5 text-right text-xs text-ink-muted tabular-nums">
          <b className="font-semibold text-ink">{formatRupiah(pace.unitSpent)}</b>
          <br />dari {formatRupiah(pace.unitAvailable)}
        </p>
      </div>

      <div className="progress-track mt-3" role="progressbar" aria-valuenow={Math.round(unitPct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Pemakaian jatah ${labels.current}`}>
        <span className={cn("progress-fill", style.bar)} style={{ width: `${unitPct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {pace.aheadBy >= 0 ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-medium text-mint-ink"><TrendingDown className="h-3.5 w-3.5 shrink-0" />Hemat {formatRupiah(pace.aheadBy)} dari jadwal</span>
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-medium text-ember-ink"><TrendingUp className="h-3.5 w-3.5 shrink-0" />Boros {formatRupiah(Math.abs(pace.aheadBy))} dari jadwal</span>
        )}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={detailsId} className="-mr-2 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50">
          Rincian<ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div id={detailsId} className="mt-3 space-y-4 border-t border-rule pt-4 animate-in fade-in slide-in-from-top-1">
          <p className="text-xs text-ink-muted">
            {pace.cadence === "weekly" && pace.unitRemaining > 0 && pace.unitDaysRemaining > 1 ? <>±{formatRupiah(Math.round(pace.unitRemaining / pace.unitDaysRemaining))}/hari untuk {pace.unitDaysRemaining} hari lagi.</> : null}
            {pace.cadence === "monthly" ? <>Aman {formatRupiah(pace.perDayLeft)}/hari untuk {pace.daysRemaining} hari lagi.</> : null}
            {pace.cadence === "daily" ? <>Jatah harian {formatRupiah(pace.cadenceAmount)}.</> : null}
          </p>
          {pace.rollover && pace.carryIn !== 0 ? (
            <p className={cn("inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[11px] font-semibold", pace.carryIn > 0 ? "bg-mint-10 text-mint-ink" : "bg-ember-10 text-ember-ink")}>
              <Repeat className="h-3 w-3" />
              {pace.carryIn > 0 ? `+${formatRupiah(pace.carryIn)} sisa jatah sebelumnya ikut terbawa` : `−${formatRupiah(Math.abs(pace.carryIn))} kelebihan sebelumnya mengurangi jatah`}
            </p>
          ) : null}

          {pace.cadence === "daily" && pace.lastDays.length > 1 ? (
            <div className="flex items-end gap-1.5" aria-label="Pengeluaran 7 hari terakhir">
              {pace.lastDays.map((day, index) => {
                const isToday = index === pace.lastDays.length - 1;
                const over = day.spent > pace.cadenceAmount;
                return (
                  <div key={day.date.toISOString()} className="flex flex-1 flex-col items-center gap-1" title={`${day.date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}: ${formatRupiah(day.spent)}`}>
                    <div className="relative h-14 w-full max-w-7 overflow-hidden rounded-md bg-surface-soft">
                      <div className="absolute inset-x-0 border-t border-dashed border-ink-soft/60" style={{ bottom: `${(pace.cadenceAmount / maxBar) * 100}%` }} />
                      <div className={cn("chart-bar absolute inset-x-0 bottom-0 rounded-md", over ? "bg-ember" : isToday ? "bg-brand-500" : "bg-mint")} style={{ height: `${Math.min(100, (day.spent / maxBar) * 100)}%`, animationDelay: `${index * 35}ms` }} />
                    </div>
                    <span className={cn("text-[10px] font-semibold capitalize", isToday ? "text-ink" : "text-ink-soft")}>{shortDay.format(day.date)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div>
            <p className="text-xs text-ink-muted">Bulan ini <b className="font-semibold text-ink">{formatRupiah(pace.monthSpent)}</b> / {formatRupiah(pace.monthLimit)}</p>
            <div className="relative mt-2 h-1.5 rounded-full bg-surface-soft">
              <div className={cn("h-full rounded-full", pace.monthSpent > pace.monthLimit ? "bg-ember" : "bg-brand-500")} style={{ width: `${monthPct}%` }} />
              <span className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-ink" style={{ left: `calc(${schedulePct}% - 1px)` }} title="Posisi jadwal hari ini" />
            </div>
          </div>

          {(onEdit || onDelete) ? (
            <div className="flex gap-2">
              {onEdit ? <button type="button" onClick={onEdit} aria-label={`Edit anggaran ${name}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-rule px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft"><Pencil className="h-3.5 w-3.5" />Ubah</button> : null}
              {onDelete ? <button type="button" onClick={onDelete} aria-label={`Hapus anggaran ${name}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-rule px-3 py-2 text-xs font-semibold text-ember-ink transition-colors hover:bg-ember-10"><Trash2 className="h-3.5 w-3.5" />Hapus</button> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
