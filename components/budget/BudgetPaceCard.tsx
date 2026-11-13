"use client";

/**
 * components/budget/BudgetPaceCard.tsx
 * Kartu anggaran (tampilan ponsel/tablet): terpakai vs jatah unit berjalan,
 * penjelasan jatah dalam kalimat ("Rp35.000 − kelebihan kemarin Rp12.500"),
 * dan rincian (grafik 7 hari + posisi siklus terhadap jadwal).
 *
 * Di layar sentuh kartu bisa digeser ke kiri untuk aksi cepat Ubah/Hapus.
 * Aksi yang sama selalu tersedia di "Rincian" — geser hanyalah jalan pintas.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeftRight, CheckCircle2, ChevronDown, Clock3, Pencil, Sparkles, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CADENCE_LABEL, type BudgetPace } from "@/lib/utils/budgetPace";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface BudgetPaceCardProps {
  name: string;
  icon?: string;
  color?: string;
  pace: BudgetPace;
  /** Nama rekening sumber dana; kosong = semua rekening. */
  sources?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  /** Buka "pindahkan jatah" dengan anggaran ini sebagai penerima. */
  onTransfer?: () => void;
  /** Tautan ke halaman detail anggaran. */
  href?: string;
}

export type PaceStatus = "safe" | "warning" | "over";

export function paceStatus(pace: BudgetPace): PaceStatus {
  if (pace.unitRemaining < 0 || pace.monthSpent > pace.monthLimit) return "over";
  if (pace.unitAvailable > 0 && pace.unitSpent / pace.unitAvailable >= 0.8) return "warning";
  return "safe";
}

export const STATUS_STYLE: Record<PaceStatus, { label: string; badge: string; bar: string; Icon: typeof CheckCircle2 }> = {
  safe: { label: "Aman", badge: "bg-mint-ink text-white", bar: "bg-mint", Icon: CheckCircle2 },
  warning: { label: "Hampir habis", badge: "bg-warning text-[#1A1200]", bar: "bg-warning", Icon: Clock3 },
  over: { label: "Lewat", badge: "bg-ember-ink text-white", bar: "bg-ember", Icon: AlertTriangle },
};

const shortDay = new Intl.DateTimeFormat("id-ID", { weekday: "short" });
const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const ACTIONS_WIDTH = 144;

/** Kalimat yang menjelaskan dari mana angka jatah unit berjalan berasal. */
export function allowanceExplanation(pace: BudgetPace) {
  const moved = pace.transferNet > 0 ? ` (termasuk +${formatRupiah(pace.transferNet)} dipindahkan)` : pace.transferNet < 0 ? ` (−${formatRupiah(Math.abs(pace.transferNet))} dipindahkan ke anggaran lain)` : "";
  const base = baseExplanation(pace);
  return moved ? `${base.replace(/\.$/, "")}${moved}.` : base;
}

function baseExplanation(pace: BudgetPace) {
  const labels = CADENCE_LABEL[pace.cadence];
  const previous = pace.cadence === "daily" ? "kemarin" : pace.cadence === "weekly" ? "minggu lalu" : "sebelumnya";
  if (pace.carryIn < 0) return `Jatah ${formatRupiah(pace.unitAllowance)} − kelebihan ${previous} ${formatRupiah(Math.abs(pace.carryIn))}.`;
  if (pace.carryIn > 0) return `Jatah ${formatRupiah(pace.unitAllowance)} + sisa ${previous} ${formatRupiah(pace.carryIn)}.`;
  if (pace.startedMidCycle && pace.cadence !== "daily") return `Berlaku sejak ${shortDate.format(pace.effectiveStart)} — belanja sebelumnya tidak dihitung.`;
  if (pace.cadence === "monthly") {
    return pace.unitRemaining < 0
      ? "Jatah siklus ini sudah habis — belanja berikutnya menambah kelebihan."
      : `Aman ${formatRupiah(pace.perDayLeft)}/hari untuk ${pace.daysRemaining} hari lagi.`;
  }
  return `Jatah ${formatRupiah(pace.unitAllowance)} ${labels.current}.`;
}

export function isNewThisCycle(pace: BudgetPace, now = new Date()) {
  return pace.startedMidCycle && now.getTime() - pace.effectiveStart.getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function BudgetPaceCard({ name, icon, color, pace, sources, onEdit, onDelete, onTransfer, href }: BudgetPaceCardProps) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; base: number; active: boolean } | null>(null);

  const labels = CADENCE_LABEL[pace.cadence];
  const status = paceStatus(pace);
  const style = STATUS_STYLE[status];
  const fresh = isNewThisCycle(pace);
  const usedPct = pace.unitAvailable > 0 ? Math.min(100, (pace.unitSpent / pace.unitAvailable) * 100) : pace.unitSpent > 0 ? 100 : 0;
  const overPct = pace.unitRemaining < 0 && pace.unitSpent > 0 ? Math.min(100, (Math.abs(pace.unitRemaining) / pace.unitSpent) * 100) : 0;
  const monthPct = pace.monthLimit > 0 ? Math.min(100, (pace.monthSpent / pace.monthLimit) * 100) : 0;
  const schedulePct = pace.monthLimit > 0 ? Math.min(100, (pace.allowanceToDate / pace.monthLimit) * 100) : 0;
  const maxBar = Math.max(pace.cadence === "daily" ? pace.cadenceAmount : 0, ...pace.lastDays.map((day) => Math.max(day.spent, day.allowance)), 1);
  const detailsId = `budget-${name.replace(/\W+/g, "-")}-rincian`;
  const hasActions = Boolean(onEdit || onDelete);

  function onPointerDown(event: React.PointerEvent) {
    if (event.pointerType !== "touch" || !hasActions) return;
    drag.current = { x: event.clientX, y: event.clientY, base: offset, active: false };
  }
  function onPointerMove(event: React.PointerEvent) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.active) {
      if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 8) return; // biarkan gulir vertikal
      state.active = true;
      setDragging(true);
    }
    setOffset(Math.max(-ACTIONS_WIDTH, Math.min(0, state.base + dx)));
  }
  function onPointerUp() {
    const state = drag.current;
    drag.current = null;
    setDragging(false);
    if (!state?.active) return;
    setOffset((value) => (value < -ACTIONS_WIDTH / 2 ? -ACTIONS_WIDTH : 0));
  }

  return (
    <div className="relative overflow-hidden rounded-card bg-brand-950">
      {hasActions ? (
        <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTIONS_WIDTH }} aria-hidden={offset === 0}>
          {onEdit ? <button type="button" tabIndex={offset === 0 ? -1 : 0} onClick={() => { setOffset(0); onEdit(); }} className="flex flex-1 flex-col items-center justify-center gap-1 bg-brand-700 text-xs font-bold text-white"><Pencil className="h-5 w-5" />Ubah</button> : null}
          {onDelete ? <button type="button" tabIndex={offset === 0 ? -1 : 0} onClick={() => { setOffset(0); onDelete(); }} className="flex flex-1 flex-col items-center justify-center gap-1 bg-ember-ink text-xs font-bold text-white"><Trash2 className="h-5 w-5" />Hapus</button> : null}
        </div>
      ) : null}

      <article
        className={cn(
          "relative touch-pan-y rounded-card border bg-surface-high p-4 transition-transform duration-200 sm:p-5",
          status === "over" ? "border-2 border-ember" : "border-rule",
        )}
        style={{ transform: `translateX(${offset}px)`, transitionDuration: dragging ? "0ms" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <header className="flex items-center gap-3">
          <CategoryIcon icon={icon} color={color} size={18} containerSize="md" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold leading-snug text-ink">
              {href ? <Link href={href} className="hover:underline">{name}</Link> : name}
            </h3>
            <p className="mt-0.5 truncate text-xs font-medium text-ink-muted">
              {labels.adjective} · {formatRupiah(pace.cadenceAmount)} · {sources?.length ? sources.join(", ") : "semua rekening"}
            </p>
          </div>
          <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs font-bold", fresh && status === "safe" ? "bg-brand-950 text-white" : style.badge)}>
            {fresh && status === "safe" ? <><Sparkles className="h-3.5 w-3.5" />Baru</> : <><style.Icon className="h-3.5 w-3.5" />{style.label}</>}
          </span>
        </header>

        <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn("text-2xl font-bold tabular-nums", status === "over" ? "text-ember-ink" : "text-ink")}>{formatRupiah(pace.unitSpent)}</span>
          <span className="text-sm font-semibold tabular-nums text-ink-muted">/ {formatRupiah(Math.max(0, pace.unitAvailable))} {labels.current}</span>
        </p>

        <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-valuenow={Math.round(usedPct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Pemakaian jatah ${labels.current}`}>
          <span className={cn("h-full", status === "over" ? "bg-ink" : style.bar)} style={{ width: `${usedPct - overPct}%` }} />
          {overPct > 0 ? <span className="h-full bg-ember" style={{ width: `${overPct}%` }} /> : null}
        </div>

        <p className={cn("mt-2.5 text-sm leading-snug", status === "over" ? "font-semibold text-ember-ink" : "text-ink-muted")}>
          {pace.unitRemaining < 0 ? `Lewat ${formatRupiah(Math.abs(pace.unitRemaining))}. ` : null}{allowanceExplanation(pace)}
        </p>

        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={detailsId} className="-mx-1 mt-1 inline-flex min-h-10 items-center gap-1 rounded-sm px-1 text-sm font-bold text-brand-700">
          Rincian<ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open ? (
          <div id={detailsId} className="mt-2 space-y-4 border-t border-rule pt-4 animate-in fade-in slide-in-from-top-1">
            {pace.cadence === "daily" && pace.lastDays.length > 1 ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">7 hari terakhir</p>
                <div role="img" aria-label={`Pengeluaran 7 hari terakhir, jatah ${formatRupiah(pace.cadenceAmount)} per hari`}>
                  <div className="relative flex h-20 items-end gap-1.5">
                    <div aria-hidden className="absolute inset-x-0 border-t-2 border-dashed border-ink/60" style={{ bottom: `${(pace.cadenceAmount / maxBar) * 100}%` }} />
                    {pace.lastDays.map((day, index) => {
                      const isToday = index === pace.lastDays.length - 1;
                      const over = day.spent > pace.cadenceAmount;
                      return (
                        <div key={day.date.toISOString()} className="flex h-full flex-1 items-end justify-center">
                          <div className={cn("w-full max-w-8 rounded-t-[6px]", over ? "bg-ember" : "bg-brand-600", isToday && "ring-2 ring-ink ring-offset-1 ring-offset-surface-high")} style={{ height: `${Math.max(3, (day.spent / maxBar) * 100)}%` }} title={`${shortDate.format(day.date)}: ${formatRupiah(day.spent)}`} />
                        </div>
                      );
                    })}
                  </div>
                  <div aria-hidden className="mt-1 flex gap-1.5">
                    {pace.lastDays.map((day, index) => (
                      <span key={day.date.toISOString()} className={cn("flex-1 text-center text-[11px] font-semibold capitalize", index === pace.lastDays.length - 1 ? "text-ink" : "text-ink-muted")}>{index === pace.lastDays.length - 1 ? "Ini" : shortDay.format(day.date)}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-sm text-ink-muted">Siklus ini <b className="font-bold tabular-nums text-ink">{formatRupiah(pace.monthSpent)}</b> / {formatRupiah(pace.monthLimit)}</p>
              <div className="relative mt-2 h-2.5 rounded-full bg-surface-soft">
                <div className={cn("h-full rounded-full", pace.monthSpent > pace.monthLimit ? "bg-ember" : "bg-brand-600")} style={{ width: `${monthPct}%` }} />
                <span className="absolute -top-1 h-[18px] w-[3px] rounded-full bg-ink" style={{ left: `calc(${schedulePct}% - 1px)` }} title="Target hari ini" />
              </div>
              <p className={cn("mt-2 text-sm font-semibold", pace.aheadBy >= 0 ? "text-mint-ink" : "text-ember-ink")}>
                {pace.aheadBy >= 0 ? `Hemat ${formatRupiah(pace.aheadBy)} dari jadwal` : `Boros ${formatRupiah(Math.abs(pace.aheadBy))} dari jadwal`} · garis = target hari ini
              </p>
            </div>

            {onTransfer ? (
              <button type="button" onClick={onTransfer} className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-sm bg-brand-700 text-sm font-bold text-white"><ArrowLeftRight className="h-4 w-4" />{pace.unitRemaining < 0 ? "Tutup kelebihan dari anggaran lain" : "Tambah jatah dari anggaran lain"}</button>
            ) : null}
            {hasActions ? (
              <div className="flex gap-2">
                {href ? <Link href={href} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-rule-strong text-sm font-bold text-ink transition-colors hover:bg-surface-soft">Detail</Link> : null}
                {onEdit ? <button type="button" onClick={onEdit} aria-label={`Ubah anggaran ${name}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-sm border border-rule-strong text-sm font-bold text-ink transition-colors hover:bg-surface-soft"><Pencil className="h-4 w-4" />Ubah</button> : null}
                {onDelete ? <button type="button" onClick={onDelete} aria-label={`Hapus anggaran ${name}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-sm border border-rule-strong text-sm font-bold text-ember-ink transition-colors hover:bg-ember-10"><Trash2 className="h-4 w-4" />Hapus</button> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </div>
  );
}
