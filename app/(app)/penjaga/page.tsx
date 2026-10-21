"use client";

/**
 * app/(app)/penjaga/page.tsx
 * Ruang Penjaga — Hermes Agent sebagai penjaga keuangan. Pengguna cukup
 * bercerita; Penjaga menyusun draft, pengguna meninjau & menyimpan.
 * Pencatatan manual (QuickAdd) tetap tersedia seperti biasa.
 */
import { ChevronDown } from "lucide-react";
import { PenjagaCharacter } from "@/components/penjaga/PenjagaCharacter";
import { PenjagaChat } from "@/components/penjaga/PenjagaChat";
import { DraftReview } from "@/components/penjaga/DraftReview";
import { ConnectHermesCard } from "@/components/penjaga/ConnectHermesCard";
import { usePenjaga } from "@/components/penjaga/PenjagaProvider";
import { useTransactions } from "@/lib/data/store";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";
import type { PenjagaMood } from "@/lib/penjaga/types";

const MOOD_LINES: Record<PenjagaMood, string> = {
  idle: "Halo! Ceritakan harimu, biar aku yang mencatat.",
  thinking: "Sebentar, aku pilah dulu ceritamu…",
  talking: "Ini yang kutemukan…",
  happy: "Tersimpan! Pundimu aman bersamaku.",
  alert: "Ada yang perlu kamu periksa.",
  sleeping: "Aku masih tidur — hubungkan Hermes untuk membangunkanku.",
};

function isToday(date: Date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export default function PenjagaPage() {
  const { mood, status, drafts } = usePenjaga();
  const transactions = useTransactions();
  const spentToday = transactions
    .filter((transaction) => transaction.type === "expense" && transaction.recordKind !== "balance_adjustment" && isToday(new Date(transaction.date)))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const statusLabel = !status ? "Menyiapkan…"
    : status.chat === "ready" ? "Hermes terhubung"
    : status.chat === "demo" ? "Mode latihan"
    : status.chat === "not-owner" ? "Khusus pemilik"
    : "Belum terhubung";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <section className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-brand-600/10 bg-surface-high shadow-card lg:col-span-7">
          <header className="relative overflow-hidden bg-[linear-gradient(135deg,#112772_0%,#1D48B5_55%,#2860E6_100%)] px-4 pb-4 pt-5 text-white sm:px-6">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/[.07]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl" />
            <div className="relative flex items-end gap-3 sm:gap-5">
              <PenjagaCharacter mood={mood} size={104} className="-mb-2 shrink-0 sm:w-[128px]" />
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#CADCFF]">Penjaga Pundi</p>
                <h1 className="font-display text-2xl font-black tracking-[-0.03em] sm:text-3xl">Hermes</h1>
                <span className={cn(
                  "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  status?.chat === "ready" ? "bg-mint/20 text-white" : "bg-white/12 text-[#E7EFFF]",
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", status?.chat === "ready" ? "animate-pulse bg-[#4ADE9B]" : status?.chat === "demo" ? "bg-brass" : "bg-[#8FBCFF]")} />
                  {statusLabel}
                </span>
              </div>
            </div>
            <p key={mood} className="relative mt-4 animate-in fade-in slide-in-from-bottom-1 rounded-[16px] rounded-tl-[4px] bg-white/12 px-3.5 py-2.5 text-[13px] font-medium leading-snug backdrop-blur-sm">
              {MOOD_LINES[mood]}
            </p>
            <div className="relative mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-[14px] bg-white/8 px-3 py-2">
                <p className="text-[#CADCFF]">Pengeluaran hari ini</p>
                <p className="mt-0.5 truncate text-sm font-bold tabular-nums">{formatRupiah(spentToday)}</p>
              </div>
              <a href="#draft-title" className="rounded-[14px] bg-white/8 px-3 py-2 transition hover:bg-white/14 lg:pointer-events-none">
                <p className="flex items-center gap-1 text-[#CADCFF]">Draft menunggu <ChevronDown className="h-3 w-3 lg:hidden" /></p>
                <p className="mt-0.5 text-sm font-bold tabular-nums">{drafts.length}</p>
              </a>
            </div>
          </header>
          <PenjagaChat className="h-[min(58dvh,520px)] lg:h-[560px]" />
        </section>

        <div className="min-w-0 space-y-4 lg:col-span-5 lg:space-y-5">
          <DraftReview />
          <ConnectHermesCard />
        </div>
      </div>
    </div>
  );
}
