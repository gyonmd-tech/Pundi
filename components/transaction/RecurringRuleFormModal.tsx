"use client";

/**
 * components/transaction/RecurringRuleFormModal.tsx
 * Formulir tambah/ubah aturan transaksi berulang. Dipisah dari
 * RecurringRulesCard agar baru diunduh saat formulir dibuka.
 */

import React, { useState } from "react";
import { useApp, useAccounts, useCategories } from "@/lib/data/store";
import { formatDate } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { createRecurringRuleAction, updateRecurringRuleAction } from "@/actions/recurring";
import type { RecurringRule, TransactionType, RecurringFrequency } from "@/lib/data/mock";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { frequencyLabel } from "./recurringLabels";

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

export function RecurringRuleFormModal({ editRule, onClose }: { editRule: RecurringRule | null; onClose: () => void }) {
  const { dispatch } = useApp();
  const accounts = useAccounts();
  const categories = useCategories();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(() => (editRule ? formFromRule(editRule) : emptyForm(accounts[0]?.id || "")));
  const [submitting, setSubmitting] = useState(false);
  const relevantCategories = categories.filter((c) => c.type === (form.type === "income" ? "income" : "expense"));
  const setShowForm = (open: boolean) => { if (!open) onClose(); };

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

  return (
    <Modal
        open
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
  );
}
