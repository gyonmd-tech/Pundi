"use client";

/**
 * components/tujuan/GoalContributionModal.tsx
 * Form atur/ubah kontribusi otomatis ke tujuan tabungan — membuat/mengubah
 * satu recurring rule bertipe "expense" dengan goalId terisi. Transaksi
 * nyata & kenaikan currentAmount goal dibuat otomatis oleh
 * generateDueRecurringTransactions di actions/bootstrap.ts saat app dibuka.
 */

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useApp, useAccounts } from "@/lib/data/store";
import { useToast } from "@/lib/context/ToastContext";
import type { Goal, RecurringFrequency, RecurringRule } from "@/lib/data/mock";
import { createRecurringRuleAction, updateRecurringRuleAction } from "@/actions/recurring";
import { formatDate } from "@/lib/utils/formatter";

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

interface GoalContributionModalProps {
  open: boolean;
  goal: Goal;
  rule: RecurringRule | null;
  onClose: () => void;
}

export function GoalContributionModal({ open, goal, rule, onClose }: GoalContributionModalProps) {
  const { dispatch } = useApp();
  const accounts = useAccounts();
  const { showToast } = useToast();

  const [accountId, setAccountId] = useState(rule?.accountId || accounts[0]?.id || "");
  const [amount, setAmount] = useState(rule ? String(rule.amount) : "");
  const [frequency, setFrequency] = useState<RecurringFrequency>(rule?.frequency || "monthly");
  const [startDate, setStartDate] = useState(toDateInputValue(rule?.startDate || new Date()));
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const amountValue = Number(amount.replace(/\D/g, ""));
    if (!accountId) {
      showToast({ type: "error", title: "Pilih akun", message: "Akun sumber wajib dipilih." });
      return;
    }
    if (!amountValue || amountValue <= 0) {
      showToast({ type: "error", title: "Nominal tidak valid", message: "Masukkan nominal lebih dari 0." });
      return;
    }

    setSubmitting(true);
    const payload = {
      accountId,
      goalId: goal.id,
      type: "expense" as const,
      amount: amountValue,
      note: `Sisihkan ke ${goal.name}`,
      frequency,
      startDate: new Date(`${startDate}T09:00:00`),
    };

    const result = rule
      ? await updateRecurringRuleAction({ ...payload, id: rule.id, isActive: rule.isActive })
      : await createRecurringRuleAction(payload);
    setSubmitting(false);

    if (!result.success) {
      showToast({ type: "error", title: "Kontribusi otomatis gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }

    const generatedId = (result as { id?: string }).id;
    const saved: RecurringRule = {
      id: rule?.id || generatedId || "",
      ...payload,
      nextOccurrence: payload.startDate,
      isActive: rule?.isActive ?? true,
    };
    dispatch({ type: rule ? "UPDATE_RECURRING_RULE" : "ADD_RECURRING_RULE", payload: saved });
    showToast({
      type: "success",
      title: rule ? "Kontribusi Diperbarui" : "Kontribusi Otomatis Dibuat",
      message: `Rp ${amountValue.toLocaleString("id-ID")} ke ${goal.name} setiap ${frequency === "weekly" ? "minggu" : frequency === "monthly" ? "bulan" : "tahun"}, mulai ${formatDate(payload.startDate, "short")}.`,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rule ? "Ubah kontribusi otomatis" : "Sisihkan otomatis"}
      description={`Sebagian saldo akun sumber akan otomatis dianggap sebagai tabungan untuk "${goal.name}" — currentAmount goal ini naik otomatis setiap kali kontribusi terbentuk.`}
    >
      <form onSubmit={submit} className="space-y-4 p-5">
        <Field label="Akun sumber">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </Field>

        <Field label="Nominal per periode" required>
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
          />
        </Field>

        <Field label="Frekuensi">
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </Select>
        </Field>

        <Field label="Mulai">
          <DatePicker value={startDate} onValueChange={setStartDate} ariaLabel="Tanggal mulai" />
        </Field>

        <div className="flex justify-end gap-2 border-t border-rule pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={submitting}>{rule ? "Simpan perubahan" : "Aktifkan"}</Button>
        </div>
      </form>
    </Modal>
  );
}
