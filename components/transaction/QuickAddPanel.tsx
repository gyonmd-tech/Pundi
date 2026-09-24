"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ReceiptText,
  WalletCards,
  X,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useAccounts, useApp, useCategories } from "@/lib/data/store";
import type { TransactionType } from "@/lib/data/mock";
import { useToast } from "@/lib/context/ToastContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";
import { createTransactionAction } from "@/actions/transactions";

const transactionTypes = [
  { value: "expense" as const, label: "Keluar", icon: ArrowDownLeft, tone: "text-ember bg-ember-10 border-ember/25" },
  { value: "income" as const, label: "Masuk", icon: ArrowUpRight, tone: "text-mint bg-mint-10 border-mint/25" },
  { value: "transfer" as const, label: "Transfer", icon: ArrowLeftRight, tone: "text-brass bg-brass-10 border-brass/25" },
];

const quickAmounts = [50_000, 100_000, 250_000, 500_000];

export function QuickAddPanel({ onClose }: { onClose: () => void }) {
  const accounts = useAccounts();
  const categories = useCategories();
  const { dispatch } = useApp();
  const { showToast } = useToast();
  const amountRef = React.useRef<HTMLInputElement>(null);
  const [type, setType] = React.useState<TransactionType>("expense");
  const [amount, setAmount] = React.useState("");
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const numericAmount = Number(amount || 0);
  const availableCategories = categories.filter((category) =>
    type === "transfer" ? false : category.type === type
  );

  React.useEffect(() => {
    const timer = window.setTimeout(() => amountRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!numericAmount || !accountId) {
      showToast({
        type: "error",
        title: "Data belum lengkap",
        message: "Isi nominal dan pilih rekening transaksi.",
      });
      return;
    }

    const payload = {
      accountId,
      categoryId: type === "transfer" ? undefined : categoryId || undefined,
      type,
      amount: numericAmount,
      date: new Date(`${date}T12:00:00`),
      note: note.trim() || undefined,
      tags: [],
    };

    setSubmitting(true);
    const result = await createTransactionAction(payload);
    setSubmitting(false);

    if (!result.success) {
      showToast({
        type: "error",
        title: "Transaksi gagal disimpan",
        message: result.error || "Koneksi penyimpanan sedang bermasalah. Coba lagi.",
      });
      return;
    }

    dispatch({
      type: "ADD_TRANSACTION",
      payload: { ...payload, id: result.id ?? `tx-${Date.now()}` },
    });

    showToast({
      type: "success",
      title: "Transaksi tersimpan",
      message: `${formatRupiah(numericAmount)} berhasil ditambahkan ke catatan.`,
    });
    onClose();
  }

  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-rule px-5 py-5">
        <div>
          <p className="eyebrow">Catatan baru</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-ink">Tambah transaksi</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">Lengkapi detailnya dalam satu panel.</p>
        </div>
        <IconButton type="button" variant="soft" aria-label="Tutup form transaksi" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-3 gap-2 rounded-[18px] bg-paper p-1.5">
          {transactionTypes.map((item) => {
            const Icon = item.icon;
            const active = type === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => { setType(item.value); setCategoryId(""); }}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[14px] border text-[11px] font-extrabold transition-all",
                  active ? `${item.tone} shadow-sm` : "border-transparent text-ink-muted hover:bg-white hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <Field label="Nominal" hint={numericAmount ? formatRupiah(numericAmount) : "Wajib"} required>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-black text-pine">Rp</span>
            <Input
              ref={amountRef}
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="h-14 rounded-[18px] border-pine/20 bg-pine-10/60 pl-12 font-mono text-xl font-semibold tracking-tight"
            />
          </div>
        </Field>

        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(numericAmount + value))}
              className="rounded-full border border-rule bg-white px-3 py-1.5 text-[11px] font-bold text-ink-muted transition hover:border-pine/35 hover:bg-pine-10 hover:text-pine"
            >
              +{value >= 1_000_000 ? `${value / 1_000_000} jt` : `${value / 1_000} rb`}
            </button>
          ))}
        </div>

        <Field label="Rekening" required>
          <div className="relative">
            <WalletCards className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Select value={accountId} onChange={(event) => setAccountId(event.target.value)} className="pl-10">
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name} · {formatRupiah(account.balance)}</option>
              ))}
            </Select>
          </div>
        </Field>

        {type !== "transfer" ? (
          <Field label="Kategori">
            <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Pilih kategori</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field label="Tanggal">
          <DatePicker value={date} onValueChange={setDate} />
        </Field>

        <Field label="Catatan" hint={`${note.length}/80`}>
          <div className="relative">
            <ReceiptText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
            <textarea
              value={note}
              maxLength={80}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: makan siang bersama tim"
              className="min-h-24 w-full resize-none rounded-[16px] border border-rule bg-white py-3 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-pine focus:ring-2 focus:ring-pine/15"
            />
          </div>
        </Field>
      </div>

      <footer className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-rule bg-white/95 p-4 backdrop-blur">
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="submit" loading={submitting}><Check className="h-4 w-4" /> Simpan transaksi</Button>
      </footer>
    </form>
  );
}
