"use client";

/**
 * app/(app)/arus-kas/page.tsx
 * Laporan arus kas: grafik tren 6 bulan (Ledger Baseline) + ringkasan detail per bulan
 * dengan CategoryIcon, savings rate gauge, dan toast feedback.
 */

import React, { useState } from "react";
import { CashFlowChart }          from "@/components/charts/CashFlowChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { formatRupiah, formatDate } from "@/lib/utils/formatter";
import { getCashFlowData, getCategoryBreakdown, getMonthlySummary } from "@/lib/data/mock";
import { useToast } from "@/lib/context/ToastContext";
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownLeft, Sparkles, PieChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MONTHS = [
  { label: "Agustus 2026",  period: "2026-08", monthsAgo: 0 },
  { label: "Juli 2026",     period: "2026-07", monthsAgo: 1 },
  { label: "Juni 2026",     period: "2026-06", monthsAgo: 2 },
  { label: "Mei 2026",      period: "2026-05", monthsAgo: 3 },
  { label: "April 2026",    period: "2026-04", monthsAgo: 4 },
  { label: "Maret 2026",    period: "2026-03", monthsAgo: 5 },
];

export default function ArusKasPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { showToast } = useToast();

  const cashFlow    = getCashFlowData();
  const selected    = MONTHS[selectedIdx];
  const breakdown   = getCategoryBreakdown(selected.period);
  const summary     = getMonthlySummary(selected.monthsAgo);
  const prevSummary = getMonthlySummary(selected.monthsAgo + 1);
  const netFlow     = summary.income - summary.expense;

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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-display-l font-semibold tracking-tight leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Analisis Arus Kas
        </h1>
        <p className="text-xs sm:text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
          Visualisasi tren pemasukan vs pengeluaran dan rasio tabungan
        </p>
      </div>

      {/* Main Cash Flow Chart Card with Ledger Baseline */}
      <div className="card p-4 sm:p-5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
              Tren Arus Kas (Maret – Agustus 2026)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pine" /> Masuk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ember" /> Keluar
            </span>
          </div>
        </div>

        <CashFlowChart data={cashFlow} />
      </div>

      {/* Month Selector Tabs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 font-ui">
          Pilih Bulan Analisis Mendalam
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 touch-pan-x">
          {MONTHS.map((m, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button
                key={m.period}
                onClick={() => handleSelectMonth(i)}
                className={cn(
                  "flex-shrink-0 px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-card text-xs xs:text-small font-semibold border transition-all active:scale-95 shadow-2xs",
                  isSelected ? "shadow-sm" : "hover:text-ink hover:bg-paper"
                )}
                style={{
                  backgroundColor: isSelected ? "var(--color-pine)" : "var(--color-surface)",
                  color: isSelected ? "#FFFFFF" : "var(--color-ink)",
                  borderColor: isSelected ? "var(--color-pine)" : "var(--color-rule)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Detail Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Summary Metrics Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Net Cash Flow Highlight Card */}
          <div
            className="card p-4 transition-all"
            style={{
              borderColor: netFlow >= 0 ? "var(--color-pine-30)" : "var(--color-ember-30)",
              backgroundColor: "var(--color-surface)"
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Arus Kas Bersih (Net Cash Flow)
            </p>
            <div className="flex items-center gap-2">
              {netFlow >= 0
                ? <TrendingUp size={22} className="flex-shrink-0" style={{ color: "var(--color-pine)" }} />
                : <TrendingDown size={22} className="flex-shrink-0" style={{ color: "var(--color-ember)" }} />}
              <span
                className="tabular-nums font-mono font-bold text-2xl xs:text-3xl sm:text-display-l truncate"
                style={{ color: netFlow >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}
              >
                {netFlow >= 0 ? "+" : "−"}{formatRupiah(Math.abs(netFlow))}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1.5 font-ui leading-relaxed">
              {netFlow >= 0 ? "Surplus kas bulan ini dapat dialokasikan ke tujuan tabungan." : "Defisit kas bulan ini. Tinjau kembali pengeluaran terbesar."}
            </p>
          </div>

          {/* Income & Expense Row */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div className="card p-3.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Pemasukan</span>
                <span className="text-xs font-mono font-semibold text-pine">
                  {incomeDelta >= 0 ? "▲" : "▼"} {Math.abs(incomeDelta).toFixed(1)}%
                </span>
              </div>
              <p className="tabular-nums font-mono font-bold text-heading text-pine truncate">
                {formatRupiah(summary.income)}
              </p>
            </div>

            <div className="card p-3.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Pengeluaran</span>
                <span className="text-xs font-mono font-semibold" style={{ color: expenseDelta <= 0 ? "var(--color-pine)" : "var(--color-ember)" }}>
                  {expenseDelta >= 0 ? "▲" : "▼"} {Math.abs(expenseDelta).toFixed(1)}%
                </span>
              </div>
              <p className="tabular-nums font-mono font-bold text-heading text-ember truncate">
                {formatRupiah(summary.expense)}
              </p>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div className="card p-4 space-y-1.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
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
        <div className="lg:col-span-3 card p-4 sm:p-5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rule">
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
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
