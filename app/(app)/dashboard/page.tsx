"use client";


import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
  HandCoins,
} from "lucide-react";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { AccountBalanceChart } from "@/components/charts/AccountBalanceChart";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { SummarySparkline } from "@/components/dashboard/SummarySparkline";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { InsightFeed } from "@/components/dashboard/InsightFeed";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import {
  useAccounts,
  useBudgets,
  useCategories,
  useGoals,
  useInsights,
  useTransactions,
  useDebts,
} from "@/lib/data/store";
import type { Transaction } from "@/lib/data/mock";

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
  const transactions = useTransactions();
  const budgets = useBudgets();
  const goals = useGoals();
  const insights = useInsights();
  const accounts = useAccounts();
  const categories = useCategories();
  const debts = useDebts();

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentPeriod = now.toISOString().slice(0, 7);
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

  const budgetsWithSpent = budgets
    .filter((budget) => budget.period === currentPeriod)
    .map((budget) => {
      const category = categories.find((item) => item.id === budget.categoryId);
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.recordKind !== "balance_adjustment" &&
            transaction.categoryId === budget.categoryId &&
            isSameMonth(new Date(transaction.date), now)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return { ...budget, category, spent };
    });

  const recentTransactions = transactions.slice(0, 5).map((transaction) => ({
    ...transaction,
    account: accounts.find((account) => account.id === transaction.accountId),
    category: categories.find((category) => category.id === transaction.categoryId),
  }));

  return (
    <div className="dashboard-modern space-y-5 font-ui sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Pusat kendali keuangan</p>
          <h1 className="page-title mt-1">Halo, selamat datang kembali.</h1>
          <p className="page-subtitle">
            Ringkasan kondisi finansialmu untuk <strong className="text-ink">{currentMonth}</strong>.
          </p>
        </div>
        <Link href="/insight" className="material-button secondary self-start text-small">
          <Sparkles size={16} className="text-pine" />
          Lihat rekomendasi
        </Link>
      </header>

      <DashboardLayout>
      <section data-widget-id="summary" className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <article className="relative overflow-hidden rounded-[1.75rem] border border-pine/15 bg-[linear-gradient(135deg,#EFECFF_0%,#EAF3FF_48%,#E5F8F1_100%)] p-5 text-ink shadow-card sm:p-7 lg:col-span-6 lg:h-full">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pine/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-pine ring-1 ring-pine/15">
                <WalletCards size={21} />
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-extrabold text-pine ring-1 ring-pine/15">
                {accounts.length} akun aktif
              </span>
            </div>
            <p className="mt-8 text-small font-semibold text-ink-muted">Total saldo tersedia</p>
            <p className="mt-1 font-ui tabular-nums tracking-[-0.035em] text-[clamp(1.9rem,4vw,3.25rem)] font-medium tracking-[-0.06em]">
              {formatRupiah(totalBalance)}
            </p>
            <SummarySparkline values={balanceTrend} className="mt-5 text-pine" />
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-pine/10 pt-4">
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-ink-muted ring-1 ring-pine/10">
                Arus kas <strong className="ml-1 text-pine">{net >= 0 ? "+" : ""}{formatRupiah(net)}</strong>
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-ink-muted ring-1 ring-pine/10">
                Rasio tabungan <strong className="ml-1 text-pine">{savingsRate.toFixed(1)}%</strong>
              </span>
            </div>
          </div>
        </article>

        <article className="card flex h-full flex-col justify-between border-mint/15 bg-[linear-gradient(145deg,#F8FFFC,#E5F8F1)] lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-white shadow-card">
              <TrendingUp size={19} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-mint">
              <ArrowUpRight size={14} /> {incomeDelta >= 0 ? "+" : ""}{incomeDelta.toFixed(1)}%
            </span>
          </div>
          <SummarySparkline values={incomeTrend} className="mt-5 h-24 text-mint" />
          <div className="mt-2">
            <p className="text-small font-semibold text-ink-muted">Pemasukan bulan ini</p>
            <p className="mt-2 font-ui tabular-nums tracking-[-0.035em] text-data-l font-medium text-ink">{formatRupiah(thisMonth.income)}</p>
            <p className="mt-1 text-xs text-ink-muted">dibanding bulan lalu</p>
          </div>
        </article>

        <article className="card flex h-full flex-col justify-between border-ember/15 bg-[linear-gradient(145deg,#FFF9FA,#FFF0F1)] lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember text-white shadow-card">
              <TrendingDown size={19} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-ember">
              {expenseDelta >= 0 ? "+" : ""}{expenseDelta.toFixed(1)}%
            </span>
          </div>
          <SummarySparkline values={expenseTrend} className="mt-5 h-24 text-ember" />
          <div className="mt-2">
            <p className="text-small font-semibold text-ink-muted">Pengeluaran bulan ini</p>
            <p className="mt-2 font-ui tabular-nums tracking-[-0.035em] text-data-l font-medium text-ink">{formatRupiah(thisMonth.expense)}</p>
            <p className="mt-1 text-xs text-ink-muted">dibanding bulan lalu</p>
          </div>
        </article>
      </section>

      <section data-widget-id="cashflow" className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <article className="card min-w-0 border-sky/15 bg-[linear-gradient(145deg,#FFFFFF,#F3F8FF)] lg:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Analitik</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Arus kas enam bulan</h2>
            </div>
            <Link href="/arus-kas" className="flex items-center gap-1 text-xs font-bold text-pine hover:underline">
              Detail <ArrowRight size={14} />
            </Link>
          </div>
          <CashFlowChart data={cashFlow} />
        </article>

        <article className="card min-w-0 border-brass/15 bg-[linear-gradient(145deg,#FFFFFF,#FFF8E8)] lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Komposisi</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Pengeluaran</h2>
            </div>
            <Link href="/anggaran" className="text-xs font-bold text-pine hover:underline">Kelola</Link>
          </div>
          <CategoryBreakdownChart data={breakdown} />
        </article>
      </section>

      <section data-widget-id="accounts" className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <div className="h-full lg:col-span-5">
          <DashboardCalendar transactions={transactions} />
        </div>
        <article className="card h-full min-w-0 border-mint/15 bg-[linear-gradient(145deg,#FFFFFF,#F0FBF7)] lg:col-span-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Distribusi dana</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-ink">Saldo per rekening</h2>
              <p className="mt-1 text-xs font-medium text-ink-muted">Perbandingan dana likuid dan investasi aktif.</p>
            </div>
            <span className="rounded-full bg-sky-10 px-3 py-1.5 text-[11px] font-bold text-sky">{accounts.length} rekening</span>
          </div>
          <AccountBalanceChart data={accountBalanceData} />
        </article>
      </section>

      <section data-widget-id="activity" className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <article className="card flex h-full flex-col border-sky/15 bg-[linear-gradient(145deg,#FFFFFF,#F6F9FF)] lg:col-span-7">
          <div className="mb-2 flex items-center justify-between border-b border-rule pb-4">
            <div>
              <p className="eyebrow">Aktivitas terbaru</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Transaksi terkini</h2>
            </div>
            <Link href="/transaksi" className="flex items-center gap-1 text-xs font-bold text-pine hover:underline">
              Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-rule/80">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-1 items-center justify-between gap-3 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryIcon
                    icon={transaction.category?.icon}
                    color={transaction.category?.color}
                    size={15}
                    containerSize="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-body font-bold text-ink">
                      {transaction.note || transaction.category?.name || "Transfer dana"}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {transaction.account?.name || "Akun"} · {formatDate(transaction.date, "time")}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 font-ui tabular-nums tracking-[-0.035em] text-small font-medium ${
                  transaction.type === "income" ? "text-mint" : "text-ink"
                }`}>
                  {transaction.type === "income" ? "+" : "−"}{formatRupiah(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <div className="grid h-full gap-4 lg:col-span-5 lg:grid-rows-[auto_1fr]">
          <article className="card border-brass/15 bg-[linear-gradient(145deg,#FFFFFF,#FFF8E8)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="eyebrow">Kontrol</p>
                <h2 className="mt-1 text-heading font-bold text-ink">Anggaran utama</h2>
              </div>
              <Link href="/anggaran" className="text-xs font-bold text-pine hover:underline">Atur</Link>
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
                />
              ))}
            </div>
          </article>

          <article className="card h-full border-pine/15 bg-[linear-gradient(145deg,#FFFFFF,#F7F4FF)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Target</p>
                <h2 className="mt-1 text-heading font-bold text-ink">Tujuan terdekat</h2>
              </div>
              <Link href="/tujuan" className="text-xs font-bold text-pine hover:underline">Semua</Link>
            </div>
            {goals.slice(0, 1).map((goal) => (
              <GoalCard key={goal.id} {...goal} monthlySavings={1_200_000} />
            ))}
          </article>
        </div>
      </section>

      <section data-widget-id="debts" className="grid gap-4 sm:grid-cols-2">
        <article className="card border-ember/15 bg-[linear-gradient(145deg,#FFF8F8,#FFECEF)]"><div className="flex items-center justify-between"><div><p className="eyebrow text-ember">Utang aktif</p><p className="mt-2 text-2xl font-black text-ink">{formatRupiah(debts.filter((item) => item.status === "open" && item.direction === "payable").reduce((sum, item) => sum + item.remainingAmount, 0))}</p><Link href="/utang" className="mt-2 inline-flex text-xs font-bold text-ember hover:underline">Kelola utang <ArrowRight className="ml-1 h-4 w-4" /></Link></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-ember-10 text-ember"><HandCoins /></div></div></article>
        <article className="card border-mint/15 bg-[linear-gradient(145deg,#F7FFFC,#E6F8F2)]"><div className="flex items-center justify-between"><div><p className="eyebrow text-mint">Piutang aktif</p><p className="mt-2 text-2xl font-black text-ink">{formatRupiah(debts.filter((item) => item.status === "open" && item.direction === "receivable").reduce((sum, item) => sum + item.remainingAmount, 0))}</p><Link href="/utang" className="mt-2 inline-flex text-xs font-bold text-mint hover:underline">Lihat piutang <ArrowRight className="ml-1 h-4 w-4" /></Link></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-10 text-mint"><WalletCards /></div></div></article>
      </section>

      <section data-widget-id="insights" className="card border-mint/15 bg-[linear-gradient(145deg,#FFFFFF,#F2FCF8)]">
        <div className="mb-4 flex items-center justify-between border-b border-rule pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pine-10 text-pine">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="eyebrow">Pundi Insight</p>
              <h2 className="mt-1 text-heading font-bold text-ink">Rekomendasi yang bisa dilakukan</h2>
            </div>
          </div>
          <Link href="/insight" className="hidden items-center gap-1 text-xs font-bold text-pine hover:underline sm:flex">
            Semua insight <ArrowRight size={14} />
          </Link>
        </div>
        <InsightFeed insights={insights.slice(0, 3)} compact />
      </section>
      </DashboardLayout>
    </div>
  );
}
