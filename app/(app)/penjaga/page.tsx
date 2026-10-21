"use client";

/**
 * app/(app)/penjaga/page.tsx
 * Ruang Penjaga — tampilan chat lebar bergaya aplikasi LLM dengan riwayat
 * percakapan (panel kiri di desktop, sheet di ponsel). Percakapan aktif
 * disimpan di URL (?c=<id>) agar tetap terbuka setelah halaman dimuat ulang.
 * Pengaturan mesin AI & token Hermes ada di Pengaturan → Penjaga AI.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, Settings2 } from "lucide-react";
import { PenjagaThread, PenjagaComposer } from "@/components/penjaga/PenjagaChat";
import { PenjagaAvatar } from "@/components/penjaga/PenjagaAvatar";
import { ChatHistory } from "@/components/penjaga/ChatHistory";
import { usePenjaga } from "@/components/penjaga/PenjagaProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";

function useThreadUrlSync() {
  const { status, activeThreadId, openThread } = usePenjaga();
  const restored = useRef(false);

  // Buka percakapan dari URL sekali, setelah status Penjaga diketahui.
  useEffect(() => {
    if (!status || restored.current) return;
    restored.current = true;
    const id = new URL(window.location.href).searchParams.get("c");
    if (id) openThread(id);
  }, [openThread, status]);

  useEffect(() => {
    if (!restored.current) return;
    const url = new URL(window.location.href);
    if ((url.searchParams.get("c") ?? null) === activeThreadId) return;
    if (activeThreadId) url.searchParams.set("c", activeThreadId);
    else url.searchParams.delete("c");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [activeThreadId]);
}

export default function PenjagaPage() {
  const { mood, status, drafts, threads, activeThreadId } = usePenjaga();
  const [historyOpen, setHistoryOpen] = useState(false);
  useThreadUrlSync();

  const statusLabel = !status ? "Menyiapkan…"
    : status.chat === "demo" ? "Mode latihan"
    : status.chat === "ready" ? (status.engine === "hermes" ? "Hermes terhubung" : "AI aktif")
    : status.chat === "not-owner" ? "Khusus pemilik"
    : "Belum aktif";
  const ready = status?.chat === "ready";
  const activeTitle = threads.find((thread) => thread.id === activeThreadId)?.title;

  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-6">
      <aside className="sticky top-24 hidden h-[calc(100dvh-8rem)] lg:flex">
        <ChatHistory className="w-full" />
      </aside>

      <div className="flex min-h-[calc(100dvh-11rem)] min-w-0 flex-col md:min-h-[calc(100dvh-8.5rem)]">
        <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-1">
          <PenjagaAvatar size={40} mood={mood} animated />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-black leading-tight tracking-[-0.02em] text-ink">
              {activeTitle ?? "Penjaga"}
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ready ? "animate-pulse bg-mint" : status?.chat === "demo" ? "bg-brass" : "bg-ink-soft")} />
              {statusLabel}
              {drafts.length ? <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-px text-[10px] font-bold text-white">{drafts.length} draft</span> : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Riwayat percakapan"
            className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-surface-high text-ink-muted transition hover:border-brand-300 hover:text-brand-600 lg:hidden"
          >
            <History className="h-[18px] w-[18px]" />
          </button>
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

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Riwayat percakapan" className="sm:max-w-md">
        <div className="h-[min(70dvh,560px)] p-4">
          <ChatHistory className="h-full" onNavigate={() => setHistoryOpen(false)} />
        </div>
      </Modal>
    </div>
  );
}
