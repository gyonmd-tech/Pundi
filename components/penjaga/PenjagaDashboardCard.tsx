"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils/formatter";
import { PenjagaCharacter } from "./PenjagaCharacter";
import { usePenjaga } from "./PenjagaProvider";

/** Sapaan Penjaga di dashboard — pintu masuk cepat ke pencatatan lewat cerita. */
export function PenjagaDashboardCard() {
  const { drafts, mood, status } = usePenjaga();
  const pending = drafts.length;
  const total = drafts.reduce((sum, draft) => sum + (draft.type === "expense" ? draft.amount : 0), 0);
  const asleep = status?.chat === "not-configured" || status?.chat === "not-owner";

  return (
    <Link
      href="/penjaga"
      className="group relative flex items-center gap-3 overflow-hidden rounded-[22px] border border-brand-600/10 bg-surface-high py-2 pl-2 pr-4 shadow-card transition hover:border-brand-300 active:scale-[.99] sm:gap-4"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-28 bg-[radial-gradient(circle_at_40%_60%,rgba(92,143,242,.22),transparent_70%)]" />
      <PenjagaCharacter mood={pending ? "talking" : mood} size={64} title="Penjaga" className="relative shrink-0" />
      <div className="relative min-w-0 flex-1 py-1">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-pine">Penjaga Pundi</p>
        <p className="mt-0.5 text-sm font-bold leading-snug text-ink">
          {pending
            ? `${pending} draft menunggu persetujuanmu`
            : asleep ? "Aktifkan AI Penjaga untuk mencatat lewat cerita" : "Ceritakan harimu, biar aku yang mencatat"}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {pending ? `Total pengeluaran ${formatRupiah(total)} · tinjau & simpan` : "Pencatatan manual tetap tersedia lewat tombol +"}
        </p>
      </div>
      {pending ? <span className="relative grid h-6 min-w-6 place-items-center rounded-full bg-ember-ink px-1.5 text-[11px] font-bold text-white">{pending}</span> : null}
      <ChevronRight className="relative h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
}
