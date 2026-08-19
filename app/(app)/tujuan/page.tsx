"use client";

/**
 * app/(app)/tujuan/page.tsx
 * Tujuan tabungan dengan GoalCard, toast notifications,
 * target date presets (+3 bln, +6 bln, +1 thn), linked account selection, dan deletion modal.
 */

import React, { useState } from "react";
import { useApp, useGoals, useAccounts } from "@/lib/data/store";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { formatRupiah, formatDate, calcProgress } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { Plus, X, Target, Trash2, Edit2, Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import type { Goal } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const MONTHLY_SAVINGS = 1_200_000;

export default function TujuanPage() {
  const { dispatch }  = useApp();
  const goals         = useGoals();
  const accounts      = useAccounts();
  const { showToast } = useToast();

  const [showForm, setShowForm]   = useState(false);
  const [editGoal, setEditGoal]   = useState<Goal | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const [form, setForm] = useState({
    name:            "",
    targetAmount:    "",
    currentAmount:   "0",
    targetDate:      "",
    linkedAccountId: "",
  });

  function openAdd() {
    setEditGoal(null);
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 6);
    setForm({
      name:            "",
      targetAmount:    "",
      currentAmount:   "0",
      targetDate:      defaultDate.toISOString().slice(0, 10),
      linkedAccountId: accounts[0]?.id ?? "",
    });
    setShowForm(true);
  }

  function openEdit(g: Goal) {
    setEditGoal(g);
    setForm({
      name:            g.name,
      targetAmount:    g.targetAmount.toString(),
      currentAmount:   g.currentAmount.toString(),
      targetDate:      g.targetDate.toISOString().slice(0, 10),
      linkedAccountId: g.linkedAccountId ?? (accounts[0]?.id ?? ""),
    });
    setShowForm(true);
  }

  function setDatePreset(monthsAhead: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    setForm(f => ({ ...f, targetDate: d.toISOString().slice(0, 10) }));
  }

  function handleSave() {
    if (!form.name.trim()) {
      showToast({
        type: "error",
        title: "Nama Tujuan Kosong",
        message: "Beri nama tujuan tabunganmu (mis. Dana Darurat, Liburan).",
      });
      return;
    }

    const targetVal  = parseInt(form.targetAmount.replace(/\D/g, ""), 10) || 0;
    const currentVal = parseInt(form.currentAmount.replace(/\D/g, ""), 10) || 0;

    if (targetVal <= 0) {
      showToast({
        type: "error",
        title: "Target Nominal Kosong",
        message: "Masukkan target nominal yang ingin dicapai.",
      });
      return;
    }

    const payload: Goal = {
      id:              editGoal?.id ?? `goal-${Date.now()}`,
      name:            form.name.trim(),
      targetAmount:    targetVal,
      currentAmount:   currentVal,
      targetDate:      new Date(form.targetDate || Date.now()),
      linkedAccountId: form.linkedAccountId || undefined,
    };

    dispatch({ type: editGoal ? "UPDATE_GOAL" : "ADD_GOAL", payload });
    setShowForm(false);

    showToast({
      type: "success",
      title: editGoal ? "Tujuan Diperbarui" : "Tujuan Tabungan Dibuat",
      message: `Target ${form.name} sebesar ${formatRupiah(targetVal)} berhasil disimpan.`,
    });
  }

  function handleDelete(id: string) {
    const g = goals.find(item => item.id === id);
    dispatch({ type: "DELETE_GOAL", payload: id });
    setDeleteId(null);
    showToast({
      type: "info",
      title: "Tujuan Dihapus",
      message: `Tujuan "${g?.name ?? ""}" telah dihapus.`,
    });
  }

  const totalTarget    = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved     = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-display-l font-semibold tracking-tight leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Tujuan Finansial & Tabungan
          </h1>
          <p className="text-xs sm:text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Pantau dan alokasikan dana untuk rencana masa depanmu
          </p>
        </div>

        <button
          onClick={openAdd}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-card text-small font-semibold shadow-sm",
            "transition-all duration-200 hover:brightness-105 active:scale-95 group"
          )}
          style={{ backgroundColor: "var(--color-pine)", color: "white", fontFamily: "var(--font-ui)" }}
        >
          <Plus size={16} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Tujuan Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className="card p-4 transition-all hover:border-pine/30 w-full min-w-0" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Total Target</p>
          <p className="tabular-nums font-mono font-bold text-heading text-ink">{formatRupiah(totalTarget)}</p>
        </div>

        <div className="card p-4 transition-all hover:border-pine/30 w-full min-w-0" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Total Terkumpul</p>
          <p className="tabular-nums font-mono font-bold text-heading text-pine">{formatRupiah(totalSaved)}</p>
        </div>

        <div className="card p-4 transition-all hover:border-pine/30 w-full min-w-0" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Kemajuan Kolektif</p>
          <p className="tabular-nums font-mono font-bold text-heading text-brass">
            {totalTarget > 0 ? calcProgress(totalSaved, totalTarget) : 0}% ({completedCount}/{goals.length} tercapai)
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center card p-6 w-full min-w-0" style={{ borderColor: "var(--color-rule)" }}>
          <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mb-3 text-ink-muted">
            <Target size={24} strokeWidth={1.5} />
          </div>
          <p className="text-body font-semibold text-ink mb-1" style={{ fontFamily: "var(--font-ui)" }}>
            Belum ada rencana tujuan tabungan
          </p>
          <p className="text-small text-ink-muted mb-4 max-w-sm" style={{ fontFamily: "var(--font-ui)" }}>
            Mulai rencanakan dana darurat, liburan impian, atau pembelian barang idamanmu.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-card text-small font-semibold text-white bg-pine shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            Buat Tujuan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              {...g}
              monthlySavings={MONTHLY_SAVINGS}
              onEdit={() => openEdit(g)}
              onDelete={() => setDeleteId(g.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-card shadow-float overflow-hidden border bg-surface animate-in slide-in-from-bottom-4"
            style={{ borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-rule)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                  {editGoal ? "Edit Tujuan Tabungan" : "Tujuan Tabungan Baru"}
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-ink-muted hover:text-ink p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Goal Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Nama Tujuan Finansial
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="mis. Dana Darurat, Liburan Jepang, MacBook M4..."
                  className="w-full px-3.5 py-2.5 rounded-card border bg-paper text-small text-ink focus:border-pine outline-none font-medium"
                  style={{ borderColor: "var(--color-rule)" }}
                  autoFocus
                />
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Target Nominal (Rp)
                  </label>
                  <input
                    type="text"
                    value={form.targetAmount ? parseInt(form.targetAmount, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setForm(f => ({ ...f, targetAmount: e.target.value.replace(/\D/g, "") }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-card border bg-paper text-small font-mono font-bold text-ink focus:border-pine outline-none"
                    style={{ borderColor: "var(--color-rule)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Terkumpul Saat Ini (Rp)
                  </label>
                  <input
                    type="text"
                    value={form.currentAmount ? parseInt(form.currentAmount, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setForm(f => ({ ...f, currentAmount: e.target.value.replace(/\D/g, "") }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-card border bg-paper text-small font-mono font-bold text-pine focus:border-pine outline-none"
                    style={{ borderColor: "var(--color-rule)" }}
                  />
                </div>
              </div>

              {/* Target Date with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Target Tanggal Selesai
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDatePreset(3)}
                      className="text-[11px] font-mono text-pine hover:underline"
                    >
                      +3 bln
                    </button>
                    <span className="text-[10px] text-ink-muted">·</span>
                    <button
                      type="button"
                      onClick={() => setDatePreset(6)}
                      className="text-[11px] font-mono text-pine hover:underline"
                    >
                      +6 bln
                    </button>
                    <span className="text-[10px] text-ink-muted">·</span>
                    <button
                      type="button"
                      onClick={() => setDatePreset(12)}
                      className="text-[11px] font-mono text-pine hover:underline"
                    >
                      +1 thn
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm(f => ({ ...f, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-card border bg-paper text-small text-ink focus:border-pine outline-none font-mono"
                  style={{ borderColor: "var(--color-rule)" }}
                />
              </div>

              {/* Linked Account */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Hubungkan ke Rekening Khusus (Opsional)
                </label>
                <select
                  value={form.linkedAccountId}
                  onChange={(e) => setForm(f => ({ ...f, linkedAccountId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-card border bg-paper text-small text-ink focus:border-pine outline-none font-medium"
                  style={{ borderColor: "var(--color-rule)" }}
                >
                  <option value="">Tanpa Rekening Khusus (Manual)</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({formatRupiah(a.balance)})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-rule bg-paper">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-surface"
                style={{ borderColor: "var(--color-rule)" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.targetAmount}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-pine hover:brightness-105 active:scale-95 disabled:opacity-40 shadow-sm"
              >
                {editGoal ? "Simpan Perubahan" : "Buat Tujuan Tabungan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-card p-6 shadow-float border bg-surface"
            style={{ borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-ember-10 flex items-center justify-center text-ember mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="text-heading font-semibold text-ink mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Hapus Tujuan Tabungan?
            </h3>
            <p className="text-small text-ink-muted mb-5 leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
              Tujuan ini dan catatan kemajuannya akan dihapus dari pemantauan.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-paper"
                style={{ borderColor: "var(--color-rule)" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-ember hover:brightness-110 active:scale-95 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
