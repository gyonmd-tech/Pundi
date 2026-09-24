"use client";

import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils/cn";

export function ConnectionBadge() {
  const { connection } = useApp();
  const label = connection.status === "loading" ? "Memuat data" : connection.status === "error" ? "Cloud bermasalah" : connection.mode === "cloud" ? "Data cloud" : "Demo lokal";
  return <div className="hidden items-center gap-2 rounded-full border border-rule bg-white px-3 py-2 text-[11px] font-bold text-ink-muted xl:flex" title={connection.error}><span className={cn("h-2 w-2 rounded-full", connection.status === "loading" ? "animate-pulse bg-brass" : connection.status === "error" ? "bg-ember" : connection.mode === "cloud" ? "bg-mint" : "bg-pine")} />{label}</div>;
}
