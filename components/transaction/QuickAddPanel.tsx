"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
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
import type { Transaction, TransactionType } from "@/lib/data/mock";
import { useToast } from "@/lib/context/ToastContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";
import { createTransactionAction, updateTransactionAction } from "@/actions/transactions";

type EntryMode = TransactionType | "cash_withdrawal";

const transactionTypes = [
  { value: "expense" as const, label: "Keluar", icon: ArrowDownLeft, tone: "text-ember bg-ember-10 border-ember/25" },
  { value: "income" as const, label: "Masuk", icon: ArrowUpRight, tone: "text-mint bg-mint-10 border-mint/25" },
  { value: "transfer" as const, label: "Transfer", icon: ArrowLeftRight, tone: "text-brass bg-brass-10 border-brass/25" },
  { value: "cash_withdrawal" as const, label: "Tarik tunai", icon: Banknote, tone: "text-sky-700 bg-sky-50 border-sky-200" },
];

const quickAmounts = [50_000, 100_000, 250_000, 500_000];

function getClientBalanceChanges(transaction: Omit<Transaction, "id" | "createdAt">) {
  const changes = new Map<string, number>();
  if (transaction.type === "income") changes.set(transaction.accountId, transaction.amount);
  if (transaction.type === "expense") changes.set(transaction.accountId, -transaction.amount);
  if (transaction.type === "transfer" && transaction.destinationAccountId) {
    changes.set(transaction.accountId, -transaction.amount);
    changes.set(transaction.destinationAccountId, transaction.amount);
  }
  return changes;
}

function mergeClientChanges(...groups: Map<string, number>[]) {
  const result = new Map<string, number>();
  for (const group of groups) {
    for (const [accountId, delta] of group) result.set(accountId, (result.get(accountId) || 0) + delta);
  }
  return result;
}

interface QuickAddPanelProps {
  onClose: () => void;
  transaction?: Transaction;
}

export function QuickAddPanel({ onClose, transaction }: QuickAddPanelProps) {
  const accounts = useAccounts().filter((account) => account.isActive);
  const categories = useCategories();
  const { dispatch, connection } = useApp();
  const { showToast } = useToast();
  const amountRef = React.useRef<HTMLInputElement>(null);
  const initialMode: EntryMode = transaction?.transferKind === "cash_withdrawal"
    ? "cash_withdrawal"
    : transaction?.type || "expense";
  const [mode, setMode] = React.useState<EntryMode>(initialMode);
  const [amount, setAmount] = React.useState(transaction ? String(transaction.amount) : "");
  const [accountId, setAccountId] = React.useState(transaction?.accountId || accounts[0]?.id || "");
  const [destinationAccountId, setDestinationAccountId] = React.useState(transaction?.destinationAccountId || "");
  const [categoryId, setCategoryId] = React.useState(transaction?.categoryId || "");
  const [date, setDate] = React.useState(() =>
    (transaction?.date ? new Date(transaction.date) : new Date()).toISOString().slice(0, 10)
  );
  const [note, setNote] = React.useState(transaction?.note || "");
  const [submitting, setSubmitting] = React.useState(false);
  const numericAmount = Number(amount || 0);
  const type: TransactionType = mode === "cash_withdrawal" ? "transfer" : mode;
  const isTransfer = type === "transfer";
  const cashAccounts = accounts.filter((account) => account.type === "cash");
  const sourceOptions = mode === "cash_withdrawal" ? accounts.filter((account) => account.type !== "cash") : accounts;
  const resolvedAccountId = sourceOptions.some((account) => account.id === accountId)
    ? accountId
    : sourceOptions[0]?.id || "";
  const destinationOptions = mode === "cash_withdrawal"
    ? cashAccounts
    : accounts.filter((account) => account.id !== resolvedAccountId);
  const resolvedDestinationId = destinationOptions.some((account) => account.id === destinationAccountId)
    ? destinationAccountId
    : destinationOptions[0]?.id || "";
  const availableCategories = categories.filter((category) => !isTransfer && category.type === type);
  const resolvedCategoryId = availableCategories.some((category) => category.id === categoryId)
    ? categoryId
    : "";

  React.useEffect(() => {
    const timer = window.setTimeout(() => amountRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  function chooseMode(nextMode: EntryMode) {
    setMode(nextMode);
    setCategoryId("");
    const nextSources = nextMode === "cash_withdrawal" ? accounts.filter((account) => account.type !== "cash") : accounts;
    const nextSource = nextSources.some((account) => account.id === accountId) ? accountId : nextSources[0]?.id || "";
    setAccountId(nextSource);
    if (nextMode === "cash_withdrawal") setDestinationAccountId(cashAccounts[0]?.id || "");
    else if (nextMode === "transfer") setDestinationAccountId(accounts.find((account) => account.id !== nextSource)?.id || "");
    else setDestinationAccountId("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (connection.status === "loading") {
      showToast({ type: "error", title: "Data rekening masih dimuat", message: "Tunggu sampai data cloud siap, lalu coba lagi." });
      return;
    }
    if (!numericAmount || !resolvedAccountId || (isTransfer && !resolvedDestinationId)) {
      showToast({
        type: "error",
        title: "Data belum lengkap",
        message: isTransfer ? "Isi nominal, rekening sumber, dan rekening tujuan." : "Isi nominal dan pilih rekening transaksi.",
      });
      return;
    }

    const basePayload = {
      accountId: resolvedAccountId,
      destinationAccountId: isTransfer ? resolvedDestinationId : undefined,
      transferKind: isTransfer ? (mode === "cash_withdrawal" ? "cash_withdrawal" as const : "account" as const) : undefined,
      categoryId: isTransfer ? undefined : resolvedCategoryId || undefined,
      type,
      amount: numericAmount,
      date: new Date(`${date}T12:00:00`),
      note: note.trim() || undefined,
      tags: transaction?.tags || [],
    };

    setSubmitting(true);
    const result = transaction
      ? await updateTransactionAction({ ...basePayload, id: transaction.id, createdAt: transaction.createdAt })
      : await createTransactionAction(basePayload);
    setSubmitting(false);

    if (!result.success) {
      showToast({
        type: "error",
        title: transaction ? "Perubahan gagal disimpan" : "Transaksi gagal disimpan",
        message: result.error || "Koneksi penyimpanan sedang bermasalah. Coba lagi.",
      });
      return;
    }

    const oldChanges = transaction ? getClientBalanceChanges(transaction) : new Map<string, number>();
    const newChanges = getClientBalanceChanges(basePayload);
    const balanceChanges = transaction
      ? mergeClientChanges(new Map([...oldChanges].map(([accountId, delta]) => [accountId, -delta])), newChanges)
      : newChanges;
    for (const [changedAccountId, delta] of balanceChanges) {
      const account = accounts.find((item) => item.id === changedAccountId);
      if (account && delta !== 0) dispatch({ type: "UPDATE_ACCOUNT", payload: { ...account, balance: account.balance + delta } });
    }

    if (transaction) {
      dispatch({ type: "UPDATE_TRANSACTION", payload: { ...basePayload, id: transaction.id, createdAt: transaction.createdAt } });
    } else {
      dispatch({
        type: "ADD_TRANSACTION",
        payload: { ...basePayload, id: (result as unknown as { id: string }).id, createdAt: new Date((result as unknown as { createdAt: string }).createdAt) },
      });
    }

    showToast({
      type: "success",
      title: transaction ? "Transaksi diperbarui" : mode === "cash_withdrawal" ? "Tarik tunai tercatat" : "Transaksi tersimpan",
      message: `${formatRupiah(numericAmount)} berhasil disimpan dan saldo rekening telah diperbarui.`,
    });
    onClose();
  }

  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-rule px-5 py-5">
        <div>
          <p className="eyebrow">{transaction ? "Perbaiki catatan" : "Catatan baru"}</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-ink">{transaction ? "Edit transaksi" : "Tambah transaksi"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {transaction ? "Ubah detail tanpa menghapus riwayat catatan." : "Lengkapi detailnya dalam satu panel."}
          </p>
        </div>
        <IconButton type="button" variant="soft" aria-label="Tutup form transaksi" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-2 rounded-[18px] bg-paper p-1.5 sm:grid-cols-4">
          {transactionTypes.map((item) => {
            const Icon = item.icon;
            const active = mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => chooseMode(item.value)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[14px] border px-1 text-[10px] font-extrabold transition-all",
                  active ? `${item.tone} shadow-sm` : "border-transparent text-ink-muted hover:bg-white hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {mode === "cash_withdrawal" ? (
          <div className="rounded-[16px] border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800">
            Saldo dipindahkan dari rekening sumber ke akun tunai. Catatan ini tidak dihitung sebagai pemasukan atau pengeluaran.
          </div>
        ) : null}

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
            <button key={value} type="button" onClick={() => setAmount(String(numericAmount + value))} className="rounded-full border border-rule bg-white px-3 py-1.5 text-[11px] font-bold text-ink-muted transition hover:border-pine/35 hover:bg-pine-10 hover:text-pine">
              +{value >= 1_000_000 ? `${value / 1_000_000} jt` : `${value / 1_000} rb`}
            </button>
          ))}
        </div>

        <Field label={isTransfer ? "Rekening sumber" : "Rekening"} required>
          <div className="relative">
            <WalletCards className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Select value={resolvedAccountId} onChange={(event) => { setAccountId(event.target.value); if (event.target.value === destinationAccountId) setDestinationAccountId(""); }} className="pl-10">
              {sourceOptions.map((account) => <option key={account.id} value={account.id}>{account.name} · {formatRupiah(account.balance)}</option>)}
            </Select>
          </div>
        </Field>

        {isTransfer ? (
          <Field label={mode === "cash_withdrawal" ? "Masuk ke akun tunai" : "Rekening tujuan"} required>
            {destinationOptions.length ? (
              <div className="relative">
                <ArrowLeftRight className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Select value={resolvedDestinationId} onChange={(event) => setDestinationAccountId(event.target.value)} className="pl-10">
                  {destinationOptions.map((account) => <option key={account.id} value={account.id}>{account.name} · {formatRupiah(account.balance)}</option>)}
                </Select>
              </div>
            ) : (
              <p className="rounded-[14px] border border-ember/20 bg-ember-10 p-3 text-xs text-ember">
                {mode === "cash_withdrawal" ? "Buat akun berjenis Uang tunai di Pengaturan terlebih dahulu." : "Tambahkan rekening lain agar transfer dapat dilakukan."}
              </p>
            )}
          </Field>
        ) : (
          <Field label="Kategori">
            <Select value={resolvedCategoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Pilih kategori</option>
              {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </Field>
        )}

        <Field label="Tanggal transaksi">
          <DatePicker value={date} onValueChange={setDate} />
        </Field>

        <Field label="Catatan" hint={`${note.length}/80`}>
          <div className="relative">
            <ReceiptText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
            <textarea value={note} maxLength={80} onChange={(event) => setNote(event.target.value)} placeholder="Contoh: makan siang bersama tim" className="min-h-24 w-full resize-none rounded-[16px] border border-rule bg-white py-3 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-pine focus:ring-2 focus:ring-pine/15" />
          </div>
        </Field>

        {transaction?.createdAt ? (
          <p className="text-[11px] text-ink-muted">
            Dicatat pada {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(transaction.createdAt))}
          </p>
        ) : null}
      </div>

      <footer className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-rule bg-white/95 p-4 backdrop-blur">
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="submit" loading={submitting} disabled={connection.status === "loading" || !accounts.length || (isTransfer && !destinationOptions.length)}>
          <Check className="h-4 w-4" /> {transaction ? "Simpan perubahan" : "Simpan transaksi"}
        </Button>
      </footer>
    </form>
  );
}
