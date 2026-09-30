"use client";

/**
 * app/(app)/catatan-kondisi/page.tsx
 * Rekonsiliasi saldo untuk SEMUA akun sekaligus dalam satu tanggal — untuk
 * kondisi "lupa mencatat beberapa hari terakhir". Memanggil
 * createBalanceAdjustmentAction (actions/transactions.ts) satu kali per
 * akun yang datanya diisi, bukan aksi baru — halaman ini murni UI massal
 * di atas aksi satu-akun yang sudah ada dan sudah diuji lewat QuickAddPanel.
 */

import React, { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useApp, useAccounts, useTransactions } from "@/lib/data/store";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { createBalanceAdjustmentAction } from "@/actions/transactions";
import { computeObservedDelta } from "@/lib/utils/balanceReconciliation";
import { cn } from "@/lib/utils/cn";

type RowStatus = "idle" | "pending" | "success" | "error";

export default function CatatanKondisiPage() {
  const accounts = useAccounts().filter((account) => account.isActive);
  const transactions = useTransactions();
  const { dispatch, connection } = useApp();
  const { showToast } = useToast();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [submitting, setSubmitting] = useState(false);

  function setValue(accountId: string, raw: string) {
    setValues((current) => ({ ...current, [accountId]: raw.replace(/\D/g, "") }));
    setStatuses((current) => ({ ...current, [accountId]: "idle" }));
  }

  const dirtyAccountIds = accounts
    .filter((account) => values[account.id] !== undefined && values[account.id] !== "")
    .map((account) => account.id);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirtyAccountIds.length) {
      showToast({ type: "info", title: "Belum ada perubahan", message: "Isi saldo nyata untuk akun yang ingin direkonsiliasi." });
      return;
    }

    setSubmitting(true);
    const selectedDate = new Date(`${date}T23:59:59.999`);
    let successCount = 0;
    let failCount = 0;

    for (const accountId of dirtyAccountIds) {
      setStatuses((current) => ({ ...current, [accountId]: "pending" }));
      const account = accounts.find((item) => item.id === accountId);
      const observedBalance = Number(values[accountId]);

      if (!account || !Number.isSafeInteger(observedBalance) || observedBalance < 0) {
        setStatuses((current) => ({ ...current, [accountId]: "error" }));
        failCount += 1;
        continue;
      }

      const localDelta = computeObservedDelta(transactions, accountId, account.balance, observedBalance, selectedDate);
      const result = await createBalanceAdjustmentAction({
        accountId,
        observedBalance,
        date: selectedDate,
      });

      if (!result.success) {
        setStatuses((current) => ({ ...current, [accountId]: "error" }));
        failCount += 1;
        continue;
      }

      const adjustmentResult = result as { id: string; createdAt: string; delta: number; newBalance: number };
      const delta = connection.mode === "demo" ? localDelta : adjustmentResult.delta;
      const newBalance = connection.mode === "demo" ? account.balance + localDelta : adjustmentResult.newBalance;

      dispatch({ type: "UPDATE_ACCOUNT", payload: { ...account, balance: newBalance } });
      dispatch({
        type: "ADD_TRANSACTION",
        payload: {
          id: adjustmentResult.id,
          accountId,
          type: delta < 0 ? "expense" : "income",
          amount: Math.abs(delta),
          date: selectedDate,
          createdAt: new Date(adjustmentResult.createdAt),
          note: "Penyesuaian saldo berdasarkan kondisi nyata",
          tags: ["rekonsiliasi-saldo"],
          recordKind: "balance_adjustment",
          observedBalance,
        },
      });
      setStatuses((current) => ({ ...current, [accountId]: "success" }));
      successCount += 1;
    }

    setSubmitting(false);
    setValues({});

    if (failCount === 0) {
      showToast({ type: "success", title: "Kondisi keuangan diperbarui", message: `${successCount} akun berhasil direkonsiliasi ke kondisi ${new Date(date).toLocaleDateString("id-ID")}.` });
    } else {
      showToast({ type: successCount > 0 ? "info" : "error", title: "Sebagian gagal diproses", message: `${successCount} berhasil, ${failCount} gagal — akun yang gagal tetap memakai saldo lama, coba lagi untuk akun itu saja.` });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title flex items-center gap-2"><ClipboardCheck size={22} className="text-pine" /> Catatan Kondisi</h1>
        <p className="mt-0.5 text-xs sm:text-small text-ink-muted">
          Lupa mencatat beberapa hari terakhir? Masukkan saldo nyata tiap akun hari ini — Pundi menghitung selisihnya secara otomatis sebagai penyesuaian, tanpa mengubah riwayat transaksi yang sudah ada.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <form onSubmit={submit} className="space-y-4">
          <div className="max-w-xs">
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Tanggal kondisi</label>
            <DatePicker value={date} onValueChange={setDate} max={new Date().toISOString().slice(0, 10)} ariaLabel="Tanggal kondisi saldo" />
          </div>

          <div className="divide-y divide-rule rounded-[16px] border border-rule">
            {accounts.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-muted">Belum ada akun aktif untuk direkonsiliasi.</p>
            ) : accounts.map((account) => {
              const status = statuses[account.id] || "idle";
              const value = values[account.id] ?? "";
              const observed = value ? Number(value) : null;
              const delta = observed != null
                ? computeObservedDelta(transactions, account.id, account.balance, observed, new Date(`${date}T23:59:59.999`))
                : null;

              return (
                <div key={account.id} className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="h-8 w-2 shrink-0 rounded-full" style={{ backgroundColor: account.colorTag }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{account.name}</p>
                      <p className="text-xs text-ink-muted">Tercatat: {formatRupiah(account.balance)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:w-64">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">Rp</span>
                      <Input
                        inputMode="numeric"
                        value={value ? Number(value).toLocaleString("id-ID") : ""}
                        onChange={(event) => setValue(account.id, event.target.value)}
                        placeholder="Tidak berubah"
                        className="pl-9"
                      />
                    </div>
                    {status === "pending" && <Loader2 size={16} className="animate-spin text-ink-muted" />}
                    {status === "success" && <CheckCircle2 size={16} className="text-mint" />}
                    {status === "error" && <XCircle size={16} className="text-ember" />}
                  </div>

                  {delta != null && (
                    <p className={cn("shrink-0 text-xs font-bold tabular-nums sm:w-32 sm:text-right", delta >= 0 ? "text-mint-ink" : "text-ember-ink")}>
                      {delta >= 0 ? "+" : "−"}{formatRupiah(Math.abs(delta))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-rule pt-4">
            <p className="text-xs text-ink-muted">{dirtyAccountIds.length} akun akan diperbarui</p>
            <Button type="submit" loading={submitting} disabled={!dirtyAccountIds.length}>
              Terapkan kondisi terkini
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
