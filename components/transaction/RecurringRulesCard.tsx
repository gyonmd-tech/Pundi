"use client";

/**
 * components/transaction/RecurringRulesCard.tsx
 * Kartu "Transaksi Berulang" di halaman Buku Transaksi — daftar aturan
 * (gaji, langganan, tagihan rutin), form tambah/edit lewat Modal bersama,
 * serta aksi jeda/lanjutkan dan hapus. Transaksi nyata dibuat otomatis oleh
 * actions/bootstrap.ts saat data dimuat (lihat catatan di sana).
 */

import React, { useState } from "react";
import { Repeat, Plus, Pencil, Trash2, Pause, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useApp, useRecurringRules, useAccounts, useCategories, useGoals } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import {
  createRecurringRuleAction,
  updateRecurringRuleAction,
  toggleRecurringRuleAction,
  deleteRecurringRuleAction,
} from "@/actions/recurring";
import type { RecurringRule, TransactionType, RecurringFrequency } from "@/lib/data/mock";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils/cn";

const frequencyLabel: Record<RecurringFrequency, string> = {
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

interface FormState {
  type: TransactionType;
  accountId: string;
  destinationAccountId: string;
  categoryId: string;
  amount: string;
  note: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string;
}

function emptyForm(defaultAccountId: string): FormState {
  return {
    type: "expense",
    accountId: defaultAccountId,
    destinationAccountId: "",
    categoryId: "",
    amount: "",
    note: "",
    frequency: "monthly",
    startDate: toDateInputValue(new Date()),
    endDate: "",
  };
}

function formFromRule(rule: RecurringRule): FormState {
  return {
    type: rule.type,
    accountId: rule.accountId,
    destinationAccountId: rule.destinationAccountId || "",
    categoryId: rule.categoryId || "",
    amount: String(rule.amount),
    note: rule.note || "",
    frequency: rule.frequency,
    startDate: toDateInputValue(rule.startDate),
    endDate: rule.endDate ? toDateInputValue(rule.endDate) : "",
  };
}

export function RecurringRulesCard() {
  const { dispatch } = useApp();
  const rules = useRecurringRules();
  const accounts = useAccounts();
  const categories = useCategories();
  const goals = useGoals();
  const { showToast } = useToast();

  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<RecurringRule | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(accounts[0]?.id || ""));
  const [submitting, setSubmitting] = useState(false);

  const relevantCategories = categories.filter((c) => c.type === (form.type === "income" ? "income" : "expense"));

  function openCreate() {
    setEditRule(null);
    setForm(emptyForm(accounts[0]?.id || ""));
    setShowForm(true);
  }

  function openEdit(rule: RecurringRule) {
    setEditRule(rule);
    setForm(formFromRule(rule));
    setShowForm(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount.replace(/\D/g, ""));
    if (!form.accountId) {
      showToast({ type: "error", title: "Pilih akun", message: "Akun sumber wajib dipilih." });
      return;
    }
    if (!amount || amount <= 0) {
      showToast({ type: "error", title: "Nominal tidak valid", message: "Masukkan nominal lebih dari 0." });
      return;
    }
    if (form.type === "transfer" && !form.destinationAccountId) {
      showToast({ type: "error", title: "Pilih akun tujuan", message: "Transfer berulang butuh akun tujuan." });
      return;
    }

    setSubmitting(true);
    const payload = {
      accountId: form.accountId,
      destinationAccountId: form.type === "transfer" ? form.destinationAccountId : undefined,
      categoryId: form.type !== "transfer" ? form.categoryId || undefined : undefined,
      type: form.type,
      amount,
      note: form.note.trim() || undefined,
      frequency: form.frequency,
      startDate: new Date(`${form.startDate}T09:00:00`),
      endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`) : undefined,
    };

    const result = editRule
      ? await updateRecurringRuleAction({ ...payload, id: editRule.id, isActive: editRule.isActive })
      : await createRecurringRuleAction(payload);

    setSubmitting(false);

    if (!result.success) {
      showToast({ type: "error", title: "Aturan gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }

    const generatedId = (result as { id?: string }).id;
    const rule: RecurringRule = {
      id: editRule?.id || generatedId || "",
      ...payload,
      nextOccurrence: payload.startDate,
      isActive: editRule?.isActive ?? true,
    };
    dispatch({ type: editRule ? "UPDATE_RECURRING_RULE" : "ADD_RECURRING_RULE", payload: rule });
    setShowForm(false);
    showToast({
      type: "success",
      title: editRule ? "Aturan Diperbarui" : "Aturan Dibuat",
      message: `${form.note || "Transaksi berulang"} — ${frequencyLabel[form.frequency].toLowerCase()}, berikutnya ${formatDate(payload.startDate, "short")}.`,
    });
  }

  async function toggleActive(rule: RecurringRule) {
    const nextActive = !rule.isActive;
    const result = await toggleRecurringRuleAction(rule.id, nextActive);
    if (!result.success) {
      showToast({ type: "error", title: "Gagal mengubah status", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "UPDATE_RECURRING_RULE", payload: { ...rule, isActive: nextActive } });
  }

  async function remove(rule: RecurringRule) {
    const result = await deleteRecurringRuleAction(rule.id);
    if (!result.success) {
      showToast({ type: "error", title: "Aturan gagal dihapus", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_RECURRING_RULE", payload: rule.id });
    showToast({ type: "info", title: "Aturan Dihapus", message: "Transaksi yang sudah terbentuk sebelumnya tetap tersimpan." });
  }

  return (
    <div className="card border-brand-600/10 bg-white !p-0">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-[13px] bg-brand-100 text-brand-700">
            <Repeat size={16} />
          </div>
          <div className="text-left">
            <p className="text-body font-bold text-ink">Transaksi Berulang</p>
            <p className="text-xs text-ink-muted">{rules.length === 0 ? "Belum ada aturan" : `${rules.filter((r) => r.isActive).length} aktif dari ${rules.length} aturan`}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-rule px-4 py-4 sm:px-5">
          <div className="space-y-2">
            {rules.map((rule) => {
              const account = accounts.find((a) => a.id === rule.accountId);
              const category = categories.find((c) => c.id === rule.categoryId);
              const goal = rule.goalId ? goals.find((g) => g.id === rule.goalId) : undefined;
              return (
                <div key={rule.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[14px] border border-rule px-3.5 py-3 sm:flex-nowrap", !rule.isActive && "opacity-55")}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CategoryIcon icon={category?.icon} color={category?.color} size={15} containerSize="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-small font-semibold text-ink">{rule.note || category?.name || "Transaksi berulang"}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {account?.name ?? "—"} · {frequencyLabel[rule.frequency]} · Berikutnya {formatDate(rule.nextOccurrence, "short")}
                        {goal ? <> · <span className="font-semibold text-pine">Tujuan: {goal.name}</span></> : null}
                      </p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 tabular-nums font-mono text-small font-bold", rule.type === "income" ? "text-mint-ink" : "text-ink")}>
                    {rule.type === "income" ? "+" : rule.type === "expense" ? "−" : ""}{formatRupiah(rule.amount)}
                  </span>
                  <div className="flex w-full shrink-0 items-center justify-end gap-2 border-t border-rule pt-2.5 sm:w-auto sm:border-0 sm:pt-0">
                    {!rule.isActive && <Badge tone="neutral" className="text-[10px]">Dijeda</Badge>}
                    <IconButton variant="outline" className="h-8 min-h-8 w-8" onClick={() => toggleActive(rule)} aria-label={rule.isActive ? "Jeda aturan" : "Lanjutkan aturan"} title={rule.isActive ? "Jeda" : "Lanjutkan"}>
                      {rule.isActive ? <Pause size={14} /> : <Play size={14} />}
                    </IconButton>
                    <IconButton variant="outline" className="h-8 min-h-8 w-8" onClick={() => openEdit(rule)} aria-label="Edit aturan" title="Edit">
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton variant="outline" className="h-8 min-h-8 w-8" onClick={() => remove(rule)} aria-label="Hapus aturan" title="Hapus">
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={openCreate}>
            <Plus size={15} /> Tambah aturan
          </Button>
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editRule ? "Ubah aturan berulang" : "Aturan berulang baru"}
        description="Transaksi akan dibuat otomatis saat kamu membuka Pundi pada atau setelah tanggal jatuh tempo."
      >
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Jenis">
            <Select
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as TransactionType, categoryId: "" }))}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer</option>
            </Select>
          </Field>

          <Field label="Akun sumber">
            <Select value={form.accountId} onChange={(e) => setForm((s) => ({ ...s, accountId: e.target.value }))}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Field>

          {form.type === "transfer" ? (
            <Field label="Akun tujuan">
              <Select value={form.destinationAccountId} onChange={(e) => setForm((s) => ({ ...s, destinationAccountId: e.target.value }))}>
                <option value="">Pilih akun tujuan</option>
                {accounts.filter((a) => a.id !== form.accountId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </Field>
          ) : (
            <Field label="Kategori" hint="Opsional">
              <Select value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}>
                <option value="">Tanpa kategori</option>
                {relevantCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          )}

          <Field label="Nominal" required>
            <Input
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value.replace(/\D/g, "") }))}
              placeholder="0"
            />
          </Field>

          <Field label="Catatan" hint="Opsional">
            <Input value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} placeholder="Mis. Langganan Spotify" maxLength={80} />
          </Field>

          <Field label="Frekuensi">
            <Select value={form.frequency} onChange={(e) => setForm((s) => ({ ...s, frequency: e.target.value as RecurringFrequency }))}>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mulai">
              <DatePicker value={form.startDate} onValueChange={(value) => setForm((s) => ({ ...s, startDate: value }))} ariaLabel="Tanggal mulai" />
            </Field>
            <Field label="Berakhir" hint="Opsional">
              <DatePicker value={form.endDate} onValueChange={(value) => setForm((s) => ({ ...s, endDate: value }))} min={form.startDate} ariaLabel="Tanggal berakhir" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" loading={submitting}>{editRule ? "Simpan perubahan" : "Buat aturan"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
