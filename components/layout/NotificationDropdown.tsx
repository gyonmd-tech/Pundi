"use client";

import { Bell, CheckCheck, ChevronRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useApp, useInsights } from "@/lib/data/store";
import { useToast } from "@/lib/context/ToastContext";
import { formatDate } from "@/lib/utils/formatter";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import { markAllInsightsReadAction } from "@/actions/insights";

export function NotificationDropdown() {
  const insights = useInsights();
  const unread = insights.filter((insight) => !insight.isRead);
  const { dispatch } = useApp();
  const { showToast } = useToast();

  async function markAllRead() {
    const result = await markAllInsightsReadAction();
    if (!result.success) {
      showToast({ type: "error", title: "Notifikasi gagal diperbarui", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "MARK_ALL_READ" });
    showToast({ type: "success", title: "Semua sudah dibaca", message: "Insight terbaru telah ditandai sebagai dibaca." });
  }

  return (
    <Dropdown
      contentClassName="w-[min(25rem,calc(100vw-1.5rem))] overflow-hidden rounded-[22px] border-pine/10 p-0"
      trigger={({ open, toggle }) => (
        <div className="relative">
          <button
            type="button"
            aria-label={`${unread.length} notifikasi belum dibaca`}
            aria-expanded={open}
            onClick={toggle}
            className={`grid h-11 w-11 place-items-center rounded-[16px] border transition-all ${open ? "border-pine/25 bg-pine text-white shadow-[0_8px_20px_rgba(91,74,239,.22)]" : "border-pine/12 bg-[linear-gradient(145deg,#FFFFFF,#F2EFFF)] text-pine shadow-2xs hover:-translate-y-0.5 hover:border-pine/25 hover:shadow-card"}`}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
          {unread.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-ember px-1 text-[9px] font-extrabold text-white shadow-sm">{unread.length}</span> : null}
        </div>
      )}
    >
      {({ close }) => (
        <>
          <div className="bg-[linear-gradient(135deg,#F4F1FF,#EEF8FF)] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-extrabold tracking-[-0.01em] text-ink">Notifikasi</p><p className="mt-1 text-[11px] text-ink-muted">Ringkasan penting dari aktivitas keuanganmu.</p></div>
              {unread.length ? <Badge tone="primary">{unread.length} baru</Badge> : <Badge tone="success">Bersih</Badge>}
            </div>
            {unread.length ? <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-pine transition hover:opacity-75" onClick={markAllRead}><CheckCheck className="h-3.5 w-3.5" /> Tandai semua dibaca</button> : null}
          </div>

          <div className="max-h-[22rem] space-y-1 overflow-y-auto p-2">
            {insights.slice(0, 5).map((insight) => (
              <article key={insight.id} className={`flex gap-3 rounded-[15px] p-3 transition ${insight.isRead ? "hover:bg-paper" : "bg-pine-10/70 hover:bg-pine-10"}`}>
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[11px] ${insight.isRead ? "bg-paper text-ink-muted" : "bg-white text-pine shadow-sm"}`}><Lightbulb className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-medium leading-relaxed text-ink">{insight.message}</p><time className="mt-1.5 block text-[10px] font-medium text-ink-muted">{formatDate(insight.createdAt, "time")}</time></div>
                {!insight.isRead ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-pine" /> : null}
              </article>
            ))}
          </div>

          <div className="border-t border-rule bg-white p-2">
            <Link href="/insight" onClick={close} className="flex min-h-11 items-center justify-between rounded-[14px] px-3 text-xs font-bold text-pine transition hover:bg-pine-10">Buka pusat insight<ChevronRight className="h-4 w-4" /></Link>
          </div>
        </>
      )}
    </Dropdown>
  );
}
