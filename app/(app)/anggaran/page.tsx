"use client";

/**
 * app/(app)/anggaran/page.tsx
 * Anggaran per kategori dalam SIKLUS (tanggal gajian, lihat
 * lib/utils/budgetCycle.ts). Setiap anggaran berlaku sejak tanggal mulainya,
 * lanjut otomatis tiap siklus, dan bisa dibatasi ke rekening sumber dana.
 *
 * Susunan: hero "aman hari ini" + cincin siklus → "Ke mana uangmu" (saldo vs
 * sisa jatah, tagihan, belum dialokasikan) → peringatan lewat jatah →
 * daftar anggaran (kartu di ponsel, tabel di desktop) → anggaran terjadwal.
 */

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, CalendarRange, ChevronDown, Pencil, PieChart, Plus, Trash2 } from "lucide-react";
import { useAccounts, useApp, useBudgets, useCategories, usePreferences, useRecurringRules, useTransactions } from "@/lib/data/store";
import { deleteBudgetAction } from "@/actions/budgets";
import { useToast } from "@/lib/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { BudgetPaceCard, allowanceExplanation, isNewThisCycle, paceStatus, STATUS_STYLE, type PaceStatus } from "@/components/budget/BudgetPaceCard";
import { formatRupiah } from "@/lib/utils/formatter";
import { activeBudgetPaces, CADENCE_LABEL } from "@/lib/utils/budgetPace";
import { budgetStart, cycleFor, daysBetween, formatCycleRange, scheduledBudgets } from "@/lib/utils/budgetCycle";
import type { Budget } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

// Dialog baru diunduh saat dibuka — tidak menambah JS tampilan pertama.
const BudgetWizard = dynamic(() => import("@/components/budget/BudgetWizard").then((m) => m.BudgetWizard), { ssr: false });
const BudgetCycleSheet = dynamic(() => import("@/components/budget/BudgetCycleSheet").then((m) => m.BudgetCycleSheet), { ssr: false });

const STATUS_ORDER: Record<PaceStatus, number> = { over: 0, warning: 1, safe: 2 };
const LIQUID = ["bank", "ewallet", "cash"];
type Filter = "all" | "over" | "safe";
const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

export default function AnggaranPage() {
  const { dispatch } = useApp();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const accounts = useAccounts();
  const recurringRules = useRecurringRules();
  const preferences = usePreferences();
  const { showToast } = useToast();
  const cycleDay = preferences.budgetCycleDay ?? 1;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const now = useMemo(() => new Date(), []);
  const cycle = useMemo(() => cycleFor(now, cycleDay), [now, cycleDay]);
  const dayOfCycle = daysBetween(cycle.start, now) + 1;

  const accountName = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);
  const rows = useMemo(() => activeBudgetPaces(budgets, transactions, { now, cycleDay })
    .map(({ budget, pace }) => ({
      budget,
      pace,
      status: paceStatus(pace),
      category: categories.find((category) => category.id === budget.categoryId),
      sources: (budget.accountIds ?? []).map((id) => accountName.get(id)).filter((name): name is string => Boolean(name)),
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]), [budgets, transactions, now, cycleDay, categories, accountName]);
  const scheduled = useMemo(() => scheduledBudgets(budgets, cycle, cycleDay), [budgets, cycle, cycleDay]);

  const totalLimit = rows.reduce((sum, row) => sum + row.pace.monthLimit, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.pace.monthSpent, 0);
  const remaining = rows.reduce((sum, row) => sum + Math.max(0, row.pace.monthLimit - row.pace.monthSpent), 0);
  const aheadBy = rows.reduce((sum, row) => sum + row.pace.aheadBy, 0);
  const todayAvailable = rows.reduce((sum, row) => sum + row.pace.todayAvailable, 0);

  const liquidAccounts = accounts.filter((account) => account.isActive && LIQUID.includes(account.type));
  const balance = liquidAccounts.reduce((sum, account) => sum + account.balance, 0);
  const cycleEndTime = new Date(cycle.end.getFullYear(), cycle.end.getMonth(), cycle.end.getDate(), 23, 59, 59);
  const bills = recurringRules
    .filter((rule) => rule.isActive && rule.type === "expense")
    .filter((rule) => { const next = new Date(rule.nextOccurrence); return next >= now && next <= cycleEndTime; })
    .sort((a, b) => new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime());
  const billsTotal = bills.reduce((sum, rule) => sum + rule.amount, 0);
  const unallocated = balance - remaining - billsTotal;

  const overRows = rows.filter((row) => row.status === "over");
  const donor = rows.filter((row) => row.status === "safe").sort((a, b) => (b.pace.monthLimit - b.pace.monthSpent) - (a.pace.monthLimit - a.pace.monthSpent))[0];
  const visibleRows = rows.filter((row) => filter === "all" || (filter === "over" ? row.status === "over" : row.status !== "over"));

  function openCreate() {
    setEditing(null);
    setWizardOpen(true);
  }
  function openEdit(budget: Budget) {
    setEditing(budget);
    setWizardOpen(true);
  }

  React.useEffect(() => {
    if (!deleteId) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setDeleteId(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteId]);

  async function handleDelete(id: string) {
    const budget = budgets.find((item) => item.id === id);
    const name = categories.find((category) => category.id === budget?.categoryId)?.name ?? "";
    const result = await deleteBudgetAction(id);
    if (!result.success) {
      showToast({ type: "error", title: "Anggaran gagal dihapus", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_BUDGET", payload: id });
    setDeleteId(null);
    showToast({ type: "info", title: "Anggaran dihapus", message: `Anggaran ${name} telah dihapus.` });
  }

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "Semua", count: rows.length },
    { value: "over", label: "Lewat", count: overRows.length },
    { value: "safe", label: "Aman", count: rows.length - overRows.length },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="page-title">Anggaran</h1>
          <button
            type="button"
            onClick={() => setCycleOpen(true)}
            className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-sm bg-brand-950 px-3 text-sm font-bold text-white"
            aria-haspopup="dialog"
          >
            <CalendarRange className="h-4 w-4" />
            {cycleDay === 1 ? "Bulanan" : "Siklus gajian"} · {formatCycleRange(cycle)}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <Button variant="primary" onClick={openCreate} className="shrink-0" aria-label="Tambah anggaran">
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Anggaran baru</span>
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Hero: satu angka utama, warna solid. */}
        <section className="rounded-panel bg-brand-700 p-5 text-white sm:p-6">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/80">Aman dibelanjakan hari ini</p>
              <p className="figure-display mt-1.5 text-[clamp(2.1rem,7vw,3rem)] leading-none">{formatRupiah(todayAvailable)}</p>
              <p className="mt-2 text-sm text-white/80">dari {rows.length} anggaran aktif</p>
            </div>
            <CycleRing day={dayOfCycle} days={cycle.days} />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-white/80">Terpakai siklus ini</dt>
              <dd className="mt-0.5 truncate text-lg font-bold tabular-nums">{formatRupiah(totalSpent)}</dd>
              <dd className={cn("text-xs font-semibold", aheadBy >= 0 ? "text-lime" : "text-[#FFC2C6]")}>{aheadBy >= 0 ? `${formatRupiah(aheadBy)} di bawah jadwal` : `${formatRupiah(Math.abs(aheadBy))} di atas jadwal`}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-white/80">Sisa jatah</dt>
              <dd className="mt-0.5 truncate text-lg font-bold tabular-nums">{formatRupiah(Math.max(0, totalLimit - totalSpent))}</dd>
              <dd className="text-xs font-semibold text-white/80">dari {formatRupiah(totalLimit)}</dd>
            </div>
          </dl>
        </section>

        <MoneyFlow balance={balance} remaining={remaining} billsTotal={billsTotal} unallocated={unallocated} sourceNames={liquidAccounts.map((account) => account.name)} bills={bills.slice(0, 3).map((rule) => ({ id: rule.id, label: rule.note || categories.find((category) => category.id === rule.categoryId)?.name || "Tagihan berulang", date: new Date(rule.nextOccurrence), amount: rule.amount }))} />
      </div>

      {overRows.length > 0 ? (
        <section role="alert" className="flex flex-wrap items-start gap-3 rounded-card bg-ember-ink p-4 text-white">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-[1_1_16rem]">
            <p className="font-bold">{overRows.map((row) => row.category?.name).filter(Boolean).join(", ")} lewat jatah</p>
            <p className="mt-0.5 text-sm text-white/85">
              {donor ? <>{donor.category?.name} masih sisa {formatRupiah(donor.pace.monthLimit - donor.pace.monthSpent)} siklus ini. </> : null}
              Kelebihan akan mengurangi jatah berikutnya bila sisa jatah terbawa.
            </p>
          </div>
          <button type="button" onClick={() => openEdit(overRows[0].budget)} className="inline-flex min-h-10 items-center rounded-sm bg-white px-3.5 text-sm font-bold text-[#B4232A]">
            Atur ulang jatah
          </button>
        </section>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-card border border-rule bg-surface-high px-6 py-14 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface-soft text-ink-muted"><PieChart size={24} strokeWidth={1.5} /></div>
          <p className="text-body font-semibold text-ink">Belum ada anggaran aktif</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">Mulai dari jatah harian makan, jatah mingguan bensin, atau self reward — berlaku mulai hari ini dan lanjut otomatis tiap siklus.</p>
          <Button className="mt-4" onClick={openCreate}><Plus size={16} />Buat anggaran pertama</Button>
        </div>
      ) : (
        <section aria-labelledby="budget-list-title" className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="budget-list-title" className="flex-1 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Anggaran aktif</h2>
            <div className="flex gap-1 rounded-sm bg-surface-soft p-1" role="radiogroup" aria-label="Saring anggaran">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn("min-h-10 rounded-xs px-3.5 text-sm font-bold tabular-nums transition", filter === option.value ? "bg-brand-950 text-white" : "text-ink-muted hover:text-ink")}
                >
                  {option.label} · {option.count}
                </button>
              ))}
            </div>
          </div>

          {visibleRows.length === 0 ? (
            <p className="rounded-card border border-rule bg-surface-high px-4 py-8 text-center text-sm text-ink-muted">Tidak ada anggaran di filter ini.</p>
          ) : (
            <>
              <div className="stagger-children grid gap-3 md:grid-cols-2 lg:hidden">
                {visibleRows.map((row) => (
                  <BudgetPaceCard
                    key={row.budget.id}
                    name={row.category?.name ?? "Kategori"}
                    icon={row.category?.icon}
                    color={row.category?.color}
                    pace={row.pace}
                    sources={row.sources}
                    onEdit={() => openEdit(row.budget)}
                    onDelete={() => setDeleteId(row.budget.id)}
                  />
                ))}
              </div>
              <p className="text-xs text-ink-muted lg:hidden">Di layar sentuh, geser kartu ke kiri untuk Ubah atau Hapus.</p>
              <BudgetTable rows={visibleRows} onEdit={openEdit} onDelete={setDeleteId} />
            </>
          )}
        </section>
      )}

      {scheduled.length > 0 ? (
        <section aria-labelledby="scheduled-title" className="rounded-card border border-rule bg-surface-high p-4">
          <h2 id="scheduled-title" className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Dijadwalkan</h2>
          <ul className="mt-2 divide-y divide-rule">
            {scheduled.map((budget) => {
              const category = categories.find((item) => item.id === budget.categoryId);
              return (
                <li key={budget.id} className="flex min-h-14 items-center gap-3">
                  <CategoryIcon icon={category?.icon} color={category?.color} size={14} containerSize="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{category?.name}</span>
                  <span className="text-sm font-semibold text-ink-muted">Mulai {shortDate.format(budgetStart(budget, cycleDay))}</span>
                  <button type="button" onClick={() => openEdit(budget)} aria-label={`Ubah anggaran ${category?.name ?? ""}`} className="grid h-10 w-10 place-items-center rounded-sm text-ink-muted hover:bg-surface-soft"><Pencil className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {wizardOpen ? <BudgetWizard open onClose={() => setWizardOpen(false)} editing={editing} /> : null}
      {cycleOpen ? <BudgetCycleSheet open onClose={() => setCycleOpen(false)} /> : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-[3px] animate-in fade-in" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-budget-title" className="w-full max-w-sm rounded-panel border border-rule bg-surface-high p-6 shadow-float">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-ember-ink text-white"><Trash2 size={20} /></div>
            <h3 id="delete-budget-title" className="text-heading font-semibold text-ink">Hapus anggaran?</h3>
            <p className="mb-5 mt-1.5 text-sm leading-relaxed text-ink-muted">Jatah kategori ini tidak dipantau lagi mulai sekarang dan di siklus berikutnya. Transaksinya tetap tersimpan.</p>
            <div className="flex gap-2.5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button className="flex-1 bg-ember-ink hover:bg-ember" onClick={() => handleDelete(deleteId)}>Ya, hapus</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CycleRing({ day, days }: { day: number; days: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, day / days);
  return (
    <div className="relative h-[96px] w-[96px] shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`Hari ke-${day} dari ${days} hari siklus`}>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="9" />
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-lime)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} transform="rotate(-90 48 48)" />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none tabular-nums">{Math.max(0, days - day)}</span>
        <span className="mt-0.5 text-[11px] font-semibold text-white/85">hari lagi</span>
      </span>
    </div>
  );
}

function MoneyFlow({ balance, remaining, billsTotal, unallocated, sourceNames, bills }: {
  balance: number;
  remaining: number;
  billsTotal: number;
  unallocated: number;
  sourceNames: string[];
  bills: { id: string; label: string; date: Date; amount: number }[];
}) {
  const short = unallocated < 0;
  const total = Math.max(1, remaining + billsTotal + Math.max(0, unallocated));
  const segments = [
    { label: "Sisa jatah anggaran", value: remaining, color: "bg-brand-700" },
    { label: "Tagihan dicadangkan", value: billsTotal, color: "bg-warning" },
    { label: short ? "Kurang" : "Belum dialokasikan", value: Math.abs(unallocated), color: short ? "bg-ember" : "bg-mint" },
  ];
  return (
    <section aria-labelledby="money-flow-title" className="rounded-panel border border-rule bg-surface-high p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id="money-flow-title" className="text-base font-bold text-ink">Ke mana uangmu</h2>
        <p className="truncate text-xs font-semibold text-ink-muted">{sourceNames.join(" · ") || "Belum ada rekening"}</p>
      </div>
      <p className="figure-display mt-1 text-[1.75rem] leading-tight text-ink">{formatRupiah(balance)}</p>
      <div className="mt-3 flex h-4 gap-[3px] overflow-hidden rounded-[6px]" role="img" aria-label={segments.map((segment) => `${segment.label} ${formatRupiah(segment.value)}`).join(", ")}>
        {segments.map((segment) => segment.value > 0 && !(short && segment.color === "bg-ember") ? (
          <span key={segment.label} className={segment.color} style={{ flexGrow: segment.value / total }} />
        ) : null)}
      </div>
      <dl className="mt-3 divide-y divide-rule">
        {segments.map((segment) => (
          <div key={segment.label} className="flex min-h-10 items-center gap-2.5">
            <span aria-hidden className={cn("h-3 w-3 shrink-0 rounded-[4px]", segment.color)} />
            <dt className="flex-1 text-sm font-medium text-ink">{segment.label}</dt>
            <dd className={cn("text-sm font-bold tabular-nums", segment.color === "bg-mint" ? "text-mint-ink" : segment.color === "bg-ember" ? "text-ember-ink" : "text-ink")}>
              {segment.color === "bg-ember" ? "−" : ""}{formatRupiah(segment.value)}
            </dd>
          </div>
        ))}
      </dl>
      {short ? (
        <p className="mt-3 rounded-sm bg-ember-ink px-3.5 py-2.5 text-sm font-semibold text-white">Saldo rekening kurang {formatRupiah(Math.abs(unallocated))} untuk menutup sisa jatah dan tagihan siklus ini.</p>
      ) : null}
      {bills.length > 0 ? (
        <div className="mt-3 border-t border-rule pt-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Tagihan berikutnya</p>
          <ul className="mt-1">
            {bills.map((bill) => (
              <li key={bill.id} className="flex min-h-9 items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink">{bill.label} · {shortDate.format(bill.date)}</span>
                <span className="font-bold tabular-nums text-ink">{formatRupiah(bill.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

type Row = {
  budget: Budget;
  pace: ReturnType<typeof activeBudgetPaces>[number]["pace"];
  status: PaceStatus;
  category?: { name: string; icon?: string; color?: string };
  sources: string[];
};

function BudgetTable({ rows, onEdit, onDelete }: { rows: Row[]; onEdit: (budget: Budget) => void; onDelete: (id: string) => void }) {
  return (
    <div className="hidden overflow-hidden rounded-panel border border-rule bg-surface-high lg:block">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule text-left text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
            <th scope="col" className="px-5 py-3 font-bold">Anggaran</th>
            <th scope="col" className="px-3 py-3 font-bold">Sumber dana</th>
            <th scope="col" className="w-[30%] px-3 py-3 font-bold">Terpakai siklus ini</th>
            <th scope="col" className="px-3 py-3 text-right font-bold">Aman/hari</th>
            <th scope="col" className="px-3 py-3 font-bold">Status</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const style = STATUS_STYLE[row.status];
            const fresh = isNewThisCycle(row.pace);
            const pct = row.pace.monthLimit > 0 ? Math.min(100, (row.pace.monthSpent / row.pace.monthLimit) * 100) : 0;
            const schedulePct = row.pace.monthLimit > 0 ? Math.min(100, (row.pace.allowanceToDate / row.pace.monthLimit) * 100) : 0;
            const labels = CADENCE_LABEL[row.pace.cadence];
            return (
              <tr key={row.budget.id} className="border-b border-rule last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon={row.category?.icon} color={row.category?.color} size={16} containerSize="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-ink">{row.category?.name ?? "Kategori"}</p>
                      <p className="truncate text-xs text-ink-muted">{labels.adjective} · {formatRupiah(row.pace.cadenceAmount)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-ink-muted">{row.sources.length ? row.sources.join(", ") : "Semua rekening"}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn("font-bold tabular-nums", row.status === "over" ? "text-ember-ink" : "text-ink")}>{formatRupiah(row.pace.monthSpent)}</span>
                    <span className="text-xs tabular-nums text-ink-muted">dari {formatRupiah(row.pace.monthLimit)}</span>
                  </div>
                  <div className="relative mt-1.5 h-2 rounded-full bg-surface-soft">
                    <div className={cn("h-full rounded-full", row.pace.monthSpent > row.pace.monthLimit ? "bg-ember" : "bg-brand-600")} style={{ width: `${pct}%` }} />
                    <span className="absolute -top-1 h-4 w-[3px] rounded-full bg-ink" style={{ left: `calc(${schedulePct}% - 1px)` }} title="Target hari ini" />
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-muted" title={allowanceExplanation(row.pace)}>{allowanceExplanation(row.pace)}</p>
                </td>
                <td className="px-3 py-3.5 text-right font-bold tabular-nums text-ink">{formatRupiah(row.pace.perDayLeft)}</td>
                <td className="px-3 py-3.5">
                  <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-[8px] px-2.5 py-1 text-xs font-bold", fresh && row.status === "safe" ? "bg-brand-950 text-white" : style.badge)}>
                    {fresh && row.status === "safe" ? `Baru · ${shortDate.format(row.pace.effectiveStart)}` : row.status === "over" && row.pace.unitRemaining < 0 ? `Lewat ${formatRupiah(Math.abs(row.pace.unitRemaining))}` : style.label}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => onEdit(row.budget)} aria-label={`Ubah anggaran ${row.category?.name ?? ""}`} className="grid h-10 w-10 place-items-center rounded-sm text-ink-muted hover:bg-surface-soft hover:text-ink"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => onDelete(row.budget.id)} aria-label={`Hapus anggaran ${row.category?.name ?? ""}`} className="grid h-10 w-10 place-items-center rounded-sm text-ink-muted hover:bg-ember-10 hover:text-ember-ink"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
