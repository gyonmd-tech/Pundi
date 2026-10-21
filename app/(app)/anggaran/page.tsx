"use client";

/**
 * app/(app)/anggaran/page.tsx
 * Anggaran per kategori yang bisa diatur per hari, per minggu, atau per bulan.
 * Contoh: makan Rp65.000/hari, bensin Rp225.000/minggu, self reward
 * Rp100.000/minggu. Sisa jatah bisa terbawa ke hari/minggu berikutnya.
 */

import React, { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CalendarRange, Gift, Lightbulb, PieChart, Plus, Repeat, Sparkles, Sun, Trash2, Wallet, X } from "lucide-react";
import { useApp, useBudgets, useCategories, useTransactions } from "@/lib/data/store";
import { upsertBudgetAction, deleteBudgetAction } from "@/actions/budgets";
import { createCategoryAction } from "@/actions/categories";
import { useToast } from "@/lib/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { BudgetPaceCard, paceStatus } from "@/components/budget/BudgetPaceCard";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { averageSpendFor, cadenceAmountOf, CADENCE_LABEL, computeBudgetPace, monthlyLimitFor, periodBounds, toPeriod } from "@/lib/utils/budgetPace";
import type { Budget, BudgetCadence } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const CADENCE_OPTIONS: Array<{ value: BudgetCadence; label: string; hint: string; icon: typeof Sun }> = [
  { value: "daily", label: "Per hari", hint: "Makan, kopi, jajan", icon: Sun },
  { value: "weekly", label: "Per minggu", hint: "Bensin, self reward", icon: CalendarRange },
  { value: "monthly", label: "Per bulan", hint: "Tagihan, belanja", icon: CalendarDays },
];

const STATUS_ORDER = { over: 0, warning: 1, safe: 2 } as const;

export default function AnggaranPage() {
  const { dispatch } = useApp();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const { showToast } = useToast();

  const period = toPeriod(new Date());
  const { days: daysInMonth } = periodBounds(period);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [cadence, setCadence] = useState<BudgetCadence>("daily");
  const [amount, setAmount] = useState("");
  const [rollover, setRollover] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const usedCategoryIds = rows.map((row) => row.budget.categoryId);
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const pickableCategories = editId ? expenseCategories : expenseCategories.filter((category) => !usedCategoryIds.includes(category.id));
  const hasSelfReward = expenseCategories.some((category) => /self\s*reward/i.test(category.name));

  const numericAmount = Number(amount || 0);
  const previewMonthly = numericAmount ? monthlyLimitFor(cadence, numericAmount, period) : 0;
  const suggestion = categoryId ? averageSpendFor(categoryId, cadence, transactions, period) : 0;

  function openCreate() {
    setEditId(null);
    setCategoryId("");
    setCadence("daily");
    setAmount("");
    setRollover(true);
    setShowForm(true);
  }

  function openEdit(budget: Budget) {
    setEditId(budget.id);
    setCategoryId(budget.categoryId);
    setCadence(budget.cadence ?? "monthly");
    setAmount(String(cadenceAmountOf(budget)));
    setRollover(budget.rollover !== false);
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
  }

  React.useEffect(() => {
    if (!showForm && !deleteId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDeleteId(null);
      if (!saving) setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showForm, deleteId, saving]);

  async function createSelfRewardCategory() {
    const draft = { name: "Self Reward", type: "expense" as const, icon: "gift", color: "#7B61D1" };
    const result = await createCategoryAction(draft);
    if (!result.success || !result.id) {
      showToast({ type: "error", title: "Kategori gagal dibuat", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "ADD_CATEGORY", payload: { id: result.id, ...draft } });
    setCategoryId(result.id);
    setCadence("weekly");
  }

  async function handleSave() {
    if (!categoryId || !numericAmount) {
      showToast({ type: "error", title: "Data belum lengkap", message: "Pilih kategori dan isi nominal jatah." });
      return;
    }
    const existing = budgets.find((budget) => budget.categoryId === categoryId && budget.period === period);
    const draft: Budget = {
      id: editId ?? existing?.id ?? `bud-${categoryId}-${period}`,
      categoryId,
      period,
      limitAmount: monthlyLimitFor(cadence, numericAmount, period),
      cadence,
      cadenceAmount: cadence === "monthly" ? undefined : numericAmount,
      rollover: cadence === "monthly" ? true : rollover,
    };

    setSaving(true);
    const result = await upsertBudgetAction(draft);
    setSaving(false);
    if (!result.success) {
      showToast({ type: "error", title: "Anggaran gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "UPSERT_BUDGET", payload: { ...draft, id: result.id || draft.id } });
    const name = categories.find((category) => category.id === categoryId)?.name ?? "kategori";
    showToast({
      type: "success",
      title: editId ? "Anggaran diperbarui" : "Anggaran dibuat",
      message: `${name}: ${formatRupiah(numericAmount)}${CADENCE_LABEL[cadence].per} (≈ ${formatRupiah(draft.limitAmount)} sebulan).`,
    });
    if ("warning" in result && result.warning) {
      showToast({ type: "info", title: "Perlu pembaruan database", message: result.warning });
    }
    setShowForm(false);
  }

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

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative col-span-2 overflow-hidden rounded-[22px] bg-brand-600 p-4 text-white shadow-card sm:p-5 lg:col-span-1">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/10" />
          <p className="relative flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white/75"><Wallet className="h-3.5 w-3.5" />Bisa dipakai hari ini</p>
          <p className="relative mt-2 font-mono text-[1.75rem] font-bold leading-none tabular-nums tracking-[-0.04em]">{formatRupiah(todayAvailable)}</p>
          <p className="relative mt-2 text-xs text-white/75">Gabungan sisa jatah semua anggaran untuk hari ini</p>
        </div>
        <SummaryTile label="Jatah bulan ini" value={formatRupiah(totalLimit)} />
        <SummaryTile label="Terpakai" value={formatRupiah(totalSpent)} tone={totalSpent > totalLimit ? "danger" : "default"} />
        <SummaryTile
          label="Sisa bulan ini"
          value={`${totalLimit - totalSpent < 0 ? "−" : ""}${formatRupiah(Math.abs(totalLimit - totalSpent))}`}
          tone={totalLimit - totalSpent < 0 ? "danger" : "brand"}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {overRows.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[18px] border border-ember/40 border-l-4 bg-ember-10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-ember-ink">{overRows.length} anggaran lewat jatah</p>
            <p className="mt-0.5 text-xs text-ember-ink/80">
              <strong>{overRows.map((row) => row.category?.name).filter(Boolean).join(", ")}</strong> sudah melewati jatah periode berjalan. Kurangi pengeluaran di kategori ini agar sisa bulan tetap aman.
            </p>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-[22px] border border-rule bg-surface-high px-6 py-14 text-center shadow-card">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface-soft text-ink-muted"><PieChart size={24} strokeWidth={1.5} /></div>
          <p className="text-body font-semibold text-ink">Belum ada anggaran</p>
          <p className="mx-auto mt-1 max-w-sm text-small text-ink-muted">Mulai dari jatah harian makan, jatah mingguan bensin, atau self reward mingguan supaya pengeluaran lebih terkendali.</p>
          <Button className="mt-4" onClick={openCreate}><Plus size={16} />Buat anggaran pertama</Button>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
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

      {/* Form tambah / edit */}
      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-scrim)] backdrop-blur-[3px] animate-in fade-in duration-200 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="budget-form-title" className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[26px] border border-rule bg-surface-high shadow-float animate-in slide-in-from-bottom-4 duration-200 sm:max-w-lg sm:rounded-[26px]">
            <header className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine-10 text-pine"><Sparkles size={16} /></span>
                <h2 id="budget-form-title" className="text-lg font-bold text-ink">{editId ? "Ubah anggaran" : "Anggaran baru"}</h2>
              </div>
              <button type="button" onClick={closeForm} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-surface-soft"><X size={18} /></button>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Kategori pengeluaran</p>
                <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {pickableCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      className={cn("flex min-h-11 items-center gap-2 rounded-[14px] border p-2 text-left transition", categoryId === category.id ? "border-pine bg-pine-10 font-semibold text-ink" : "border-rule bg-surface hover:bg-surface-soft")}
                    >
                      <CategoryIcon icon={category.icon} color={category.color} size={14} containerSize="sm" />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{category.name}</span>
                    </button>
                  ))}
                  {!editId && !hasSelfReward ? (
                    <button type="button" onClick={createSelfRewardCategory} className="flex min-h-11 items-center gap-2 rounded-[14px] border border-dashed border-lavender/50 p-2 text-left text-lavender-ink transition hover:bg-lavender-10">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-lavender-10"><Gift className="h-3.5 w-3.5" /></span>
                      <span className="min-w-0 flex-1 text-xs font-bold">+ Self Reward</span>
                    </button>
                  ) : null}
                </div>
                {!pickableCategories.length ? <p className="mt-2 text-xs text-ink-muted">Semua kategori pengeluaran sudah punya anggaran bulan ini.</p> : null}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Jatah dihitung</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Periode jatah">
                  {CADENCE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = cadence === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setCadence(option.value)}
                        className={cn("flex flex-col items-center gap-1 rounded-[16px] border px-2 py-3 text-center transition", active ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_18px_rgba(36,89,222,.25)]" : "border-rule bg-surface text-ink hover:bg-surface-soft")}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-bold">{option.label}</span>
                        <span className={cn("text-[10px] leading-tight", active ? "text-white/75" : "text-ink-muted")}>{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="budget-amount" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Jatah {CADENCE_LABEL[cadence].per.replace("/", "per ")}
                </label>
                <div className="flex items-center gap-2 rounded-[16px] border border-rule bg-surface px-4 focus-within:border-pine focus-within:shadow-[var(--shadow-focus)]">
                  <span className="text-sm font-bold text-pine">Rp</span>
                  <input
                    id="budget-amount"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                    onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 12))}
                    className="h-14 min-w-0 flex-1 border-0 bg-transparent text-right font-mono text-xl font-bold tabular-nums text-ink shadow-none outline-none focus:shadow-none"
                    data-search-input="true"
                  />
                  <span className="shrink-0 text-xs font-semibold text-ink-muted">{CADENCE_LABEL[cadence].per}</span>
                </div>
                {suggestion ? (
                  <button type="button" onClick={() => setAmount(String(suggestion))} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition hover:text-pine">
                    <Lightbulb className="h-3.5 w-3.5 text-brass" />
                    Rata-rata 3 bulan terakhir: {formatRupiah(suggestion)}{CADENCE_LABEL[cadence].per} · pakai
                  </button>
                ) : null}
              </div>

              {cadence !== "monthly" ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-rule bg-surface p-3.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Repeat className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">Jatah fleksibel</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                      Sisa jatah {CADENCE_LABEL[cadence].unit} sebelumnya ikut terbawa, dan kelebihannya mengurangi jatah berikutnya.
                    </span>
                  </span>
                  <input type="checkbox" checked={rollover} onChange={(event) => setRollover(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand-600)]" />
                </label>
              ) : null}

              {numericAmount ? (
                <div className="rounded-[16px] bg-brand-50 p-3.5 text-xs leading-relaxed text-ink">
                  {cadence === "monthly" ? (
                    <>Setara sekitar <b>{formatRupiah(Math.round(numericAmount / daysInMonth))}/hari</b> selama {daysInMonth} hari.</>
                  ) : (
                    <>Total sebulan ≈ <b>{formatRupiah(previewMonthly)}</b> ({cadence === "daily" ? `${daysInMonth} hari` : `${(daysInMonth / 7).toLocaleString("id-ID", { maximumFractionDigits: 1 })} minggu`}). Angka ini yang dipakai di dashboard & insight.</>
                  )}
                </div>
              ) : null}
            </div>

            <footer className="flex gap-3 border-t border-rule bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Batal</Button>
              <Button type="button" className="flex-1" onClick={handleSave} loading={saving} disabled={!categoryId || !numericAmount}>{editId ? "Simpan perubahan" : "Tetapkan anggaran"}</Button>
            </footer>
          </section>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-[3px] animate-in fade-in" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-[24px] border border-rule bg-surface-high p-6 shadow-float">
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

function SummaryTile({ label, value, tone = "default", className }: { label: string; value: string; tone?: "default" | "brand" | "danger"; className?: string }) {
  return (
    <div className={cn("rounded-[22px] border border-rule bg-surface-high p-4 shadow-card sm:p-5", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className={cn("mt-2 whitespace-nowrap font-mono text-[clamp(1rem,4.6vw,1.25rem)] font-bold tabular-nums tracking-[-0.03em]", tone === "danger" ? "text-ember-ink" : tone === "brand" ? "text-pine" : "text-ink")}>{value}</p>
    </div>
  );
}
