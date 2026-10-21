"use client";

/**
 * components/budget/BudgetPaceCard.tsx
 * Kartu anggaran berbasis waktu: sisa jatah hari ini / minggu ini / bulan ini,
 * sisa jatah sebelumnya yang terbawa, grafik 7 hari, dan ritme bulanan
 * (lebih hemat / lebih boros dibanding jadwal).
 */
import { AlertTriangle, CheckCircle2, Clock3, Pencil, Repeat, Trash2, TrendingDown, TrendingUp } from "lucide-react";
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
  const labels = CADENCE_LABEL[pace.cadence];
  const status = paceStatus(pace);
  const style = statusStyle[status];
  const unitPct = pace.unitAvailable > 0 ? Math.min(100, (pace.unitSpent / pace.unitAvailable) * 100) : pace.unitSpent > 0 ? 100 : 0;
  const monthPct = pace.monthLimit > 0 ? Math.min(100, (pace.monthSpent / pace.monthLimit) * 100) : 0;
  const schedulePct = pace.monthLimit > 0 ? Math.min(100, (pace.allowanceToDate / pace.monthLimit) * 100) : 0;
  const maxBar = Math.max(pace.cadenceAmount && pace.cadence === "daily" ? pace.cadenceAmount : 0, ...pace.lastDays.map((day) => Math.max(day.spent, day.allowance)), 1);

  return (
    <article className="rounded-[20px] border border-rule bg-surface-high p-4 shadow-card sm:p-5">
      <header className="flex items-start gap-3">
        <CategoryIcon icon={icon} color={color} size={16} containerSize="md" />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[15px] font-bold leading-snug text-ink">{name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
              {labels.adjective} · {formatRupiah(pace.cadenceAmount)}{labels.per}
            </span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", style.className)}>
              <style.Icon className="h-3 w-3" />{style.label}
            </span>
            {pace.rollover ? <span title="Sisa atau kelebihan jatah sebelumnya terbawa" className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-ink-muted"><Repeat className="h-3 w-3" />Fleksibel</span> : null}
          </div>
        </div>
        {(onEdit || onDelete) ? (
          <div className="-mr-1 -mt-1 flex shrink-0 items-center">
            {onEdit ? <button type="button" onClick={onEdit} aria-label={`Edit anggaran ${name}`} className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition hover:bg-pine-10 hover:text-pine"><Pencil className="h-4 w-4" /></button> : null}
            {onDelete ? <button type="button" onClick={onDelete} aria-label={`Hapus anggaran ${name}`} className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition hover:bg-ember-10 hover:text-ember"><Trash2 className="h-4 w-4" /></button> : null}
          </div>
        ) : null}
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
            {pace.unitRemaining >= 0 ? `Sisa ${labels.current}` : `Lewat ${labels.current}`}
          </p>
          <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums tracking-[-0.03em]", pace.unitRemaining >= 0 ? "text-ink" : "text-ember-ink")}>
            {pace.unitRemaining < 0 ? "−" : ""}{formatRupiah(Math.abs(pace.unitRemaining))}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Terpakai <b className="font-semibold text-ink">{formatRupiah(pace.unitSpent)}</b> dari {formatRupiah(pace.unitAvailable)}
            {pace.cadence === "weekly" && pace.unitRemaining > 0 && pace.unitDaysRemaining > 1 ? <> · ±{formatRupiah(Math.round(pace.unitRemaining / pace.unitDaysRemaining))}/hari untuk {pace.unitDaysRemaining} hari lagi</> : null}
            {pace.cadence === "monthly" ? <> · aman {formatRupiah(pace.perDayLeft)}/hari untuk {pace.daysRemaining} hari lagi</> : null}
          </p>
          {pace.rollover && pace.carryIn !== 0 ? (
            <p className={cn("mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold", pace.carryIn > 0 ? "bg-mint-10 text-mint-ink" : "bg-ember-10 text-ember-ink")}>
              <Repeat className="h-3 w-3" />
              {pace.carryIn > 0 ? `+${formatRupiah(pace.carryIn)} sisa jatah sebelumnya ikut terbawa` : `−${formatRupiah(Math.abs(pace.carryIn))} kelebihan sebelumnya mengurangi jatah`}
            </p>
          ) : null}
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-valuenow={Math.round(unitPct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Pemakaian jatah ${labels.current}`}>
            <div className={cn("h-full rounded-full transition-[width] duration-500", style.bar)} style={{ width: `${unitPct}%` }} />
          </div>
        </div>

        {pace.cadence === "daily" && pace.lastDays.length > 1 ? (
          <div className="flex items-end gap-1.5 sm:pl-2" aria-label="Pengeluaran 7 hari terakhir">
            {pace.lastDays.map((day, index) => {
              const isToday = index === pace.lastDays.length - 1;
              const over = day.spent > pace.cadenceAmount;
              return (
                <div key={day.date.toISOString()} className="flex flex-1 flex-col items-center gap-1 sm:w-6 sm:flex-none" title={`${day.date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}: ${formatRupiah(day.spent)}`}>
                  <div className="relative h-14 w-full max-w-6 overflow-hidden rounded-md bg-surface-soft">
                    <div className="absolute inset-x-0 border-t border-dashed border-ink-soft/60" style={{ bottom: `${(pace.cadenceAmount / maxBar) * 100}%` }} />
                    <div className={cn("absolute inset-x-0 bottom-0 rounded-md", over ? "bg-ember" : isToday ? "bg-brand-500" : "bg-mint")} style={{ height: `${Math.min(100, (day.spent / maxBar) * 100)}%` }} />
                  </div>
                  <span className={cn("text-[10px] font-bold capitalize", isToday ? "text-ink" : "text-ink-soft")}>{shortDay.format(day.date)}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <footer className="mt-4 border-t border-rule pt-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <span className="text-ink-muted">Bulan ini <b className="font-semibold text-ink">{formatRupiah(pace.monthSpent)}</b> / {formatRupiah(pace.monthLimit)}</span>
          {pace.aheadBy >= 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-mint-ink"><TrendingDown className="h-3.5 w-3.5" />Hemat {formatRupiah(pace.aheadBy)} dari jadwal</span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-ember-ink"><TrendingUp className="h-3.5 w-3.5" />Boros {formatRupiah(Math.abs(pace.aheadBy))} dari jadwal</span>
          )}
        </div>
        <div className="relative mt-2 h-1.5 rounded-full bg-surface-soft">
          <div className={cn("h-full rounded-full", pace.monthSpent > pace.monthLimit ? "bg-ember" : "bg-brand-500")} style={{ width: `${monthPct}%` }} />
          <span className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-ink" style={{ left: `calc(${schedulePct}% - 1px)` }} title="Posisi jadwal hari ini" />
        </div>
      </footer>
    </article>
  );
}
