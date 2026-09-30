"use client";

/**
 * components/dashboard/SafeToSpendCard.tsx
 * Banner "Aman Dibelanjakan Hari Ini" — sengaja ditaruh di luar grid puzzle
 * DashboardLayout (bukan data-widget-id) supaya selalu tampil di posisi
 * paling atas terlepas dari susunan widget yang disimpan pengguna; ini
 * angka utama yang ingin dilihat tiap hari, bukan kartu opsional.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/formatter";
import type { SafeToSpendResult } from "@/lib/utils/safeToSpend";
import { cn } from "@/lib/utils/cn";

export function SafeToSpendCard({ result }: { result: SafeToSpendResult }) {
  const [expanded, setExpanded] = useState(false);
  const { liquidBalance, upcomingBills, budgetReserved, daysRemaining, perDay, isOverExtended } = result;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-[1.75rem] p-5 shadow-card sm:p-7",
      isOverExtended ? "bg-ember-ink text-white" : "bg-brand-600 text-white",
    )}>
      <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[26px] border-white/10" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-card">
            <Wallet size={21} />
          </div>
          <div>
            <p className="text-small font-semibold text-white/70">Aman dibelanjakan hari ini</p>
            {isOverExtended ? (
              <>
                <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Rencana bulan ini terlampaui</p>
                <p className="mt-1 text-xs text-white/70">Tagihan dan anggaran yang sudah direncanakan lebih besar dari saldo cair saat ini.</p>
              </>
            ) : (
              <>
                <p className="mt-1 font-ui tabular-nums text-[clamp(1.9rem,4vw,3rem)] font-semibold tracking-[-0.05em]">
                  {formatRupiah(perDay)}
                </p>
                <p className="mt-1 text-xs text-white/70">per hari · {daysRemaining} hari tersisa bulan ini, di luar tagihan &amp; anggaran yang sudah direncanakan</p>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 sm:self-center"
        >
          Rincian {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="relative mt-5 grid gap-2 border-t border-white/15 pt-4 text-xs sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-white/60">Saldo cair</p>
            <p className="mt-1 font-mono font-bold tabular-nums">{formatRupiah(liquidBalance)}</p>
            <p className="mt-0.5 text-[10px] text-white/50">Bank, e-wallet, tunai</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-white/60">Tagihan akan datang</p>
            <p className="mt-1 font-mono font-bold tabular-nums">− {formatRupiah(upcomingBills)}</p>
            <p className="mt-0.5 text-[10px] text-white/50">Sisa bulan ini</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-white/60">Anggaran tersisa</p>
            <p className="mt-1 font-mono font-bold tabular-nums">− {formatRupiah(budgetReserved)}</p>
            <p className="mt-0.5 text-[10px] text-white/50">Sudah direncanakan per kategori</p>
          </div>
        </div>
      )}
    </div>
  );
}
