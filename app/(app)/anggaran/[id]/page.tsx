"use client";

/**
 * app/(app)/anggaran/[id]/page.tsx
 * Detail satu anggaran di siklus berjalan: kenapa jatahnya sekian, grafik per
 * hari & laju siklus (SVG ringan, tanpa library grafik), riwayat siklus
 * sebelumnya, transaksi yang dihitung, dan pengaturannya.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Pencil } from "lucide-react";
import { useAccounts, useBudgetTransfers, useBudgets, useCategories, useGoals, usePreferences, useTransactions } from "@/lib/data/store";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { allowanceExplanation, paceStatus, STATUS_STYLE } from "@/components/budget/BudgetPaceCard";
import { CADENCE_LABEL, computeBudgetPace, countsForBudget, type BudgetPace } from "@/lib/utils/budgetPace";
import { budgetStart, cycleFor, daysBetween, formatCycleRange } from "@/lib/utils/budgetCycle";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

const BudgetWizard = dynamic(() => import("@/components/budget/BudgetWizard").then((m) => m.BudgetWizard), { ssr: false });
const BudgetTransferSheet = dynamic(() => import("@/components/budget/BudgetTransferSheet").then((m) => m.BudgetTransferSheet), { ssr: false });

const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const monthShort = new Intl.DateTimeFormat("id-ID", { month: "short" });
const compact = (value: number) => (value >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt` : `${Math.round(value / 1000).toLocaleString("id-ID")}rb`);

export default function BudgetDetailPage() {
  const params = useParams<{ id: string }>();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const accounts = useAccounts();
  const transfers = useBudgetTransfers();
  const goals = useGoals();
  const preferences = usePreferences();
  const cycleDay = preferences.budgetCycleDay ?? 1;
  const [tab, setTab] = useState<"daily" | "pace">("daily");
  const [editing, setEditing] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const budget = budgets.find((item) => item.id === params.id);
  const category = categories.find((item) => item.id === budget?.categoryId);
  const pace = useMemo(() => (budget ? computeBudgetPace(budget, transactions, { now, cycleDay, transfers }) : null), [budget, transactions, now, cycleDay, transfers]);

  const history = useMemo(() => {
    if (!budget) return [];
    const items: { label: string; spent: number; limit: number }[] = [];
    let cursor = cycleFor(now, cycleDay);
    for (let index = 0; index < 3; index++) {
      const previousEnd = new Date(cursor.start.getFullYear(), cursor.start.getMonth(), cursor.start.getDate() - 1, 12);
      cursor = cycleFor(previousEnd, cycleDay);
      if (budgetStart(budget, cycleDay) > cursor.end) break;
      const past = computeBudgetPace(budget, transactions, { now: previousEnd, cycleDay, transfers });
      items.unshift({ label: monthShort.format(cursor.start), spent: past.monthSpent, limit: past.monthLimit });
    }
    return items;
  }, [budget, transactions, now, cycleDay, transfers]);

  if (!budget || !pace) {
    return (
      <div className="space-y-4">
        <Link href="/anggaran" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />Anggaran</Link>
        <p className="rounded-card border border-rule bg-surface-high px-4 py-10 text-center text-sm text-ink-muted">Anggaran tidak ditemukan. Mungkin sudah dihapus.</p>
      </div>
    );
  }

  const status = paceStatus(pace);
  const labels = CADENCE_LABEL[pace.cadence];
  const accountName = new Map(accounts.map((account) => [account.id, account.name]));
  const sources = (budget.accountIds ?? []).map((id) => accountName.get(id)).filter(Boolean).join(", ") || "Semua rekening";
  const cycleEnd = new Date(pace.cycleEnd.getFullYear(), pace.cycleEnd.getMonth(), pace.cycleEnd.getDate(), 23, 59, 59);
  const counted = transactions
    .filter((transaction) => countsForBudget(budget, transaction))
    .filter((transaction) => { const date = new Date(transaction.date); return date >= pace.effectiveStart && date <= cycleEnd; })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const spentPct = pace.monthLimit > 0 ? Math.round((pace.monthSpent / pace.monthLimit) * 100) : 0;
  const tomorrow = pace.cadence === "daily" && pace.rollover && pace.unitRemaining < 0 ? pace.cadenceAmount + pace.unitRemaining : null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <Link href="/anggaran" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />Anggaran · {formatCycleRange(cycleFor(now, cycleDay))}</Link>

      <section className={cn("rounded-panel p-5 text-white sm:p-6", status === "over" ? "bg-ember-ink" : "bg-brand-700")}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-sm bg-white p-1"><CategoryIcon icon={category?.icon} color={category?.color} size={18} containerSize="md" /></span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight">{category?.name ?? "Anggaran"}</h1>
            <p className="text-sm text-white/85">{labels.adjective} · {formatRupiah(pace.cadenceAmount)} · {sources}</p>
          </div>
          <span className="rounded-[8px] bg-white px-2.5 py-1 text-xs font-bold text-[#0F1729]">{status === "over" ? `Lewat ${formatRupiah(Math.abs(Math.min(0, pace.unitRemaining)) || pace.monthSpent - pace.monthLimit)}` : STATUS_STYLE[status].label}</span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/20 pt-4 sm:grid-cols-4">
          <Stat label={`Terpakai ${labels.current}`} value={formatRupiah(pace.unitSpent)} />
          <Stat label={`Jatah ${labels.current}`} value={formatRupiah(Math.max(0, pace.unitAvailable))} />
          <Stat label="Siklus terpakai" value={`${spentPct}%`} />
          <Stat label="Aman per hari" value={formatRupiah(pace.perDayLeft)} />
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <section aria-labelledby="chart-title" className="rounded-panel border border-rule bg-surface-high p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="chart-title" className="text-base font-bold text-ink">{tab === "daily" ? "14 hari terakhir" : "Laju siklus ini"}</h2>
              <div className="flex gap-1 rounded-sm bg-surface-soft p-1" role="radiogroup" aria-label="Jenis grafik">
                {([["daily", "Per hari"], ["pace", "Laju siklus"]] as const).map(([value, label]) => (
                  <button key={value} type="button" role="radio" aria-checked={tab === value} onClick={() => setTab(value)} className={cn("min-h-10 rounded-xs px-3.5 text-sm font-bold", tab === value ? "bg-brand-950 text-white" : "text-ink-muted hover:text-ink")}>{label}</button>
                ))}
              </div>
            </div>
            {tab === "daily" ? <DailyBars pace={pace} /> : <PaceLine pace={pace} />}
          </section>

          {history.length > 0 ? (
            <section aria-labelledby="history-title" className="rounded-panel border border-rule bg-surface-high p-5">
              <h2 id="history-title" className="text-base font-bold text-ink">Siklus sebelumnya</h2>
              <ul className="mt-3 space-y-3">
                {history.map((item) => {
                  const over = item.spent > item.limit;
                  const max = Math.max(...history.map((entry) => Math.max(entry.spent, entry.limit)), 1);
                  return (
                    <li key={item.label} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                      <span className="font-semibold capitalize text-ink-muted">{item.label}</span>
                      <div className="relative h-3 rounded-full bg-surface-soft">
                        <div className={cn("h-full rounded-full", over ? "bg-ember" : "bg-brand-600")} style={{ width: `${(item.spent / max) * 100}%` }} />
                        <span className="absolute -top-1 h-5 w-[3px] rounded-full bg-ink" style={{ left: `calc(${(item.limit / max) * 100}% - 1px)` }} title={`Jatah ${formatRupiah(item.limit)}`} />
                      </div>
                      <span className={cn("font-bold tabular-nums", over ? "text-ember-ink" : "text-ink")}>{formatRupiah(item.spent)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">Garis = jatah siklus itu.</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section aria-labelledby="why-title" className="rounded-panel bg-brand-950 p-5 text-white">
            <h2 id="why-title" className="text-xs font-bold uppercase tracking-[0.08em] text-white/75">Kenapa jatahnya {formatRupiah(Math.max(0, pace.unitAvailable))}?</h2>
            <dl className="mt-3 space-y-2 text-[15px]">
              <div className="flex justify-between gap-3"><dt className="text-white/80">Jatah {labels.current}</dt><dd className="font-bold tabular-nums">{formatRupiah(pace.unitAllowance)}</dd></div>
              {pace.carryIn !== 0 ? (
                <div className="flex justify-between gap-3"><dt className="text-white/80">{pace.carryIn < 0 ? "Kelebihan sebelumnya" : "Sisa sebelumnya"}</dt><dd className={cn("font-bold tabular-nums", pace.carryIn < 0 ? "text-[#FFB4BA]" : "text-lime")}>{pace.carryIn < 0 ? "− " : "+ "}{formatRupiah(Math.abs(pace.carryIn))}</dd></div>
              ) : null}
              <div className="flex justify-between gap-3 border-t border-white/20 pt-2"><dt className="font-bold">Total</dt><dd className="font-bold tabular-nums">{formatRupiah(pace.unitAvailable)}</dd></div>
            </dl>
            <p className="mt-3 text-sm text-white/80">{allowanceExplanation(pace)}</p>
            {tomorrow !== null ? <p className="mt-2 text-sm font-semibold text-white">Tanpa ditutup, jatah besok jadi {formatRupiah(Math.max(0, tomorrow))}.</p> : null}
            <Button type="button" onClick={() => setTransferOpen(true)} className="mt-4 w-full bg-white text-[#0E1A5C] hover:bg-white/90">
              <ArrowLeftRight className="h-4 w-4" />{pace.unitRemaining < 0 ? "Tutup kelebihan dari anggaran lain" : "Tambah jatah dari anggaran lain"}
            </Button>
          </section>

          <section aria-labelledby="settings-title" className="rounded-panel border border-rule bg-surface-high p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="settings-title" className="text-base font-bold text-ink">Pengaturan</h2>
              <Button type="button" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Ubah</Button>
            </div>
            <dl className="mt-2 divide-y divide-rule text-sm">
              <Row label="Berlaku sejak" value={`${shortDate.format(budgetStart(budget, cycleDay))}${budget.repeat === false ? " · siklus ini saja" : " · ulang tiap siklus"}`} />
              <Row label="Sumber dana" value={sources} />
              <Row label="Sisa / kelebihan" value={pace.cadence === "monthly" ? "Per siklus" : pace.rollover ? `Terbawa ke ${labels.unit} berikutnya` : `Mulai dari nol tiap ${labels.unit}`} />
              {budget.leftoverGoalId ? <Row label="Sisa akhir siklus" value={`→ ${goals.find((goal) => goal.id === budget.leftoverGoalId)?.name ?? "Tujuan"}`} /> : null}
              {pace.transferNet !== 0 ? <Row label="Dipindahkan" value={`${pace.transferNet > 0 ? "+" : "−"}${formatRupiah(Math.abs(pace.transferNet))} siklus ini`} /> : null}
            </dl>
          </section>

          <section aria-labelledby="tx-title" className="rounded-panel border border-rule bg-surface-high p-5">
            <h2 id="tx-title" className="text-base font-bold text-ink">Transaksi yang dihitung</h2>
            {counted.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">Belum ada belanja sejak {shortDate.format(pace.effectiveStart)}.</p>
            ) : (
              <ul className="mt-1 divide-y divide-rule">
                {counted.slice(0, 8).map((transaction) => (
                  <li key={transaction.id} className="flex min-h-14 items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{transaction.note || category?.name}</span>
                      <span className="block text-xs text-ink-muted">{shortDate.format(new Date(transaction.date))} · {accountName.get(transaction.accountId) ?? "Rekening"}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums text-ink">−{formatRupiah(transaction.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            {counted.length > 8 ? <p className="mt-2 text-xs text-ink-muted">+{counted.length - 8} transaksi lainnya siklus ini.</p> : null}
          </section>
        </div>
      </div>

      {editing ? <BudgetWizard open onClose={() => setEditing(false)} editing={budget} /> : null}
      {transferOpen ? <BudgetTransferSheet open onClose={() => setTransferOpen(false)} toBudgetId={budget.id} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs font-semibold text-white/80">{label}</dt>
      <dd className="mt-0.5 truncate font-display text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 py-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-bold text-ink">{value}</dd>
    </div>
  );
}

/** Indeks hari mulai dan hari ini di dalam siklus. */
function cycleIndexes(pace: BudgetPace) {
  const startIdx = daysBetween(pace.cycleStart, pace.effectiveStart);
  const refIdx = daysBetween(pace.cycleStart, pace.refDate);
  return { startIdx, refIdx };
}

function DailyBars({ pace }: { pace: BudgetPace }) {
  const { startIdx, refIdx } = cycleIndexes(pace);
  const from = Math.max(startIdx, refIdx - 13);
  const days = Array.from({ length: refIdx - from + 1 }, (_, offset) => {
    const index = from + offset;
    const date = new Date(pace.cycleStart.getFullYear(), pace.cycleStart.getMonth(), pace.cycleStart.getDate() + index);
    return { index, date, spent: pace.perDay[index] ?? 0 };
  });
  const daily = pace.cadence === "daily" ? pace.cadenceAmount : Math.round(pace.monthLimit / Math.max(1, pace.activeDays));
  const max = Math.max(daily, ...days.map((day) => day.spent), 1) * 1.15;
  const overDays = days.filter((day) => day.spent > daily).length;
  return (
    <div className="mt-4">
      <div role="img" aria-label={`Pengeluaran ${days.length} hari terakhir, jatah ${formatRupiah(daily)} per hari, ${overDays} hari melewati jatah`}>
        <div className="relative flex h-48 items-end gap-1.5 sm:gap-2.5">
          <div aria-hidden className="absolute inset-x-0 border-t-2 border-dashed border-ink" style={{ bottom: `${(daily / max) * 100}%` }} />
          <span aria-hidden className="absolute right-0 rounded-[6px] bg-brand-950 px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ bottom: `calc(${(daily / max) * 100}% + 4px)` }}>{pace.cadence === "daily" ? "Jatah" : "Rata-rata"} {compact(daily)}</span>
          {days.map((day) => {
            const over = day.spent > daily;
            const today = day.index === refIdx;
            return (
              <div key={day.index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                {day.spent > 0 ? <span className={cn("hidden text-[11px] font-bold tabular-nums sm:block", over ? "text-ember-ink" : "text-ink")}>{compact(day.spent)}</span> : null}
                <div className={cn("w-full max-w-9 rounded-t-[6px]", over ? "bg-ember" : "bg-brand-600", today && "ring-2 ring-ink ring-offset-2 ring-offset-surface-high")} style={{ height: `${Math.max(2, (day.spent / max) * 100)}%` }} title={`${shortDate.format(day.date)}: ${formatRupiah(day.spent)}`} />
              </div>
            );
          })}
        </div>
        <div aria-hidden className="mt-1.5 flex gap-1.5 sm:gap-2.5">
          {days.map((day) => <span key={day.index} className={cn("min-w-0 flex-1 text-center text-[11px] font-semibold tabular-nums", day.index === refIdx ? "text-ink" : "text-ink-muted")}>{day.index === refIdx ? "Ini" : day.date.getDate()}</span>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-ink-muted">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-[3px] bg-brand-600" />Dalam jatah</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-[3px] bg-ember" />Lewat jatah</span>
        <span>{overDays} dari {days.length} hari lewat</span>
      </div>
    </div>
  );
}

function PaceLine({ pace }: { pace: BudgetPace }) {
  const { startIdx, refIdx } = cycleIndexes(pace);
  const W = 600;
  const H = 200;
  const total = pace.daysInMonth;
  const x = (index: number) => ((index + 1 - startIdx) / Math.max(1, total - startIdx)) * W;
  let running = 0;
  for (let index = startIdx; index <= refIdx; index++) running += pace.perDay[index] ?? 0;
  const top = Math.max(pace.monthLimit, running, 1) * 1.1;
  const y = (value: number) => H - (value / top) * H;
  let cumulative = 0;
  const scaled = [`0,${H}`];
  for (let index = startIdx; index <= refIdx; index++) {
    cumulative += pace.perDay[index] ?? 0;
    scaled.push(`${x(index).toFixed(1)},${y(cumulative).toFixed(1)}`);
  }
  const todayX = x(refIdx);
  const ahead = pace.aheadBy >= 0;
  const cycleEndLabel = shortDate.format(pace.cycleEnd);
  return (
    <div className="mt-4">
      <p className={cn("text-sm font-bold", ahead ? "text-mint-ink" : "text-ember-ink")}>{ahead ? `${formatRupiah(pace.aheadBy)} di bawah jadwal` : `${formatRupiah(Math.abs(pace.aheadBy))} di atas jadwal`}</p>
      <div className="relative mt-3">
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Terpakai ${formatRupiah(running)} sampai hari ini dari jatah siklus ${formatRupiah(pace.monthLimit)}`}>
          <line x1="0" y1={y(pace.monthLimit)} x2={W} y2={y(pace.monthLimit)} stroke="var(--color-rule-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1={H} x2={W} y2={y(pace.monthLimit)} stroke="var(--color-ink)" strokeWidth="2" strokeDasharray="7 6" vectorEffect="non-scaling-stroke" />
          <polygon points={`${scaled.join(" ")} ${todayX.toFixed(1)},${H}`} fill="var(--color-brand-600)" fillOpacity="0.16" />
          <polyline points={scaled.join(" ")} fill="none" stroke={ahead ? "var(--color-brand-600)" : "var(--color-ember)"} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1={todayX} y1="0" x2={todayX} y2={H} stroke="var(--color-ink)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute right-0 rounded-[6px] bg-brand-950 px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ top: `${(y(pace.monthLimit) / H) * 100}%`, transform: "translateY(-120%)" }}>Jatah {compact(pace.monthLimit)}</span>
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between text-xs font-semibold text-ink-muted">
        <span>{shortDate.format(pace.effectiveStart)}</span><span className="font-bold text-ink">Hari ini · {compact(running)}</span><span>{cycleEndLabel}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-ink-muted">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-1 w-4 rounded-full bg-brand-600" />Terpakai</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-4 border-t-2 border-dashed border-ink" />Jadwal ideal</span>
      </div>
    </div>
  );
}
