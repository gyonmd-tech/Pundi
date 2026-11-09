"use client";

/**
 * app/(app)/anggaran/page.tsx
 * Anggaran per kategori yang bisa diatur per hari, per minggu, atau per bulan.
 * Contoh: makan Rp65.000/hari, bensin Rp225.000/minggu, self reward
 * Rp100.000/minggu. Sisa jatah bisa terbawa ke hari/minggu berikutnya.
 */

import React, { useMemo, useState } from "react";
import { AlertTriangle, PieChart, Plus, Trash2, Wallet } from "lucide-react";
import { useApp, useBudgets, useCategories, useTransactions } from "@/lib/data/store";
import { deleteBudgetAction } from "@/actions/budgets";
import { useToast } from "@/lib/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { BudgetPaceCard, paceStatus } from "@/components/budget/BudgetPaceCard";
import { BudgetWizard } from "@/components/budget/BudgetWizard";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { computeBudgetPace, toPeriod } from "@/lib/utils/budgetPace";
import type { Budget } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const STATUS_ORDER = { over: 0, warning: 1, safe: 2 } as const;

export default function AnggaranPage() {
  const { dispatch } = useApp();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const { showToast } = useToast();

  const period = toPeriod(new Date());

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => budgets
    .filter((budget) => budget.period === period)
    .map((budget) => ({
      budget,
      category: categories.find((category) => category.id === budget.categoryId),
      pace: computeBudgetPace(budget, transactions),
    }))
    .sort((a, b) => STATUS_ORDER[paceStatus(a.pace)] - STATUS_ORDER[paceStatus(b.pace)]), [budgets, categories, transactions, period]);

  const totalLimit = rows.reduce((sum, row) => sum + row.pace.monthLimit, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.pace.monthSpent, 0);
  const todayAvailable = rows.reduce((sum, row) => sum + row.pace.todayAvailable, 0);
  const overRows = rows.filter((row) => paceStatus(row.pace) === "over");

  function openCreate() {
    setEditing(null);
    setWizardOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditing(budget);
    setWizardOpen(true);
  }

  React.useEffect(() => {
    if (!deleteId) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setDeleteId(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteId]);

  async function handleDelete(id: string) {
    const row = rows.find((item) => item.budget.id === id);
    const result = await deleteBudgetAction(id);
    if (!result.success) {
      showToast({ type: "error", title: "Anggaran gagal dihapus", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_BUDGET", payload: id });
    setDeleteId(null);
    showToast({ type: "info", title: "Anggaran dihapus", message: `Anggaran ${row?.category?.name ?? ""} telah dihapus.` });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">Perencanaan Anggaran</h1>
          <p suppressHydrationWarning className="mt-0.5 text-xs text-ink-muted sm:text-small">
            Periode <strong className="font-semibold text-ink">{formatDate(new Date(), "month")}</strong> · atur jatah per hari, minggu, atau bulan
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="shrink-0" aria-label="Tambah anggaran">
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Tambah Anggaran</span>
        </Button>
      </div>

      {/* Ringkasan: satu kartu hero — angka utama + tiga angka pendukung. */}
      <section className="hero-surface relative overflow-hidden rounded-panel p-5 text-white sm:p-6">
        <p className="flex items-center gap-1.5 text-xs font-medium text-white/80"><Wallet className="h-3.5 w-3.5" />Bisa dipakai hari ini</p>
        <p className="figure-display mt-1.5 text-[clamp(2.1rem,6vw,3rem)] leading-none">{formatRupiah(todayAvailable)}</p>
        <p className="mt-2 text-xs text-white/80">Gabungan sisa jatah semua anggaran untuk hari ini</p>
        <div className="progress-track mt-4 bg-white/15" aria-hidden>
          <span className={cn("progress-fill", totalSpent > totalLimit ? "bg-ember" : "bg-lime")} style={{ width: `${totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0}%` }} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
          <SummaryStat label="Jatah bulan ini" value={formatRupiah(totalLimit)} />
          <SummaryStat label="Terpakai" value={formatRupiah(totalSpent)} />
          <SummaryStat label="Sisa" value={`${totalLimit - totalSpent < 0 ? "−" : ""}${formatRupiah(Math.abs(totalLimit - totalSpent))}`} danger={totalLimit - totalSpent < 0} />
        </dl>
      </section>

      {overRows.length > 0 ? (
        <div className="flex items-start gap-3 rounded-card border border-ember/25 bg-ember-10 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-ink"><AlertTriangle className="h-4.5 w-4.5" /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ember-ink">{overRows.length} anggaran lewat jatah</p>
            <p className="mt-0.5 text-xs text-ember-ink">
              <strong>{overRows.map((row) => row.category?.name).filter(Boolean).join(", ")}</strong> sudah melewati jatah periode berjalan. Kurangi pengeluaran di kategori ini agar sisa bulan tetap aman.
            </p>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-card border border-rule bg-surface-high px-6 py-14 text-center shadow-card">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface-soft text-ink-muted"><PieChart size={24} strokeWidth={1.5} /></div>
          <p className="text-body font-semibold text-ink">Belum ada anggaran</p>
          <p className="mx-auto mt-1 max-w-sm text-small text-ink-muted">Mulai dari jatah harian makan, jatah mingguan bensin, atau self reward mingguan supaya pengeluaran lebih terkendali.</p>
          <Button className="mt-4" onClick={openCreate}><Plus size={16} />Buat anggaran pertama</Button>
        </div>
      ) : (
        <div className="stagger-children grid gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <BudgetPaceCard
              key={row.budget.id}
              name={row.category?.name ?? "Kategori"}
              icon={row.category?.icon}
              color={row.category?.color}
              pace={row.pace}
              onEdit={() => openEdit(row.budget)}
              onDelete={() => setDeleteId(row.budget.id)}
            />
          ))}
        </div>
      )}

      <BudgetWizard open={wizardOpen} onClose={() => setWizardOpen(false)} editing={editing} />

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-[3px] animate-in fade-in" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-panel border border-rule bg-surface-high p-6 shadow-float">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-ember-10 text-ember"><Trash2 size={20} /></div>
            <h3 className="text-heading font-semibold text-ink">Hapus anggaran?</h3>
            <p className="mb-5 mt-1.5 text-small leading-relaxed text-ink-muted">Jatah untuk kategori ini tidak akan dipantau lagi bulan ini. Transaksinya tetap tersimpan.</p>
            <div className="flex gap-2.5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button className="flex-1 bg-ember hover:bg-ember-ink" onClick={() => handleDelete(deleteId)}>Ya, hapus</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryStat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-white/80">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-sm font-semibold tabular-nums sm:text-base", danger ? "text-[#FFB4B8]" : "text-white")}>{value}</dd>
    </div>
  );
}
