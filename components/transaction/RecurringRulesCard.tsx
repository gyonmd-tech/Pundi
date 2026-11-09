"use client";

/**
 * components/transaction/RecurringRulesCard.tsx
 * Kartu "Transaksi Berulang" di halaman Buku Transaksi — daftar aturan
 * (gaji, langganan, tagihan rutin), form tambah/edit lewat Modal bersama,
 * serta aksi jeda/lanjutkan dan hapus. Transaksi nyata dibuat otomatis oleh
 * actions/bootstrap.ts saat data dimuat (lihat catatan di sana).
 */

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { frequencyLabel } from "./recurringLabels";
import { Repeat, Plus, Pencil, Trash2, Pause, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useApp, useRecurringRules, useAccounts, useCategories, useGoals } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import {
  toggleRecurringRuleAction,
  deleteRecurringRuleAction,
} from "@/actions/recurring";
import type { RecurringRule } from "@/lib/data/mock";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils/cn";

// Formulir diunduh saat dibuka (±13 KB bersama Select & DatePicker).
const RecurringRuleFormModal = dynamic(() => import("./RecurringRuleFormModal").then((m) => m.RecurringRuleFormModal), { ssr: false });

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

  function openCreate() {
    setEditRule(null);
    setShowForm(true);
  }

  function openEdit(rule: RecurringRule) {
    setEditRule(rule);
    setShowForm(true);
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
    <div className="card border-brand-600/10 bg-surface-high !p-0">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-sm bg-brand-100 text-brand-700">
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
                <div key={rule.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-sm border border-rule px-3.5 py-3 sm:flex-nowrap", !rule.isActive && "opacity-55")}>
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
                    <IconButton variant="outline" className="h-10 min-h-10 w-10 sm:h-8 sm:min-h-8 sm:w-8" onClick={() => toggleActive(rule)} aria-label={rule.isActive ? "Jeda aturan" : "Lanjutkan aturan"} title={rule.isActive ? "Jeda" : "Lanjutkan"}>
                      {rule.isActive ? <Pause size={14} /> : <Play size={14} />}
                    </IconButton>
                    <IconButton variant="outline" className="h-10 min-h-10 w-10 sm:h-8 sm:min-h-8 sm:w-8" onClick={() => openEdit(rule)} aria-label="Edit aturan" title="Edit">
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton variant="outline" className="h-10 min-h-10 w-10 sm:h-8 sm:min-h-8 sm:w-8" onClick={() => remove(rule)} aria-label="Hapus aturan" title="Hapus">
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

      {showForm ? <RecurringRuleFormModal key={editRule?.id ?? "baru"} editRule={editRule} onClose={() => setShowForm(false)} /> : null}
    </div>
  );
}
