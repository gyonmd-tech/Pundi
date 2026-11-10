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
import { Repeat, Plus, Pencil, Trash2, Pause, Play, ChevronDown } from "lucide-react";
import { useApp, useRecurringRules, useAccounts, useCategories, useGoals } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import {
  toggleRecurringRuleAction,
  deleteRecurringRuleAction,
} from "@/actions/recurring";
import type { RecurringRule } from "@/lib/data/mock";
import { Button, IconButton } from "@/components/ui/Button";
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

  // Di ponsel tertutup secara default agar daftar transaksi tidak terdorong jauh ke bawah.
  const [expanded, setExpanded] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches);
  const [openRuleId, setOpenRuleId] = useState<string | null>(null);
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

  const activeRules = rules.filter((rule) => rule.isActive);
  const monthlyOut = activeRules.filter((rule) => rule.type === "expense").reduce((sum, rule) => sum + (rule.frequency === "weekly" ? rule.amount * 4.33 : rule.frequency === "yearly" ? rule.amount / 12 : rule.amount), 0);

  return (
    <section className="rounded-card border border-rule bg-surface-high shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xs bg-brand-100 text-brand-700"><Repeat size={16} /></span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">Transaksi berulang</span>
            <span className="block truncate text-xs text-ink-muted">
              {rules.length === 0 ? "Belum ada aturan" : <>{activeRules.length} aktif{monthlyOut > 0 ? <> · ±{formatRupiah(Math.round(monthlyOut))}/bulan keluar</> : null}</>}
            </span>
          </span>
        </span>
        <ChevronDown size={16} className={cn("shrink-0 text-ink-muted transition-transform duration-200", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-rule animate-in fade-in slide-in-from-top-1">
          <ul className="divide-y divide-rule">
            {rules.map((rule) => {
              const account = accounts.find((a) => a.id === rule.accountId);
              const category = categories.find((c) => c.id === rule.categoryId);
              const goal = rule.goalId ? goals.find((g) => g.id === rule.goalId) : undefined;
              const open = openRuleId === rule.id;
              const actions = (
                <>
                  <IconButton variant="ghost" className="h-9 min-h-9 w-9" onClick={() => toggleActive(rule)} aria-label={rule.isActive ? "Jeda aturan" : "Lanjutkan aturan"} title={rule.isActive ? "Jeda" : "Lanjutkan"}>
                    {rule.isActive ? <Pause size={15} /> : <Play size={15} />}
                  </IconButton>
                  <IconButton variant="ghost" className="h-9 min-h-9 w-9" onClick={() => openEdit(rule)} aria-label="Edit aturan" title="Ubah">
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton variant="ghost" className="h-9 min-h-9 w-9 hover:bg-ember-10 hover:text-ember-ink" onClick={() => remove(rule)} aria-label="Hapus aturan" title="Hapus">
                    <Trash2 size={15} />
                  </IconButton>
                </>
              );
              return (
                <li key={rule.id} className={cn("px-4 sm:px-5", !rule.isActive && "opacity-60")}>
                  <div className="flex items-center gap-3 py-3">
                    <button type="button" onClick={() => setOpenRuleId(open ? null : rule.id)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:cursor-default">
                      <CategoryIcon icon={category?.icon} color={category?.color} size={15} containerSize="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{rule.note || category?.name || "Transaksi berulang"}</span>
                        <span className="block truncate text-xs text-ink-muted">
                          {frequencyLabel[rule.frequency]} · {formatDate(rule.nextOccurrence, "short")} · {account?.name ?? "—"}
                          {goal ? <> · <span className="font-medium text-pine">{goal.name}</span></> : null}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={cn("block text-sm font-semibold tabular-nums", rule.type === "income" ? "text-mint-ink" : "text-ink")}>
                          {rule.type === "income" ? "+" : rule.type === "expense" ? "−" : ""}{formatRupiah(rule.amount)}
                        </span>
                        {!rule.isActive ? <span className="block text-[11px] text-ink-muted">Dijeda</span> : null}
                      </span>
                    </button>
                    <div className="hidden shrink-0 items-center sm:flex">{actions}</div>
                  </div>
                  {open ? <div className="-mt-1 flex justify-end gap-1 pb-2 sm:hidden animate-in fade-in slide-in-from-top-1">{actions}</div> : null}
                </li>
              );
            })}
          </ul>

          <div className="border-t border-rule px-4 py-3 sm:px-5">
            <Button type="button" variant="soft" size="sm" onClick={openCreate}>
              <Plus size={15} /> Tambah aturan
            </Button>
          </div>
        </div>
      )}

      {showForm ? <RecurringRuleFormModal key={editRule?.id ?? "baru"} editRule={editRule} onClose={() => setShowForm(false)} /> : null}
    </section>
  );
}
