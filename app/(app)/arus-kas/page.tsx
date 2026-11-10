"use client";

/**
 * app/(app)/arus-kas/page.tsx
 * Laporan arus kas: grafik tren 6 bulan (Ledger Baseline) + ringkasan detail per bulan
 * dengan CategoryIcon, savings rate gauge, dan toast feedback.
 */

import React, { useMemo, useState } from "react";
import { CashFlowChart, CategoryBreakdownChart } from "@/components/charts";
import { formatRupiah } from "@/lib/utils/formatter";
import { useCategories, useTransactions } from "@/lib/data/store";
import { useToast } from "@/lib/context/ToastContext";
import { TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "@/components/ui/PageHeader";


const MONTHS = Array.from({ length: 6 }, (_, monthsAgo) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return {
    label: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date),
    period: date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"),
    monthsAgo,
  };
});

export default function ArusKasPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { showToast } = useToast();
  const transactions = useTransactions();
  const categories = useCategories();

  const selected = MONTHS[selectedIdx];
  const monthlySummary = React.useCallback((period: string) => {
    return transactions.reduce((total, transaction) => {
      if (new Date(transaction.date).toISOString().slice(0, 7) !== period || transaction.recordKind === "balance_adjustment") return total;
      if (transaction.type === "income") total.income += transaction.amount;
      if (transaction.type === "expense") total.expense += transaction.amount;
      return total;
    }, { income: 0, expense: 0 });
  }, [transactions]);
  const cashFlow = useMemo(() => [...MONTHS].reverse().map((month) => ({
    month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(`${month.period}-01T12:00:00`)),
    ...monthlySummary(month.period),
  })), [monthlySummary]);
  const summary = monthlySummary(selected.period);
  const previousDate = new Date(`${selected.period}-01T12:00:00`);
  previousDate.setMonth(previousDate.getMonth() - 1);
  const prevSummary = monthlySummary(`${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`);
  const breakdown = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const transaction of transactions) {
      if (transaction.type !== "expense" || !transaction.categoryId) continue;
      if (new Date(transaction.date).toISOString().slice(0, 7) !== selected.period) continue;
      grouped.set(transaction.categoryId, (grouped.get(transaction.categoryId) || 0) + transaction.amount);
    }
    return [...grouped.entries()]
      .map(([categoryId, amount]) => {
        const category = categories.find((item) => item.id === categoryId);
        return { name: category?.name || "Lainnya", amount, color: category?.color };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categories, selected.period, transactions]);
  const netFlow = summary.income - summary.expense;

  function delta(current: number, prev: number) {
    if (prev <= 0) return 0;
    return ((current - prev) / prev) * 100;
  }

  const incomeDelta  = delta(summary.income,  prevSummary.income);
  const expenseDelta = delta(summary.expense, prevSummary.expense);
  const savingsRate  = summary.income > 0 ? ((netFlow / summary.income) * 100).toFixed(1) : "0";

  function handleSelectMonth(idx: number) {
    setSelectedIdx(idx);
    showToast({
      type: "info",
      title: `Periode: ${MONTHS[idx].label}`,
      message: `Menampilkan analisis arus kas dan proporsi pengeluaran ${MONTHS[idx].label}.`,
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Arus Kas" description="Tren pemasukan dan pengeluaran, serta rasio tabunganmu." />

      {/* Main Cash Flow Chart Card with Ledger Baseline */}
      <div className="card w-full min-w-0 overflow-hidden p-4 sm:p-5">
        <div className="mb-3">
          <p className="eyebrow">6 bulan terakhir</p>
          <h2 className="mt-0.5 text-base font-semibold text-ink">Tren arus kas</h2>
        </div>

        <CashFlowChart data={cashFlow} />
      </div>

      {/* Month Selector Tabs */}
      <div className="w-full min-w-0 overflow-hidden">
        <p className="eyebrow mb-2">Lihat rincian bulan</p>
        <div className="flex gap-2 overflow-x-auto pb-1 touch-pan-x overscroll-x-contain max-w-full">
          {MONTHS.map((m, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button
                key={m.period}
                onClick={() => handleSelectMonth(i)}
                aria-pressed={isSelected}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors active:scale-95",
                  isSelected ? "border-transparent bg-ink text-paper" : "border-rule bg-surface-high text-ink-muted hover:text-ink",
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Detail Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full min-w-0">
        {/* Left: Summary Metrics Column */}
        <div className="lg:col-span-2 space-y-3 w-full min-w-0">
          {/* Net Cash Flow Highlight Card */}
          <div className={cn("relative overflow-hidden rounded-panel p-5 text-white", netFlow >= 0 ? "hero-surface" : "bg-ember-ink shadow-card")}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
              {netFlow >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />} Arus kas bersih
            </p>
            <p className="figure-display mt-1.5 truncate text-[clamp(2rem,6vw,2.75rem)] leading-none">
              {netFlow >= 0 ? "+" : "−"}{formatRupiah(Math.abs(netFlow))}
            </p>
            <p className="mt-2 text-xs text-white/80">
              {netFlow >= 0 ? "Surplus — bisa dialokasikan ke tujuan tabungan." : "Defisit — tinjau pengeluaran terbesar bulan ini."}
            </p>
          </div>

          {/* Income & Expense Row */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div className="card p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink-muted">Pemasukan</span>
                <span className={cn("text-xs font-semibold tabular-nums", incomeDelta >= 0 ? "text-mint-ink" : "text-ember-ink")}>
                  {incomeDelta >= 0 ? "▲" : "▼"} {Math.abs(incomeDelta).toFixed(1)}%
                </span>
              </div>
              <p className="truncate text-lg font-semibold text-mint-ink tabular-nums">
                {formatRupiah(summary.income)}
              </p>
            </div>

            <div className="card p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink-muted">Pengeluaran</span>
                <span className={cn("text-xs font-semibold tabular-nums", expenseDelta <= 0 ? "text-mint-ink" : "text-ember-ink")}>
                  {expenseDelta >= 0 ? "▲" : "▼"} {Math.abs(expenseDelta).toFixed(1)}%
                </span>
              </div>
              <p className="truncate text-lg font-semibold text-ember-ink tabular-nums">
                {formatRupiah(summary.expense)}
              </p>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div className="card p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Savings Rate</span>
              <span className="text-xs font-mono font-bold text-brass">
                {savingsRate}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-rule shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 bg-brass"
                style={{ width: `${Math.min(Math.max(parseFloat(savingsRate), 0), 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              Rekomendasi finansial ideal: sisihkan minimal 20% dari total pendapatan.
            </p>
          </div>
        </div>

        {/* Right: Category Breakdown Card */}
        <div className="lg:col-span-3 card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rule">
            <h2 className="text-heading font-semibold text-ink">
              Proporsi Pengeluaran ({selected.label})
            </h2>
            <span className="text-xs font-mono text-ink-muted">
              {breakdown.length} kategori
            </span>
          </div>

          {breakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted">
              <PieChart size={24} className="mb-2" />
              <p className="text-small font-medium">Tidak ada data transaksi pengeluaran pada periode ini</p>
            </div>
          ) : (
            <CategoryBreakdownChart data={breakdown} />
          )}
        </div>
      </div>
    </div>
  );
}
