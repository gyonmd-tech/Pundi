"use client";

/**
 * app/(app)/dashboard/page.tsx — reactive with AppStore, central mock data,
 * CategoryIcon visual badges, and micro-interactions.
 */

import React from "react";
import { SummaryCard }            from "@/components/dashboard/SummaryCard";
import { BudgetProgress }         from "@/components/dashboard/BudgetProgress";
import { GoalCard }               from "@/components/dashboard/GoalCard";
import { CashFlowChart }          from "@/components/charts/CashFlowChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { InsightFeed }            from "@/components/dashboard/InsightFeed";
import { CategoryIcon }           from "@/components/ui/CategoryIcon";
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import {
  getCashFlowData,
  getCategoryBreakdown,
  getSpentByCategory,
  getMonthlySummary,
} from "@/lib/data/mock";
import {
  useTransactions,
  useBudgets,
  useGoals,
  useInsights,
  useAccounts,
  useCategories,
} from "@/lib/data/store";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const transactions = useTransactions();
  const budgets      = useBudgets();
  const goals        = useGoals();
  const insights     = useInsights();
  const accounts     = useAccounts();
  const categories   = useCategories();

  const cashFlow     = getCashFlowData();
  const breakdown    = getCategoryBreakdown("2026-08");
  const thisMonth    = getMonthlySummary(0);
  const lastMonth    = getMonthlySummary(1);
  const totalBal     = accounts.reduce((s, a) => s + a.balance, 0);
  const currentMonth = formatDate(new Date(), "month");

  const incomeDelta  = lastMonth.income  > 0 ? ((thisMonth.income  - lastMonth.income)  / lastMonth.income)  * 100 : 0;
  const expenseDelta = lastMonth.expense > 0 ? ((thisMonth.expense - lastMonth.expense) / lastMonth.expense) * 100 : 0;

  // Compute budgets with spent
  const budgetsWithSpent = budgets
    .filter((b) => b.period === "2026-08")
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const spent = getSpentByCategory(b.categoryId, "2026-08");
      return { ...b, category: cat, spent };
    });

  // Recent transactions with relations
  const recentTxs = transactions.slice(0, 5).map((tx) => ({
    ...tx,
    account:  accounts.find((a) => a.id === tx.accountId),
    category: categories.find((c) => c.id === tx.categoryId),
  }));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-display-l font-semibold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Ringkasan Finansial
          </h1>
          <p suppressHydrationWarning className="text-xs sm:text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Periode aktif: <strong className="text-ink font-semibold">{currentMonth}</strong>
          </p>
        </div>
      </div>

      {/* Row 1: Summary Cards with count-up animation & delta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <SummaryCard
          title="Total Saldo Kas & Bank"
          amount={totalBal}
          delta={2.1}
          deltaLabel="vs bulan lalu"
          icon={Wallet}
          variant="neutral"
        />
        <SummaryCard
          title="Pemasukan Bulan Ini"
          amount={thisMonth.income}
          delta={incomeDelta}
          deltaLabel="vs bulan lalu"
          icon={TrendingUp}
          variant="positive"
        />
        <SummaryCard
          title="Pengeluaran Bulan Ini"
          amount={thisMonth.expense}
          delta={expenseDelta}
          deltaLabel="vs bulan lalu"
          icon={TrendingDown}
          variant="negative"
        />
      </div>

      {/* Row 2: Charts (Cash Flow with Ledger Baseline + Category Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 w-full min-w-0">
        <div className="lg:col-span-3 card p-4 sm:p-5 hover:border-pine/30 transition-all w-full min-w-0 overflow-hidden" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                Arus Kas 6 Bulan Terakhir
              </h2>
              <p className="text-xs text-ink-muted">Perbandingan pemasukan dan pengeluaran bulanan</p>
            </div>
            <Link
              href="/arus-kas"
              className="flex items-center gap-1 text-xs font-semibold text-pine hover:underline px-2.5 py-1 rounded-card hover:bg-pine-10 transition-colors"
            >
              Detail Analisis <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <CashFlowChart data={cashFlow} />
        </div>

        <div className="lg:col-span-2 card p-4 sm:p-5 hover:border-pine/30 transition-all w-full min-w-0 overflow-hidden" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                Kategori Pengeluaran
              </h2>
              <p className="text-xs text-ink-muted">{currentMonth}</p>
            </div>
            <Link
              href="/anggaran"
              className="text-xs font-semibold text-pine hover:underline px-2 py-1 rounded-card hover:bg-pine-10 transition-colors"
            >
              Kelola
            </Link>
          </div>
          <CategoryBreakdownChart data={breakdown} />
        </div>
      </div>

      {/* Row 3: Transaksi + Budget & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 w-full min-w-0">
        {/* Transaksi terbaru */}
        <div className="lg:col-span-3 card p-4 sm:p-5 hover:border-pine/30 transition-all w-full min-w-0 overflow-hidden" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-rule">
            <div>
              <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                Mutasi Transaksi Terbaru
              </h2>
              <p className="text-xs text-ink-muted">Catatan pemasukan & pengeluaran terkini</p>
            </div>
            <Link
              href="/transaksi"
              className="flex items-center gap-1 text-xs font-semibold text-pine hover:underline px-2.5 py-1 rounded-card hover:bg-pine-10 transition-colors"
            >
              Lihat Semua ({transactions.length}) <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>

          <div className="divide-y divide-rule/60">
            {recentTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 py-3 group hover:bg-paper/80 px-2 rounded-card transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon icon={tx.category?.icon} color={tx.category?.color} size={15} containerSize="sm" />
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink truncate group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                      {tx.note || tx.category?.name || "Transaksi"}
                    </p>
                    <p className="text-xs text-ink-muted truncate font-ui">
                      {tx.category?.name ?? "Transfer"} · <span className="font-mono">{formatDate(tx.date, "time")}</span>
                    </p>
                  </div>
                </div>

                <span
                  className="tabular-nums font-mono font-bold text-body flex-shrink-0"
                  style={{ color: tx.type === "income" ? "var(--color-pine)" : "var(--color-ink)" }}
                >
                  {tx.type === "income" ? "+" : "−"}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget & Goals Column */}
        <div className="lg:col-span-2 space-y-3.5">
          {/* Anggaran Ringkas */}
          <div className="card p-4 sm:p-5 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
              <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                Alokasi Anggaran
              </h2>
              <Link href="/anggaran" className="text-xs font-semibold text-pine hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-1">
              {budgetsWithSpent.slice(0, 3).map((b) => (
                <BudgetProgress
                  key={b.id}
                  categoryName={b.category?.name ?? "Lainnya"}
                  categoryIcon={b.category?.icon}
                  categoryColor={b.category?.color}
                  spent={b.spent}
                  limit={b.limitAmount}
                />
              ))}
            </div>
          </div>

          {/* Tujuan Tabungan Ringkas */}
          <div className="card p-4 sm:p-5 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
              <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                Tujuan Finansial
              </h2>
              <Link href="/tujuan" className="text-xs font-semibold text-pine hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 2).map((g) => (
                <GoalCard key={g.id} {...g} monthlySavings={1_200_000} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Insight Feed Card */}
      <div className="card p-4 sm:p-5 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
              Insight & Rekomendasi Finansial
            </h2>
          </div>
          <Link
            href="/insight"
            className="flex items-center gap-1 text-xs font-semibold text-pine hover:underline px-2.5 py-1 rounded-card hover:bg-pine-10 transition-colors"
          >
            Semua Insight <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <InsightFeed insights={insights.slice(0, 3)} compact />
      </div>
    </div>
  );
}
