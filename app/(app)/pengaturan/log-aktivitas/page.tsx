"use client";

/**
 * app/(app)/pengaturan/log-aktivitas/page.tsx
 * Sub-halaman Pengaturan — tidak masuk sidebar utama (lihat
 * components/layout/navigation.ts). Fetch on-demand lewat
 * getAuditLogsAction, sengaja TIDAK ikut getAppBootstrapAction.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, Loader2, User, Bot } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { getAuditLogsAction, type AuditLogItem, type GetAuditLogsParams } from "@/actions/activityLog";
import type { AuditAction, AuditEntityType } from "@/lib/appwrite/auditLog";

const entityLabels: Record<AuditEntityType, string> = {
  account: "Rekening",
  transaction: "Transaksi",
  budget: "Anggaran",
  goal: "Tujuan",
  asset: "Aset",
  debt: "Utang/Piutang",
  category: "Kategori",
  recurring_rule: "Aturan Berulang",
  insight: "Insight",
  preferences: "Preferensi",
  avatar: "Avatar",
};

const actionLabels: Record<AuditAction, string> = {
  create: "Dibuat",
  update: "Diubah",
  delete: "Dihapus",
  toggle: "Status diubah",
  generate: "Dibuat otomatis",
  payment: "Pembayaran",
};

const actionTone: Record<AuditAction, "neutral" | "primary" | "success" | "warning" | "danger"> = {
  create: "success",
  update: "primary",
  delete: "danger",
  toggle: "warning",
  generate: "neutral",
  payment: "success",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function LogAktivitasPage() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [entityType, setEntityType] = useState<AuditEntityType | "">("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function buildParams(): GetAuditLogsParams {
    return {
      entityType: entityType || undefined,
      action: action || undefined,
      from: from ? `${from}T00:00:00.000Z` : undefined,
      to: to ? `${to}T23:59:59.999Z` : undefined,
    };
  }

  async function load(reset: boolean) {
    if (reset) setLoading(true);
    const result = await getAuditLogsAction(buildParams());
    setItems(result.data);
    setCursor(result.nextCursor);
    setError(result.error);
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const result = await getAuditLogsAction({ ...buildParams(), cursor });
    setItems((current) => [...current, ...result.data]);
    setCursor(result.nextCursor);
    setLoadingMore(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change memerlukan setLoading segera agar UI menampilkan status memuat
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, action, from, to]);

  return (
    <div className="w-full min-w-0 max-w-[70rem] space-y-5 font-ui sm:space-y-6">
      <header>
        <Link href="/pengaturan" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted transition hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Pengaturan
        </Link>
        <h1 className="page-title mt-2 flex items-center gap-2"><History size={22} className="text-pine" /> Log Aktivitas</h1>
        <p className="page-subtitle max-w-2xl">Riwayat lengkap perubahan data — manual maupun otomatis — beserta nilai sebelum dan sesudahnya.</p>
      </header>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Jenis data</label>
            <Select value={entityType} onChange={(event) => setEntityType(event.target.value as AuditEntityType | "")}>
              <option value="">Semua jenis</option>
              {Object.entries(entityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Aksi</label>
            <Select value={action} onChange={(event) => setAction(event.target.value as AuditAction | "")}>
              <option value="">Semua aksi</option>
              {Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Dari tanggal</label>
            <DatePicker value={from} onValueChange={setFrom} max={to || undefined} ariaLabel="Dari tanggal" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Sampai tanggal</label>
            <DatePicker value={to} onValueChange={setTo} min={from || undefined} ariaLabel="Sampai tanggal" />
          </div>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin" /> Memuat log aktivitas…</div>
        ) : error ? (
          <p className="p-6 text-center text-sm text-ember">{error}</p>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink-muted">Belum ada aktivitas yang tercatat pada filter ini.</p>
        ) : (
          <div className="divide-y divide-rule">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={actionTone[item.action]}>{actionLabels[item.action]}</Badge>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{entityLabels[item.entityType]}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      item.actor === "system" ? "bg-brand-50 text-brand-700" : "bg-mint-10 text-mint-ink",
                    )}>
                      {item.actor === "system" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {item.actor === "system" ? "Otomatis" : "Manual"}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-ink">{item.summary}</p>
                </div>
                <p className="shrink-0 text-xs font-bold tabular-nums text-ink-muted">{dateFormatter.format(new Date(item.createdAt))}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!loading && cursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={loadMore} loading={loadingMore}>Muat lebih banyak</Button>
        </div>
      ) : null}
    </div>
  );
}
