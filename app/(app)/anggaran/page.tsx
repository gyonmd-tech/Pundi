"use client";

/**
 * app/(app)/anggaran/page.tsx
 * Manajemen anggaran bulanan per kategori dengan CategoryIcon,
 * toast notifications, live spending preview, dan modal tambah/edit.
 */

import React, { useState } from "react";
import { useApp, useBudgets, useCategories } from "@/lib/data/store";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { formatRupiah, formatDate, calcProgress, getBudgetStatus } from "@/lib/utils/formatter";
import { getSpentByCategory } from "@/lib/data/mock";
import { useToast } from "@/lib/context/ToastContext";
import { Plus, X, Edit2, AlertTriangle, Trash2, PieChart, Sparkles } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils/cn";

const CURRENT_PERIOD = "2026-08";

export default function AnggaranPage() {
  const { dispatch }  = useApp();
  const budgets       = useBudgets();
  const categories    = useCategories();
  const { showToast } = useToast();

  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [categoryId, setCategoryId]     = useState("");
  const [limitAmount, setLimitAmount]   = useState("");
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [period, setPeriod]             = useState(CURRENT_PERIOD);

  const thisPeriodBudgets = budgets
    .filter((b) => b.period === period)
    .map((b) => {
      const cat   = categories.find((c) => c.id === b.categoryId);
      const spent = getSpentByCategory(b.categoryId, period);
      return { ...b, category: cat, spent };
    })
    .sort((a, b) => {
      const statusOrder = { over: 0, warning: 1, safe: 2 };
      return statusOrder[getBudgetStatus(a.spent, a.limitAmount)] - statusOrder[getBudgetStatus(b.spent, b.limitAmount)];
    });

  const totalBudget = thisPeriodBudgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent  = thisPeriodBudgets.reduce((s, b) => s + b.spent, 0);
  const overBudgets = thisPeriodBudgets.filter((b) => getBudgetStatus(b.spent, b.limitAmount) === "over");

  const usedCategoryIds = budgets.filter((b) => b.period === period).map((b) => b.categoryId);
  const availableCategories = categories.filter((c) => c.type === "expense" && !usedCategoryIds.includes(c.id));

  function handleSave() {
    const amt = parseInt(limitAmount.replace(/\D/g, ""), 10);
    if (!categoryId || !amt || amt <= 0) {
      showToast({
        type: "error",
        title: "Data Belum Lengkap",
        message: "Pilih kategori dan masukkan batas anggaran yang valid.",
      });
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);
    const existing = budgets.find((b) => b.categoryId === categoryId && b.period === period);

    dispatch({
      type: "UPSERT_BUDGET",
      payload: {
        id:          editId ?? existing?.id ?? `bud-${Date.now()}`,
        categoryId,
        period,
        limitAmount: amt,
      },
    });

    showToast({
      type: "success",
      title: editId ? "Anggaran Diperbarui" : "Anggaran Dibuat",
      message: `Batas untuk ${selectedCat?.name ?? "kategori"} diset ke ${formatRupiah(amt)}.`,
    });

    resetForm();
  }

  function handleDelete(id: string) {
    const bud = thisPeriodBudgets.find((b) => b.id === id);
    dispatch({ type: "DELETE_BUDGET", payload: id });
    setDeleteId(null);
    showToast({
      type: "info",
      title: "Anggaran Dihapus",
      message: `Anggaran kategori ${bud?.category?.name ?? ""} telah dihapus.`,
    });
  }

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setCategoryId("");
    setLimitAmount("");
  }

  function handleEdit(bud: typeof thisPeriodBudgets[0]) {
    setEditId(bud.id);
    setCategoryId(bud.categoryId);
    setLimitAmount(bud.limitAmount.toString());
    setShowForm(true);
  }

  const selectedCategoryCurrentSpent = categoryId ? getSpentByCategory(categoryId, period) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-l font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Perencanaan Anggaran
          </h1>
          <p suppressHydrationWarning className="text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Periode: <strong className="text-ink font-semibold">{formatDate(new Date(), "month")}</strong>
          </p>
        </div>

        <button
          onClick={() => { setEditId(null); setShowForm(true); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-card text-small font-semibold shadow-sm",
            "transition-all duration-200 hover:brightness-105 active:scale-95 group"
          )}
          style={{ backgroundColor: "var(--color-pine)", color: "white", fontFamily: "var(--font-ui)" }}
        >
          <Plus size={16} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Tambah Anggaran</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1" style={{ fontFamily: "var(--font-ui)" }}>
            Total Batas Anggaran
          </p>
          <p className="tabular-nums font-mono font-bold text-heading text-ink">
            {formatRupiah(totalBudget)}
          </p>
        </div>

        <div className="card p-4 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1" style={{ fontFamily: "var(--font-ui)" }}>
            Total Terpakai
          </p>
          <p
            className="tabular-nums font-mono font-bold text-heading"
            style={{ color: totalSpent > totalBudget ? "var(--color-ember)" : "var(--color-ink)" }}
          >
            {formatRupiah(totalSpent)}
          </p>
        </div>

        <div className="card p-4 hover:border-pine/30 transition-all" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1" style={{ fontFamily: "var(--font-ui)" }}>
            Sisa Alokasi
          </p>
          <p
            className="tabular-nums font-mono font-bold text-heading"
            style={{ color: totalBudget - totalSpent >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}
          >
            {totalBudget - totalSpent >= 0 ? "" : "−"}
            {formatRupiah(Math.abs(totalBudget - totalSpent))}
          </p>
        </div>
      </div>

      {/* Alert Over-Budget Indicator */}
      {overBudgets.length > 0 && (
        <div
          className="flex items-center gap-3.5 p-4 rounded-card border shadow-xs animate-in fade-in"
          style={{
            backgroundColor: "var(--color-ember-10)",
            borderColor: "var(--color-ember)",
            borderLeftWidth: "4px",
          }}
        >
          <div className="w-8 h-8 rounded-full bg-ember/15 flex items-center justify-center flex-shrink-0 text-ember">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-small font-semibold text-ember leading-tight" style={{ fontFamily: "var(--font-ui)" }}>
              Perhatian: {overBudgets.length} Kategori Melewati Batas
            </p>
            <p className="text-xs text-ember/80 mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
              Kategori <strong>{overBudgets.map(b => b.category?.name).filter(Boolean).join(", ")}</strong> telah melebihi target anggaran yang ditetapkan.
            </p>
          </div>
        </div>
      )}

      {/* Budget List Card */}
      <div className="card p-4 sm:p-6" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-rule">
          <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
            Daftar Alokasi per Kategori
          </h2>
          <span className="text-xs font-mono text-ink-muted">
            {thisPeriodBudgets.length} kategori aktif
          </span>
        </div>

        {thisPeriodBudgets.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mx-auto mb-3 text-ink-muted">
              <PieChart size={24} strokeWidth={1.5} />
            </div>
            <p className="text-body font-semibold text-ink mb-1" style={{ fontFamily: "var(--font-ui)" }}>
              Belum ada anggaran yang diset
            </p>
            <p className="text-small text-ink-muted mb-4 max-w-xs mx-auto" style={{ fontFamily: "var(--font-ui)" }}>
              Buat batasan pengeluaran bulananmu agar arus kas tetap sehat dan terkontrol.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-card text-small font-semibold text-white bg-pine shadow-sm hover:brightness-105 active:scale-95 transition-all"
            >
              Buat Anggaran Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {thisPeriodBudgets.map((b) => (
              <div key={b.id} className="relative group">
                <BudgetProgress
                  categoryName={b.category?.name ?? "Kategori"}
                  categoryIcon={b.category?.icon}
                  categoryColor={b.category?.color}
                  spent={b.spent}
                  limit={b.limitAmount}
                />
                {/* Inline Action Buttons */}
                <div className="absolute right-3 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-1 py-0.5 rounded border border-rule shadow-xs">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1 rounded text-ink-muted hover:text-pine hover:bg-pine-10 transition-colors"
                    title="Edit batas anggaran"
                  >
                    <Edit2 size={13} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="p-1 rounded text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                    title="Hapus anggaran"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={resetForm}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-card shadow-float overflow-hidden border animate-in slide-in-from-bottom-4 duration-200"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-rule)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                  {editId ? "Edit Batas Anggaran" : "Tambah Anggaran Baru"}
                </h2>
              </div>
              <button onClick={resetForm} className="text-ink-muted hover:text-ink p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                  Pilih Kategori Pengeluaran
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {(editId ? categories.filter(c => c.type === "expense") : availableCategories).map((c) => {
                    const isSelected = categoryId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-card border text-left transition-all",
                          isSelected
                            ? "border-pine bg-pine-10 text-pine font-semibold shadow-xs"
                            : "border-rule bg-paper/60 hover:bg-paper text-ink"
                        )}
                      >
                        <CategoryIcon icon={c.icon} color={c.color} size={14} containerSize="sm" />
                        <span className="text-xs truncate flex-1 font-medium">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Spending Info Preview */}
              {categoryId && (
                <div className="p-3 rounded-card border bg-paper/80 flex items-center justify-between" style={{ borderColor: "var(--color-rule)" }}>
                  <span className="text-xs text-ink-muted">Pengeluaran Bulan Ini:</span>
                  <span className="text-xs font-mono font-bold text-ink">
                    {formatRupiah(selectedCategoryCurrentSpent)}
                  </span>
                </div>
              )}

              {/* Limit Amount Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
                  Batas Maksimal Anggaran
                </label>
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-card border bg-paper focus-within:border-pine"
                  style={{ borderColor: "var(--color-rule)" }}
                >
                  <span className="text-small font-mono font-bold text-pine">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={limitAmount ? parseInt(limitAmount, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setLimitAmount(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent outline-none tabular-nums text-right font-mono font-bold text-lg text-ink"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-rule bg-paper">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-surface transition-colors"
                style={{ borderColor: "var(--color-rule)" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!categoryId || !limitAmount}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-pine hover:brightness-105 active:scale-95 transition-all disabled:opacity-40"
              >
                {editId ? "Simpan Perubahan" : "Tetapkan Anggaran"}
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
              Hapus Anggaran?
            </h3>
            <p className="text-small text-ink-muted mb-5 leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
              Batas anggaran ini akan dihapus dari pemantauan bulanan.
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
