"use client";


import { PenjagaDashboardCard } from "@/components/penjaga/PenjagaDashboardCard";
import Link from "next/link";
import { CashFlowChart, CategoryBreakdownChart, AccountBalanceChart, SpendingMomentumChart } from "@/components/charts/deferred";
import {
  ArrowRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
  HandCoins,
} from "lucide-react";
import { SummarySparkline } from "@/components/dashboard/SummarySparkline";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { activeBudgetPaces, cadenceAmountOf, CADENCE_LABEL } from "@/lib/utils/budgetPace";
import { SafeToSpendCard } from "@/components/dashboard/SafeToSpendCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatAmount, formatDate, formatRupiah } from "@/lib/utils/formatter";
import { computeSafeToSpend } from "@/lib/utils/safeToSpend";
import {
  useAccounts,
  useBudgets,
  useCategories,
  useGoals,
  useInsights,
  useTransactions,
  useDebts,
  usePreferences,
  useBudgetTransfers,
  useRecurringRules,
 useApp } from "@/lib/data/store";
import { deferUntilVisible } from "@/components/ui/deferUntilVisible";

// Bagian di bawah lipatan: kodenya diunduh saat mendekati layar.
function block(height: string) {
  return function SectionSkeleton() {
    return <div className="skeleton w-full rounded-card" style={{ height }} />;
  };
}
const DashboardCalendar = deferUntilVisible(() => import("@/components/dashboard/DashboardCalendar").then((m) => m.DashboardCalendar), { fallback: block("18rem") });
const BudgetProgress = deferUntilVisible(() => import("@/components/dashboard/BudgetProgress").then((m) => m.BudgetProgress), { fallback: block("4.5rem") });
const GoalCard = deferUntilVisible(() => import("@/components/dashboard/GoalCard").then((m) => m.GoalCard), { fallback: block("12rem") });
const RecentTransactionsCard = deferUntilVisible(() => import("@/components/dashboard/ActivityCards").then((m) => m.RecentTransactionsCard), { fallback: block("22rem") });
const UpcomingCard = deferUntilVisible(() => import("@/components/dashboard/ActivityCards").then((m) => m.UpcomingCard), { fallback: block("12rem") });
const InsightFeed = deferUntilVisible(() => import("@/components/dashboard/InsightFeed").then((m) => m.InsightFeed), { fallback: block("10rem") });
import type { Transaction } from "@/lib/data/mock";
import { PageHeader } from "@/components/ui/PageHeader";


function isSameMonth(date: Date, target: Date) {
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
}

function summarize(transactions: Transaction[], target: Date) {
  return transactions.reduce(
    (result, transaction) => {
      if (!isSameMonth(new Date(transaction.date), target) || transaction.recordKind === "balance_adjustment") return result;
      if (transaction.type === "income") result.income += transaction.amount;
      if (transaction.type === "expense") result.expense += transaction.amount;
      return result;
    },
    { income: 0, expense: 0 }
  );
}

export default function DashboardPage() {
  const { connection } = useApp();
  const transactions = useTransactions();
  const budgets = useBudgets();
  const goals = useGoals();
  const insights = useInsights();
  const accounts = useAccounts();
  const categories = useCategories();
  const debts = useDebts();
  const preferences = usePreferences();
  const budgetTransfers = useBudgetTransfers();
  const recurringRules = useRecurringRules();

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const cycleDay = preferences.budgetCycleDay ?? 1;
  const currentMonth = formatDate(now, "month");

  const thisMonth = summarize(transactions, now);
  const lastMonth = summarize(transactions, previousMonth);
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const net = thisMonth.income - thisMonth.expense;
  const savingsRate = thisMonth.income > 0 ? (net / thisMonth.income) * 100 : 0;

  const incomeDelta = lastMonth.income
    ? ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100
    : 0;
  const expenseDelta = lastMonth.expense
    ? ((thisMonth.expense - lastMonth.expense) / lastMonth.expense) * 100
    : 0;

  const cashFlow = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const summary = summarize(transactions, date);
    return {
      month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date),
      income: summary.income,
      expense: summary.expense,
    };
  });

  const balanceTrend = cashFlow.map((item) => item.income - item.expense);
  const incomeTrend = cashFlow.map((item) => item.income);
  const expenseTrend = cashFlow.map((item) => item.expense);
  const accountBalanceData = accounts.map((account) => ({
    name: account.name,
    balance: account.balance,
    color: account.colorTag,
  }));

  const breakdown = categories
    .filter((category) => category.type === "expense")
    .map((category) => ({
      name: category.name,
      color: category.color,
      amount: transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.recordKind !== "balance_adjustment" &&
            transaction.categoryId === category.id &&
            isSameMonth(new Date(transaction.date), now)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const budgetsWithSpent = activeBudgetPaces(budgets, transactions, { now, cycleDay, transfers: budgetTransfers })
    .map(({ budget, pace }) => ({
      ...budget,
      limitAmount: pace.monthLimit,
      category: categories.find((item) => item.id === budget.categoryId),
      spent: pace.monthSpent,
    }));

  const recentTransactions = transactions.slice(0, 5).map((transaction) => ({
    ...transaction,
    account: accounts.find((account) => account.id === transaction.accountId),
    category: categories.find((category) => category.id === transaction.categoryId),
  }));

  const dailySpending = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const amount = transactions
      .filter((transaction) => transaction.type === "expense" && new Date(transaction.date).toDateString() === date.toDateString())
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return {
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
      amount,
    };
  });
  const upcomingWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRules = recurringRules
    .filter((rule) => rule.isActive && new Date(rule.nextOccurrence) <= upcomingWindow)
    .sort((a, b) => new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime())
    .slice(0, 3);
  const openPayable = debts.filter((item) => item.status === "open" && item.direction === "payable").reduce((sum, item) => sum + item.remainingAmount, 0);
  const openReceivable = debts.filter((item) => item.status === "open" && item.direction === "receivable").reduce((sum, item) => sum + item.remainingAmount, 0);
  const cashHealth = Math.max(0, Math.min(100, thisMonth.income ? ((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100 : 0));
  const safeToSpend = computeSafeToSpend(accounts, budgets, transactions, recurringRules, now, cycleDay);

  return (
    <div className="dashboard-modern space-y-5 font-ui sm:space-y-6">
      <PageHeader
        title={connection.userName ? `Halo, ${connection.userName.split(" ")[0]}` : "Halo!"}
        description={<>Ringkasan keuanganmu untuk <strong className="font-semibold text-ink">{currentMonth}</strong>.</>}
        actions={<Link href="/insight" className="inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-rule bg-surface-high px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft" aria-label="Lihat rekomendasi"><Sparkles size={16} className="text-brand-600" /><span className="hidden sm:inline">Rekomendasi</span></Link>}
      />

      <PenjagaDashboardCard />

      <SafeToSpendCard result={safeToSpend} />

      <DashboardLayout>
        <Card variant="highlight" data-widget-id="balance" className="relative h-full overflow-hidden rounded-panel p-5 sm:p-7">
          <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-[34px] border-white/8" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-card">
                <WalletCards size={21} />
              </div>
              <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold text-lime-ink">
                {accounts.length} akun aktif
              </span>
            </div>
            <p className="mt-8 text-small font-semibold text-white/80">Total saldo tersedia</p>
            <p className="figure-display mt-1 text-[clamp(2.1rem,4.5vw,3.5rem)] leading-none">
              {formatAmount(totalBalance, preferences.compactNumbers)}
            </p>
            <SummarySparkline values={balanceTrend} className="mt-5 text-white" />
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/15 pt-4">
              <span className="rounded-full border border-white/15 bg-surface-high px-3 py-1.5 text-xs text-ink-muted shadow-card">
                Arus kas <strong className="ml-1 text-brand-800">{net >= 0 ? "+" : ""}{formatRupiah(net)}</strong>
              </span>
              <span className="rounded-full border border-white/15 bg-brand-900 px-3 py-1.5 text-xs text-white shadow-card">
                Rasio tabungan <strong className="ml-1">{savingsRate.toFixed(1)}%</strong>
              </span>
            </div>
          </div>
        </Card>

        <div data-widget-id="income" className="h-full">
          <SummaryCard title="Pemasukan" amount={thisMonth.income} delta={incomeDelta} deltaLabel="dibanding bulan lalu" icon={TrendingUp} variant="positive" trend={incomeTrend} caption="dibanding bulan lalu" compact={preferences.compactNumbers} />
        </div>

        <div data-widget-id="expense" className="h-full">
          <SummaryCard title="Pengeluaran" amount={thisMonth.expense} delta={expenseDelta} deltaLabel="dibanding bulan lalu" icon={TrendingDown} variant="negative" trend={expenseTrend} caption="dibanding bulan lalu" compact={preferences.compactNumbers} />
        </div>
        <article data-widget-id="cashflow" className="card h-full min-w-0 border-brand-600/10 bg-surface-high">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Analitik</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Arus kas enam bulan</h2>
            </div>
            <Link href="/arus-kas" className="flex items-center gap-1 tap-target text-xs font-bold text-pine hover:underline">
              Detail <ArrowRight size={14} />
            </Link>
          </div>
          <CashFlowChart data={cashFlow} />
        </article>

        <article data-widget-id="composition" className="card h-full min-w-0 border-brand-600/10 bg-surface-high">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Komposisi</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Pengeluaran</h2>
            </div>
            <Link href="/anggaran" className="tap-target text-xs font-bold text-pine hover:underline">Kelola</Link>
          </div>
          <CategoryBreakdownChart data={breakdown} />
        </article>

        <article data-widget-id="rhythm" className="card h-full min-w-0 border-brand-600/10 bg-surface-high">
          <div className="flex items-start justify-between gap-4">
            <div><p className="eyebrow">7 hari terakhir</p><h2 className="mt-1 text-heading font-bold text-ink">Momentum pengeluaran</h2><p className="mt-1 text-xs text-ink-muted">Bar harian dengan garis akumulasi minggu berjalan.</p></div>
            <Badge tone="neutral">Live</Badge>
          </div>
          <div className="mt-4"><SpendingMomentumChart data={dailySpending} /></div>
          <div className="mt-2 flex items-center justify-between border-t border-rule pt-3 text-xs font-semibold text-ink-muted"><span>Total minggu ini</span><strong className="text-brand-900">{formatRupiah(dailySpending.reduce((sum, item) => sum + item.amount, 0))}</strong></div>
        </article>

        <article data-widget-id="health" className="card h-full min-w-0">
          <p className="eyebrow">Kesehatan kas</p>
          <h2 className="mt-1 text-heading font-bold text-ink">Ruang aman bulan ini</h2>
          <div className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-full shadow-clay-soft" style={{ background: `conic-gradient(var(--color-mint-ink) ${cashHealth}%, var(--color-brass) ${cashHealth}% 100%)` }}>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-mint-10 text-center shadow-[inset_3px_3px_9px_rgba(63,82,77,.18)]">
              <div><p className="text-2xl font-black text-mint-ink">{cashHealth.toFixed(0)}%</p><p className="text-[9px] font-extrabold uppercase text-mint-ink">tersisa</p></div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="rounded-xl border border-rule bg-surface-high p-3 text-ember-ink">Utang<br/><span className="text-ink">{formatRupiah(openPayable)}</span></div>
            <div className="rounded-xl border border-rule bg-surface-high p-3 text-mint-ink">Piutang<br/><span className="text-ink">{formatRupiah(openReceivable)}</span></div>
          </div>
        </article>
        <div data-widget-id="calendar" className="h-full">
          <DashboardCalendar transactions={transactions} />
        </div>
        <article data-widget-id="accounts" className="card h-full min-w-0 border-brand-600/10 bg-surface-high">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Distribusi dana</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-ink">Saldo per rekening</h2>
              <p className="mt-1 text-xs font-medium text-ink-muted">Perbandingan dana likuid dan investasi aktif.</p>
            </div>
            <Badge tone="primary">{accounts.length} rekening</Badge>
          </div>
          <AccountBalanceChart data={accountBalanceData} />
        </article>
        <div data-widget-id="recent" className="h-full"><RecentTransactionsCard recentTransactions={recentTransactions} /></div>
        <div data-widget-id="upcoming" className="h-full"><UpcomingCard upcomingRules={upcomingRules} categories={categories} /></div>

          <article data-widget-id="budgets" className="card h-full border-brand-600/10 bg-surface-high">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="eyebrow">Kontrol</p>
                <h2 className="mt-1 text-heading font-bold text-ink">Anggaran utama</h2>
              </div>
              <Link href="/anggaran" className="tap-target text-xs font-bold text-pine hover:underline">Atur</Link>
            </div>
            <div className="space-y-1">
              {budgetsWithSpent.slice(0, 3).map((budget) => (
                <BudgetProgress
                  key={budget.id}
                  categoryName={budget.category?.name ?? "Lainnya"}
                  categoryIcon={budget.category?.icon}
                  categoryColor={budget.category?.color}
                  spent={budget.spent}
                  limit={budget.limitAmount}
                  period={budget.cadence && budget.cadence !== "monthly" ? `Jatah ${formatRupiah(cadenceAmountOf(budget))}${CADENCE_LABEL[budget.cadence].per}` : undefined}
                />
              ))}
            </div>
          </article>

          <article data-widget-id="goals" className="card h-full border-brand-600/10 bg-surface-high">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Target</p>
                <h2 className="mt-1 text-heading font-bold text-ink">Tujuan terdekat</h2>
              </div>
              <Link href="/tujuan" className="tap-target text-xs font-bold text-pine hover:underline">Semua</Link>
            </div>
            {goals.slice(0, 1).map((goal) => (
              <GoalCard key={goal.id} {...goal} monthlySavings={1_200_000} />
            ))}
          </article>
        <article data-widget-id="payable" className="card h-full border-brand-600/10 bg-surface-high"><div className="flex items-center justify-between"><div><p className="eyebrow text-ember-ink">Utang aktif</p><p className="mt-2 text-2xl font-black text-ink">{formatRupiah(openPayable)}</p><Link href="/utang" className="tap-target mt-2 inline-flex text-xs font-bold text-ember-ink hover:underline">Kelola utang <ArrowRight className="ml-1 h-4 w-4" /></Link></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-ember-ink text-white shadow-card"><HandCoins /></div></div></article>
        <article data-widget-id="receivable" className="card h-full border-brand-600/10 bg-surface-high"><div className="flex items-center justify-between"><div><p className="eyebrow text-mint-ink">Piutang aktif</p><p className="mt-2 text-2xl font-black text-ink">{formatRupiah(openReceivable)}</p><Link href="/utang" className="tap-target mt-2 inline-flex text-xs font-bold text-mint-ink hover:underline">Lihat piutang <ArrowRight className="ml-1 h-4 w-4" /></Link></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-ink text-white shadow-card"><WalletCards /></div></div></article>

      <section data-widget-id="insights" className="card h-full border-brand-600/10 bg-surface-high">
        <div className="mb-4 flex items-center justify-between border-b border-rule pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="eyebrow">Pundi Insight</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Rekomendasi yang bisa dilakukan</h2>
            </div>
          </div>
          <Link href="/insight" className="hidden items-center gap-1 tap-target text-xs font-bold text-pine hover:underline sm:flex">
            Semua insight <ArrowRight size={14} />
          </Link>
        </div>
        <InsightFeed insights={insights.slice(0, 3)} compact />
      </section>
      </DashboardLayout>
    </div>
  );
}
