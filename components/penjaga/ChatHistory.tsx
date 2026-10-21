"use client";

/**
 * components/penjaga/ChatHistory.tsx
 * Daftar percakapan Penjaga (ADR-002), dikelompokkan Hari ini / Kemarin /
 * 7 hari terakhir / Lebih lama. Dipakai sebagai panel kiri di desktop dan
 * isi sheet di ponsel.
 */
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChatThread } from "@/lib/penjaga/types";
import { usePenjaga } from "./PenjagaProvider";

const DAY_MS = 24 * 60 * 60 * 1000;

function groupLabel(iso: string, now: Date) {
  const date = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const time = date.getTime();
  if (time >= startOfToday) return "Hari ini";
  if (time >= startOfToday - DAY_MS) return "Kemarin";
  if (time >= startOfToday - 6 * DAY_MS) return "7 hari terakhir";
  return "Lebih lama";
}

function groupThreads(threads: ChatThread[]) {
  const now = new Date();
  const groups: { label: string; items: ChatThread[] }[] = [];
  for (const thread of threads) {
    const label = groupLabel(thread.lastMessageAt, now);
    const group = groups.find((item) => item.label === label);
    if (group) group.items.push(thread);
    else groups.push({ label, items: [thread] });
  }
  return groups;
}

export function ChatHistory({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { threads, activeThreadId, openThread, newChat, deleteThread, busy } = usePenjaga();
  const groups = groupThreads(threads);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => { newChat(); onNavigate?.(); }}
        className="flex h-11 w-full shrink-0 items-center gap-2.5 rounded-[14px] border border-rule bg-surface-high px-3.5 text-sm font-bold text-ink transition hover:border-brand-300 hover:text-brand-600 active:scale-[.99] disabled:opacity-50"
      >
        <MessageSquarePlus className="h-[18px] w-[18px] text-brand-600" /> Chat baru
      </button>

      <nav aria-label="Riwayat percakapan" className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
        {groups.length === 0 ? (
          <p className="px-1 text-xs leading-relaxed text-ink-muted">Belum ada percakapan. Ceritakan harimu, dan riwayatnya tersimpan di sini.</p>
        ) : groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((thread) => {
                const active = thread.id === activeThreadId;
                return (
                  <li key={thread.id} className="group relative">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { openThread(thread.id); onNavigate?.(); }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex w-full flex-col rounded-[12px] py-2 pl-3 pr-9 text-left transition disabled:opacity-60",
                        active ? "bg-brand-600/10 text-ink" : "text-ink-muted hover:bg-surface-high hover:text-ink",
                      )}
                    >
                      <span className={cn("truncate text-[13px]", active ? "font-bold" : "font-semibold")}>{thread.title}</span>
                      {thread.preview ? <span className="mt-0.5 truncate text-[11px] text-ink-soft">{thread.preview}</span> : null}
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus percakapan ${thread.title}`}
                      onClick={() => {
                        if (window.confirm(`Hapus percakapan "${thread.title}"?`)) deleteThread(thread.id);
                      }}
                      className="tap-target absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-soft transition hover:bg-ember-10 hover:text-ember-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
