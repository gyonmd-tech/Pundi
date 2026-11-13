"use client";

/**
 * components/budget/BudgetTransferSheet.tsx
 * Pindahkan jatah dari satu anggaran ke anggaran lain di siklus berjalan.
 * Hanya batas belanja yang bergeser — saldo rekening tidak berubah.
 * Pemindahan di siklus ini bisa dibatalkan dari daftar di bawah form.
 */
import { useMemo, useState } from "react";
import { ArrowDown, Check, Undo2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp, useBudgetTransfers, useBudgets, useCategories, usePreferences, useTransactions } from "@/lib/data/store";
import { createBudgetTransferAction, deleteBudgetTransferAction } from "@/actions/budgetTransfers";
import { useToast } from "@/lib/context/ToastContext";
import { activeBudgetPaces, CADENCE_LABEL } from "@/lib/utils/budgetPace";
import { cycleFor } from "@/lib/utils/budgetCycle";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Anggaran penerima (mis. yang lewat jatah). */
  toBudgetId?: string;
  /** Anggaran pemberi yang disarankan. */
  fromBudgetId?: string;
}

const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

export function BudgetTransferSheet({ open, onClose, toBudgetId, fromBudgetId }: Props) {
  if (!open) return null;
  return <SheetBody onClose={onClose} initialTo={toBudgetId} initialFrom={fromBudgetId} />;
}

function SheetBody({ onClose, initialTo, initialFrom }: { onClose: () => void; initialTo?: string; initialFrom?: string }) {
  const { dispatch } = useApp();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const transfers = useBudgetTransfers();
  const preferences = usePreferences();
  const { showToast } = useToast();
  const cycleDay = preferences.budgetCycleDay ?? 1;

  const now = useMemo(() => new Date(), []);
  const cycle = useMemo(() => cycleFor(now, cycleDay), [now, cycleDay]);
  const rows = useMemo(() => activeBudgetPaces(budgets, transactions, { now, cycleDay, transfers }).map(({ budget, pace }) => ({
    id: budget.id,
    name: categories.find((category) => category.id === budget.categoryId)?.name ?? "Kategori",
    pace,
    remaining: pace.monthLimit - pace.monthSpent,
  })), [budgets, transactions, now, cycleDay, transfers, categories]);

  const firstOver = rows.find((row) => row.pace.unitRemaining < 0);
  const [toId, setToId] = useState(initialTo ?? firstOver?.id ?? rows[0]?.id ?? "");
  const [chosenFrom, setFromId] = useState(initialFrom ?? "");
  // Pemberi: pilihan pengguna, atau anggaran dengan sisa terbesar selain penerima.
  const bestDonor = rows.filter((row) => row.id !== toId).sort((a, b) => b.remaining - a.remaining)[0];
  const fromId = chosenFrom && chosenFrom !== toId && rows.some((row) => row.id === chosenFrom) ? chosenFrom : bestDonor?.id ?? "";
  const to = rows.find((row) => row.id === toId);
  const from = rows.find((row) => row.id === fromId);
  const shortfall = to && to.pace.unitRemaining < 0 ? Math.abs(to.pace.unitRemaining) : 0;
  const [amount, setAmount] = useState(String(shortfall || 50_000));
  const [saving, setSaving] = useState(false);
  const value = Number(amount || 0);
  const fromRemaining = Math.max(0, from?.remaining ?? 0);
  const tooMuch = value > fromRemaining;
  const canSave = Boolean(to && from && to.id !== from.id && value > 0 && !tooMuch);

  const presets = [
    ...(shortfall ? [{ label: `Tutup ${formatRupiah(shortfall)}`, value: shortfall }] : []),
    { label: "Rp 50.000", value: 50_000 },
    { label: "Rp 100.000", value: 100_000 },
    ...(fromRemaining > 0 ? [{ label: "Semua sisa", value: fromRemaining }] : []),
  ];

  const cycleTransfers = transfers.filter((transfer) => {
    if (transfer.kind === "goal") return false;
    const date = new Date(transfer.date);
    return date >= cycle.start && date <= new Date(cycle.end.getFullYear(), cycle.end.getMonth(), cycle.end.getDate(), 23, 59, 59);
  });
  const nameOf = (id: string) => rows.find((row) => row.id === id)?.name ?? categories.find((category) => category.id === budgets.find((budget) => budget.id === id)?.categoryId)?.name ?? "Anggaran";

  async function save() {
    if (!canSave || !to || !from) return;
    setSaving(true);
    const date = new Date();
    const result = await createBudgetTransferAction({ fromBudgetId: from.id, toBudgetId: to.id, amount: value, date });
    setSaving(false);
    if (!result.success || !result.id) {
      showToast({ type: "error", title: "Jatah gagal dipindahkan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "ADD_BUDGET_TRANSFER", payload: { id: result.id, fromBudgetId: from.id, toBudgetId: to.id, amount: value, date } });
    showToast({ type: "success", title: "Jatah dipindahkan", message: `${formatRupiah(value)} dari ${from.name} ke ${to.name}. Bisa dibatalkan di sini.` });
    onClose();
  }

  async function undo(id: string) {
    const result = await deleteBudgetTransferAction(id);
    if (!result.success) {
      showToast({ type: "error", title: "Gagal dibatalkan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_BUDGET_TRANSFER", payload: id });
    showToast({ type: "info", title: "Pemindahan dibatalkan" });
  }

  const selectClass = "mt-1 h-12 w-full rounded-sm border border-rule-strong bg-surface-high px-3 text-[15px] font-semibold text-ink";

  return (
    <Modal open onClose={() => { if (!saving) onClose(); }} title="Pindahkan jatah" description="Hanya batas belanja yang digeser. Saldo rekening tidak berubah." className="sm:max-w-md">
      <div className="space-y-4 px-5 py-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
            Ambil dari
            <select value={fromId} onChange={(event) => setFromId(event.target.value)} className={selectClass}>
              {rows.filter((row) => row.id !== toId).map((row) => (
                <option key={row.id} value={row.id}>{row.name} · sisa {formatRupiah(Math.max(0, row.remaining))}</option>
              ))}
            </select>
          </label>
          <div className="my-2 flex justify-center" aria-hidden><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-950 text-white"><ArrowDown className="h-4 w-4" /></span></div>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
            Tambahkan ke
            <select value={toId} onChange={(event) => setToId(event.target.value)} className={selectClass}>
              {rows.map((row) => (
                <option key={row.id} value={row.id}>{row.name}{row.pace.unitRemaining < 0 ? ` · lewat ${formatRupiah(Math.abs(row.pace.unitRemaining))}` : ""}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="flex min-h-16 items-center gap-2 rounded-card border-2 border-ink bg-surface-high px-4">
            <span className="text-lg font-bold text-ink-muted">Rp</span>
            <input
              inputMode="numeric"
              aria-label="Nominal yang dipindahkan"
              data-bare-input="true"
              value={amount ? Number(amount).toLocaleString("id-ID") : ""}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 12))}
              className="min-w-0 flex-1 bg-transparent font-display text-[2rem] font-semibold tabular-nums text-ink outline-none"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button key={preset.label} type="button" aria-pressed={value === preset.value} onClick={() => setAmount(String(preset.value))} className={cn("min-h-10 rounded-sm px-3 text-sm font-bold tabular-nums transition", value === preset.value ? "bg-brand-950 text-white" : "border border-rule-strong text-ink hover:border-brand-400")}>
                {preset.label}
              </button>
            ))}
          </div>
          {tooMuch ? <p role="alert" className="mt-2 text-sm font-semibold text-ember-ink">Maksimal {formatRupiah(fromRemaining)} — sisa jatah {from?.name} siklus ini.</p> : null}
        </div>

        {to && from && value > 0 && !tooMuch ? (
          <dl className="grid grid-cols-2 gap-2 rounded-sm bg-surface-soft p-3 text-sm">
            <div><dt className="text-xs font-semibold text-ink-muted">{from.name} jadi</dt><dd className="mt-0.5 font-bold tabular-nums text-ink">Sisa {formatRupiah(fromRemaining - value)}</dd></div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">{to.name} {CADENCE_LABEL[to.pace.cadence].current}</dt>
              <dd className={cn("mt-0.5 font-bold tabular-nums", to.pace.unitRemaining + value >= 0 ? "text-mint-ink" : "text-ember-ink")}>
                {to.pace.unitRemaining + value >= 0 ? `Sisa ${formatRupiah(to.pace.unitRemaining + value)}` : `Masih lewat ${formatRupiah(Math.abs(to.pace.unitRemaining + value))}`}
              </dd>
            </div>
          </dl>
        ) : null}

        {cycleTransfers.length > 0 ? (
          <section aria-labelledby="transfer-history-title" className="border-t border-rule pt-3">
            <h3 id="transfer-history-title" className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Pemindahan siklus ini</h3>
            <ul className="mt-1">
              {cycleTransfers.slice(0, 5).map((transfer) => (
                <li key={transfer.id} className="flex min-h-12 items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-ink">{formatRupiah(transfer.amount)} · {nameOf(transfer.fromBudgetId)} → {nameOf(transfer.toBudgetId)} · {shortDate.format(new Date(transfer.date))}</span>
                  <button type="button" onClick={() => undo(transfer.id)} className="inline-flex min-h-10 items-center gap-1 rounded-sm px-2 text-sm font-bold text-brand-700 hover:bg-surface-soft" aria-label={`Batalkan pemindahan ${formatRupiah(transfer.amount)}`}><Undo2 className="h-4 w-4" />Batalkan</button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <footer className="sticky bottom-0 flex gap-3 border-t border-rule bg-surface-high px-5 py-4 pb-[max(1rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] sm:pb-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        <Button type="button" className="flex-1" loading={saving} disabled={!canSave} onClick={save}><Check className="h-4 w-4" />Pindahkan {value > 0 ? formatRupiah(value) : ""}</Button>
      </footer>
    </Modal>
  );
}
