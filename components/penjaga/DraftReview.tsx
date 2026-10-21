"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CheckCheck, Inbox, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAccounts, useCategories } from "@/lib/data/store";
import { useToast } from "@/lib/context/ToastContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";
import type { AgentDraft, DraftEdit } from "@/lib/penjaga/types";
import { usePenjaga } from "./PenjagaProvider";

const TYPE_META = {
  expense: { label: "Pengeluaran", icon: ArrowUpRight, tone: "bg-ember-10 text-ember-ink" },
  income: { label: "Pemasukan", icon: ArrowDownLeft, tone: "bg-mint-10 text-mint-ink" },
  transfer: { label: "Transfer", icon: ArrowLeftRight, tone: "bg-brand-100 text-brand-700" },
} as const;

function missingFields(draft: AgentDraft) {
  const missing: string[] = [];
  if (!draft.accountId) missing.push("rekening");
  if (draft.type === "transfer" && !draft.destinationAccountId) missing.push("tujuan");
  return missing;
}

export function DraftReview({ className }: { className?: string }) {
  const { drafts, confirm, reject } = usePenjaga();
  const { showToast } = useToast();
  const [edits, setEdits] = useState<Record<string, DraftEdit>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const merged = useMemo(() => drafts.map((draft) => ({ ...draft, ...edits[draft.id] })), [drafts, edits]);
  const ready = merged.filter((draft) => missingFields(draft).length === 0);
  const total = ready.reduce((sum, draft) => sum + (draft.type === "expense" ? -draft.amount : draft.type === "income" ? draft.amount : 0), 0);

  function edit(id: string, patch: DraftEdit) {
    setEdits((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function saveAll() {
    if (!ready.length) return;
    setSaving(true);
    try {
      const result = await confirm(ready.map((draft) => draft.id), edits);
      setErrors(Object.fromEntries(result.failed.map(({ draftId, error }) => [draftId, error])));
      if (result.saved) {
        showToast({ type: "success", title: `${result.saved} transaksi tersimpan`, message: "Saldo rekening sudah diperbarui oleh Penjaga." });
      }
      if (result.failed.length) {
        showToast({ type: "warning", title: `${result.failed.length} draft belum tersimpan`, message: result.failed[0].error });
      }
    } catch (error) {
      showToast({ type: "error", title: "Gagal menyimpan", message: error instanceof Error ? error.message : "Coba lagi." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={cn("rounded-[22px] border border-brand-600/10 bg-surface-high shadow-card", className)} aria-labelledby="draft-title">
      <header className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <h2 id="draft-title" className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
            Menunggu konfirmasi
            {drafts.length ? <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 align-middle text-[11px] font-bold text-white">{drafts.length}</span> : null}
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">Belum ada saldo yang berubah sampai kamu menekan Simpan.</p>
        </div>
        {drafts.length ? (
          <Button size="sm" onClick={saveAll} loading={saving} disabled={!ready.length}>
            <CheckCheck className="h-4 w-4" /> {ready.length === drafts.length ? "Simpan semua" : ready.length ? `Simpan ${ready.length} yang siap` : "Simpan"}
          </Button>
        ) : null}
      </header>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 pb-8 pt-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500"><Inbox className="h-6 w-6" /></span>
          <p className="text-sm font-semibold text-ink">Tidak ada draft</p>
          <p className="max-w-xs text-xs leading-relaxed text-ink-muted">Draft dari obrolan di sini maupun dari Hermes di Telegram/CLI akan muncul otomatis.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 px-3 pb-3 sm:px-4">
            {merged.map((draft, index) => (
              <DraftItem
                key={draft.id}
                draft={draft}
                index={index}
                error={errors[draft.id]}
                onEdit={(patch) => edit(draft.id, patch)}
                onReject={() => reject([draft.id])}
              />
            ))}
          </ul>
          <footer className="flex items-center justify-between gap-3 border-t border-rule px-5 py-3 text-xs text-ink-muted">
            <span>Dampak bersih ke saldo</span>
            <span className={cn("font-bold tabular-nums", total < 0 ? "text-ember-ink" : "text-mint-ink")}>
              {total < 0 ? "−" : "+"}{formatRupiah(Math.abs(total))}
            </span>
          </footer>
        </>
      )}
    </section>
  );
}

function DraftItem({ draft, index, error, onEdit, onReject }: {
  draft: AgentDraft;
  index: number;
  error?: string;
  onEdit: (patch: DraftEdit) => void;
  onReject: () => void;
}) {
  const accounts = useAccounts().filter((account) => account.isActive);
  const categories = useCategories().filter((category) => category.type === draft.type);
  const meta = TYPE_META[draft.type];
  const Icon = meta.icon;
  const missing = missingFields(draft);
  const date = new Date(draft.date);

  return (
    <li
      className="animate-in fade-in slide-in-from-bottom-2 rounded-[18px] border border-rule bg-paper p-3"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[13px]", meta.tone)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <input
              value={draft.note ?? ""}
              onChange={(event) => onEdit({ note: event.target.value })}
              placeholder={meta.label}
              aria-label="Catatan"
              data-bare-input="true"
              className="min-w-0 flex-1 rounded-[8px] bg-transparent py-0.5 text-sm font-semibold text-ink outline-none placeholder:text-ink-soft"
            />
            <button
              type="button"
              onClick={onReject}
              aria-label="Buang draft"
              className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-ember-10 hover:text-ember-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[11px] text-ink-muted">
              {meta.label} · {date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              {draft.source === "hermes" ? " · via Hermes" : ""}
            </p>
            <label className="flex shrink-0 items-baseline gap-1 rounded-[10px] px-1.5 py-0.5">
              <span className="text-[11px] font-bold text-ink-muted">Rp</span>
              <input
                inputMode="numeric"
                value={draft.amount.toLocaleString("id-ID")}
                onChange={(event) => {
                  const amount = Number(event.target.value.replace(/\D/g, ""));
                  if (amount > 0) onEdit({ amount });
                }}
                aria-label="Nominal"
                data-bare-input="true"
                style={{ width: `${String(draft.amount).length + 0.4 * Math.floor((String(draft.amount).length - 1) / 3) + 0.3}ch` }}
                className="min-w-[3ch] bg-transparent text-right text-[15px] font-bold tabular-nums text-ink outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <div className={cn("mt-3 grid gap-2", draft.type === "transfer" ? "grid-cols-2" : "grid-cols-1 min-[420px]:grid-cols-2")}>
        <Select
          value={draft.accountId ?? ""}
          onChange={(event) => onEdit({ accountId: event.target.value || undefined })}
          aria-label="Rekening"
          className={cn("h-10 text-[13px]", !draft.accountId && "border-dashed border-warning text-warning-ink")}
        >
          <option value="">Pilih rekening…</option>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
        </Select>
        {draft.type === "transfer" ? (
          <Select
            value={draft.destinationAccountId ?? ""}
            onChange={(event) => onEdit({ destinationAccountId: event.target.value || undefined })}
            aria-label="Rekening tujuan"
            className={cn("h-10 text-[13px]", !draft.destinationAccountId && "border-dashed border-warning text-warning-ink")}
          >
            <option value="">Ke rekening…</option>
            {accounts.filter((account) => account.id !== draft.accountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </Select>
        ) : (
          <Select
            value={draft.categoryId ?? ""}
            onChange={(event) => onEdit({ categoryId: event.target.value || undefined })}
            aria-label="Kategori"
            className="h-10 text-[13px]"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
        )}
      </div>

      {error || missing.length ? (
        <p className={cn("mt-2 text-[11px] font-semibold", error ? "text-ember-ink" : "text-warning-ink")}>
          {error ?? `Lengkapi ${missing.join(" & ")} sebelum disimpan.`}
        </p>
      ) : null}
    </li>
  );
}
