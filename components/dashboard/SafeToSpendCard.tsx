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

  // Kartu tonal (bukan hero) agar tidak bertumpuk dengan kartu saldo total.
  return (
    <section className={cn("rounded-card border p-4 shadow-card sm:p-5", isOverExtended ? "border-ember/30 bg-ember-10" : "border-rule bg-surface-high")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-sm", isOverExtended ? "bg-ember/15 text-ember-ink" : "bg-lime-10 text-lime-ink")}>
          <Wallet size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-ink-muted">Aman dibelanjakan hari ini</p>
          {isOverExtended ? (
            <>
              <p className="mt-1 text-lg font-semibold text-ember-ink">Rencana bulan ini terlampaui</p>
              <p className="mt-0.5 text-xs text-ink-muted">Tagihan dan anggaran yang direncanakan melebihi saldo cair.</p>
            </>
          ) : (
            <>
              <p className="figure-display mt-1 text-[2rem] leading-none text-ink">{formatRupiah(perDay)}</p>
              <p className="mt-1 text-xs text-ink-muted">per hari · {daysRemaining} hari lagi bulan ini</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="-mr-1 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Rincian {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="min-w-0">
            <dt className="text-ink-muted">Saldo cair</dt>
            <dd className="mt-0.5 truncate font-semibold text-ink tabular-nums">{formatRupiah(liquidBalance)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-ink-muted">Tagihan</dt>
            <dd className="mt-0.5 truncate font-semibold text-ember-ink tabular-nums">−{formatRupiah(upcomingBills)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-ink-muted">Anggaran</dt>
            <dd className="mt-0.5 truncate font-semibold text-ink tabular-nums">−{formatRupiah(budgetReserved)}</dd>
          </div>
          <p className="col-span-3 text-[11px] text-ink-muted">Saldo bank, e-wallet & tunai, dikurangi tagihan dan sisa anggaran bulan ini.</p>
        </dl>
      )}
    </section>
  );
}
