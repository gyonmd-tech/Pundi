"use client";

/**
 * app/(app)/penjaga/page.tsx
 * Ruang Penjaga — tampilan chat lebar bergaya aplikasi LLM. Pengguna cukup
 * bercerita; Penjaga menyusun draft, pengguna meninjau & menyimpan.
 * Pengaturan mesin AI & token Hermes ada di Pengaturan → Penjaga AI.
 */
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { PenjagaThread, PenjagaComposer } from "@/components/penjaga/PenjagaChat";
import { PenjagaAvatar } from "@/components/penjaga/PenjagaAvatar";
import { usePenjaga } from "@/components/penjaga/PenjagaProvider";
import { cn } from "@/lib/utils/cn";

export default function PenjagaPage() {
  const { mood, status, drafts } = usePenjaga();

  const statusLabel = !status ? "Menyiapkan…"
    : status.chat === "demo" ? "Mode latihan"
    : status.chat === "ready" ? (status.engine === "hermes" ? "Hermes terhubung" : "AI aktif")
    : status.chat === "not-owner" ? "Khusus pemilik"
    : "Belum aktif";
  const ready = status?.chat === "ready";

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col md:min-h-[calc(100dvh-8.5rem)]">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-1">
        <PenjagaAvatar size={40} mood={mood} animated />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-black leading-tight tracking-[-0.02em] text-ink">Penjaga</p>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <span className={cn("h-1.5 w-1.5 rounded-full", ready ? "animate-pulse bg-mint" : status?.chat === "demo" ? "bg-brass" : "bg-ink-soft")} />
            {statusLabel}
            {drafts.length ? <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-px text-[10px] font-bold text-white">{drafts.length} draft</span> : null}
          </p>
        </div>
        <Link
          href="/pengaturan#penjaga"
          aria-label="Pengaturan Penjaga"
          className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-surface-high text-ink-muted transition hover:border-brand-300 hover:text-brand-600"
        >
          <Settings2 className="h-[18px] w-[18px]" />
        </Link>
      </header>

      <div className="flex-1">
        <PenjagaThread />
      </div>

      <PenjagaComposer />
    </div>
  );
}
