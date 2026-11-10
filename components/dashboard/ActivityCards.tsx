"use client";

/**
 * components/dashboard/ActivityCards.tsx
 * Kartu "Transaksi terkini" dan "Akan datang" di dashboard. Dipisah dari
 * halaman agar baru diunduh saat mendekati layar (di bawah lipatan di ponsel).
 */
import Link from "next/link";
import { ArrowRight, Repeat } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import type { Account, Category, RecurringRule, Transaction } from "@/lib/data/mock";

type RecentItem = Transaction & { account?: Account; category?: Category };

export function RecentTransactionsCard({ recentTransactions }: { recentTransactions: RecentItem[] }) {
  return (
    <article className="card flex h-full flex-col border-brand-600/10 bg-surface-high">
      <div className="mb-2 flex items-center justify-between border-b border-rule pb-4">
        <div>
          <p className="eyebrow">Aktivitas terbaru</p>
          <h2 className="mt-1 text-heading font-bold text-ink">Transaksi terkini</h2>
        </div>
        <Link href="/transaksi" className="flex items-center gap-1 tap-target text-xs font-bold text-pine hover:underline">
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

  );
}

export function UpcomingCard({ upcomingRules, categories }: { upcomingRules: RecurringRule[]; categories: Category[] }) {
  return (
    <article className="card flex h-full flex-col border-brand-600/10 bg-surface-high">
          <div className="mb-2 flex items-center justify-between border-b border-rule pb-4">
            <div>
              <p className="eyebrow">7 hari ke depan</p>
              <h2 className="mt-1 flex items-center gap-2 text-heading font-bold text-ink"><Repeat size={15} className="text-ink-muted" /> Akan datang</h2>
            </div>
            <Link href="/transaksi" className="flex items-center gap-1 tap-target text-xs font-bold text-pine hover:underline">
              Kelola <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingRules.length === 0 ? (
            <p className="flex flex-1 items-center text-xs text-ink-muted">Tidak ada transaksi berulang yang jatuh tempo minggu ini.</p>
          ) : (
            <div className="flex flex-1 flex-col divide-y divide-rule/80">
              {upcomingRules.map((rule) => {
                const category = categories.find((item) => item.id === rule.categoryId);
                return (
                  <div key={rule.id} className="flex flex-1 items-center justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon icon={category?.icon} color={category?.color} size={15} containerSize="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-body font-bold text-ink">{rule.note || category?.name || "Transaksi berulang"}</p>
                        <p className="truncate text-xs text-ink-muted">{formatDate(rule.nextOccurrence, "short")}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 font-ui tabular-nums tracking-[-0.035em] text-small font-medium ${rule.type === "income" ? "text-mint" : "text-ink"}`}>
                      {rule.type === "income" ? "+" : rule.type === "expense" ? "−" : ""}{formatRupiah(rule.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>
  );
}
