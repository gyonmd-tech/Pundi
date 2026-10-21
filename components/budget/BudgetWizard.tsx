"use client";

/**
 * components/budget/BudgetWizard.tsx
 * Membuat / mengubah anggaran dalam 3 langkah yang jelas:
 *   1. Kategori — kategori yang belum punya anggaran di atas, lengkap
 *      dengan rata-rata belanja bulanan sebagai patokan.
 *   2. Jatah    — satu kalimat: "Batas Rp __ setiap hari/minggu/bulan",
 *      dengan saran dari kebiasaan & pratinjau total sebulan.
 *   3. Cek      — ringkasan angka; "Jatah fleksibel" ada di Opsi lanjutan
 *      dengan contoh nyata.
 * Saat mengubah anggaran, langkah kategori dilewati.
 */
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Gift, Lightbulb, Repeat } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useApp, useBudgets, useCategories, useTransactions } from "@/lib/data/store";
import { upsertBudgetAction } from "@/actions/budgets";
import { createCategoryAction } from "@/actions/categories";
import { useToast } from "@/lib/context/ToastContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { averageSpendFor, cadenceAmountOf, CADENCE_LABEL, monthlyLimitFor, periodBounds, toPeriod } from "@/lib/utils/budgetPace";
import type { Budget, BudgetCadence } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const CADENCES: { value: BudgetCadence; label: string; hint: string }[] = [
  { value: "daily", label: "hari", hint: "Cocok untuk makan, kopi, jajan — pengeluaran yang terjadi hampir tiap hari." },
  { value: "weekly", label: "minggu", hint: "Cocok untuk bensin, hiburan, self reward — rutin tapi tidak harian." },
  { value: "monthly", label: "bulan", hint: "Cocok untuk tagihan, belanja bulanan, cicilan — terjadi sekali-dua kali sebulan." },
];

const STEPS = ["Kategori", "Jatah", "Cek"] as const;

interface BudgetWizardProps {
  open: boolean;
  onClose: () => void;
  /** Anggaran yang diubah; kosong = membuat baru. */
  editing?: Budget | null;
}

export function BudgetWizard({ open, onClose, editing }: BudgetWizardProps) {
  // Remount saat dibuka supaya state selalu mulai bersih.
  if (!open) return null;
  return <WizardBody key={editing?.id ?? "new"} onClose={onClose} editing={editing ?? null} />;
}

function WizardBody({ onClose, editing }: { onClose: () => void; editing: Budget | null }) {
  const { dispatch } = useApp();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  const { showToast } = useToast();
  const period = toPeriod(new Date());
  const { days } = periodBounds(period);

  const [step, setStep] = useState(editing ? 1 : 0);
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [cadence, setCadence] = useState<BudgetCadence>(editing?.cadence ?? "daily");
  const [amount, setAmount] = useState(editing ? String(cadenceAmountOf(editing)) : "");
  const [rollover, setRollover] = useState(editing ? editing.rollover !== false : true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  const expense = categories.filter((category) => category.type === "expense");
  const budgeted = new Set(budgets.filter((budget) => budget.period === period).map((budget) => budget.categoryId));
  const options = expense
    .map((category) => ({
      category,
      taken: budgeted.has(category.id) && category.id !== editing?.categoryId,
      monthlyAverage: averageSpendFor(category.id, "monthly", transactions, period),
    }))
    .sort((a, b) => Number(a.taken) - Number(b.taken) || b.monthlyAverage - a.monthlyAverage);
  const hasSelfReward = expense.some((category) => /self\s*reward/i.test(category.name));

  const category = categories.find((item) => item.id === categoryId);
  const value = Number(amount || 0);
  const monthly = value ? monthlyLimitFor(cadence, value, period) : 0;
  const perDay = Math.round(monthly / days);
  const suggestion = categoryId ? averageSpendFor(categoryId, cadence, transactions, period) : 0;
  const unit = CADENCE_LABEL[cadence].unit;

  const canNext = step === 0 ? Boolean(categoryId) : step === 1 ? value > 0 : true;

  async function createSelfReward() {
    const draft = { name: "Self Reward", type: "expense" as const, icon: "gift", color: "#7B61D1" };
    const result = await createCategoryAction(draft);
    if (!result.success || !result.id) {
      showToast({ type: "error", title: "Kategori gagal dibuat", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "ADD_CATEGORY", payload: { id: result.id, ...draft } });
    setCategoryId(result.id);
    setCadence("weekly");
    setStep(1);
  }

  async function save() {
    if (!categoryId || !value) return;
    const existing = budgets.find((budget) => budget.categoryId === categoryId && budget.period === period);
    const draft: Budget = {
      id: editing?.id ?? existing?.id ?? `bud-${categoryId}-${period}`,
      categoryId,
      period,
      limitAmount: monthlyLimitFor(cadence, value, period),
      cadence,
      cadenceAmount: cadence === "monthly" ? undefined : value,
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
    showToast({
      type: "success",
      title: editing ? "Anggaran diperbarui" : "Anggaran dibuat",
      message: `${category?.name ?? "Kategori"}: ${formatRupiah(value)} per ${unit}.`,
    });
    if ("warning" in result && result.warning) showToast({ type: "info", title: "Perlu pembaruan database", message: result.warning });
    onClose();
  }

  const firstStep = editing ? 1 : 0;

  return (
    <Modal open onClose={() => { if (!saving) onClose(); }} title={editing ? "Ubah anggaran" : "Anggaran baru"} description="Tiga langkah: pilih kategori, tentukan jatah, lalu cek." className="sm:max-w-lg">
      {/* Indikator langkah */}
      <ol className="flex items-center gap-2 px-5 pt-4" aria-label="Langkah">
        {STEPS.map((label, index) => {
          if (editing && index === 0) return null;
          const done = index < step;
          const current = index === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition",
                done ? "bg-mint text-white" : current ? "bg-brand-600 text-white" : "bg-surface-soft text-ink-soft",
              )}>
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1 - firstStep}
              </span>
              <span className={cn("text-xs font-bold", current ? "text-ink" : "text-ink-soft")}>{label}</span>
              {index < STEPS.length - 1 ? <span className={cn("h-px flex-1", done ? "bg-mint" : "bg-rule")} /> : null}
            </li>
          );
        })}
      </ol>

      <div key={step} className="animate-in fade-in slide-in-from-right-2 min-h-[18rem] px-5 py-5">
        {step === 0 ? (
          <div>
            <h3 className="text-base font-bold text-ink">Untuk pengeluaran apa?</h3>
            <p className="mt-0.5 text-xs text-ink-muted">Angka kecil di bawah nama = rata-rata belanjamu per bulan.</p>
            <div className="mt-4 grid max-h-[46dvh] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {options.map(({ category: item, taken, monthlyAverage }) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={taken}
                  onClick={() => { setCategoryId(item.id); setStep(1); }}
                  className={cn(
                    "flex min-h-14 items-center gap-2.5 rounded-[14px] border p-2.5 text-left transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45",
                    categoryId === item.id ? "border-brand-600 bg-brand-600/10" : "border-rule bg-surface hover:border-brand-300",
                  )}
                >
                  <CategoryIcon icon={item.icon} color={item.color} size={14} containerSize="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{item.name}</span>
                    <span className="block truncate text-[11px] text-ink-muted">
                      {taken ? "Sudah dianggarkan" : monthlyAverage ? `±${formatRupiah(monthlyAverage)}/bln` : "Belum ada riwayat"}
                    </span>
                  </span>
                </button>
              ))}
              {!hasSelfReward ? (
                <button type="button" onClick={createSelfReward} className="flex min-h-14 items-center gap-2.5 rounded-[14px] border border-dashed border-lavender/60 p-2.5 text-left text-lavender-ink transition hover:bg-lavender-10">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-lavender-10"><Gift className="h-3.5 w-3.5" /></span>
                  <span className="text-[13px] font-bold">+ Self Reward</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : step === 1 ? (
          <div>
            <div className="flex items-center gap-2.5">
              {category ? <CategoryIcon icon={category.icon} color={category.color} size={14} containerSize="sm" /> : null}
              <h3 className="text-base font-bold text-ink">Berapa batas untuk {category?.name ?? "kategori ini"}?</h3>
            </div>

            <div className="mt-5 rounded-[20px] border border-rule bg-surface p-4">
              <p className="text-sm font-semibold text-ink-muted">Batas belanja</p>
              <label className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand-600">Rp</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  aria-label="Nominal jatah"
                  data-bare-input="true"
                  value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="min-w-0 flex-1 bg-transparent font-display text-[2rem] font-black tabular-nums tracking-[-0.03em] text-ink outline-none placeholder:text-ink-soft"
                />
              </label>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-muted">setiap</span>
                <div className="grid flex-1 grid-cols-3 gap-1 rounded-[14px] bg-surface-soft p-1" role="radiogroup" aria-label="Periode jatah">
                  {CADENCES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={cadence === option.value}
                      onClick={() => setCadence(option.value)}
                      className={cn(
                        "h-9 rounded-[10px] text-sm font-bold transition",
                        cadence === option.value ? "bg-surface-high text-brand-600 shadow-card" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">{CADENCES.find((option) => option.value === cadence)?.hint}</p>
            </div>

            {suggestion ? (
              <button type="button" onClick={() => setAmount(String(suggestion))} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brass-10 px-3 py-1.5 text-xs font-semibold text-ink transition hover:brightness-95">
                <Lightbulb className="h-3.5 w-3.5 text-brass" />
                Biasanya kamu habis {formatRupiah(suggestion)} per {unit} · pakai angka ini
              </button>
            ) : null}

            {value ? (
              <p className="mt-4 text-sm text-ink-muted">
                Artinya sekitar <b className="text-ink">{formatRupiah(monthly)}</b> sebulan
                {cadence !== "daily" ? <> atau <b className="text-ink">{formatRupiah(perDay)}</b> per hari</> : null}.
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <h3 className="text-base font-bold text-ink">Cek sebelum disimpan</h3>
            <div className="mt-4 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#1D48B5,#2860E6)] p-5 text-white">
              <div className="flex items-center gap-2.5">
                {category ? <span className="rounded-[10px] bg-white p-0.5"><CategoryIcon icon={category.icon} color={category.color} size={14} containerSize="sm" /></span> : null}
                <p className="font-bold">{category?.name}</p>
              </div>
              <p className="mt-4 text-xs font-semibold text-white/70">Jatah per {unit}</p>
              <p className="font-display text-3xl font-black tabular-nums tracking-[-0.03em]">{formatRupiah(value)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-[12px] bg-white/12 p-2.5"><p className="text-white/70">Sebulan</p><p className="mt-0.5 text-sm font-bold tabular-nums">{formatRupiah(monthly)}</p></div>
                <div className="rounded-[12px] bg-white/12 p-2.5"><p className="text-white/70">Per hari</p><p className="mt-0.5 text-sm font-bold tabular-nums">{formatRupiah(perDay)}</p></div>
              </div>
            </div>

            {cadence !== "monthly" ? (
              <div className="mt-4 rounded-[16px] border border-rule">
                <button type="button" onClick={() => setShowAdvanced((state) => !state)} aria-expanded={showAdvanced} className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-ink">
                  Opsi lanjutan
                  <ChevronDown className={cn("h-4 w-4 text-ink-muted transition", showAdvanced && "rotate-180")} />
                </button>
                {showAdvanced ? (
                  <label className="flex cursor-pointer items-start gap-3 border-t border-rule px-4 py-3.5">
                    <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink">Sisa jatah boleh dipakai {unit} berikutnya</span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                        Contoh: jatah {formatRupiah(value)}/{unit}, {cadence === "daily" ? "hari ini" : "minggu ini"} terpakai {formatRupiah(Math.round(value * 0.8))} →
                        {cadence === "daily" ? " besok" : " minggu depan"} kamu punya {formatRupiah(Math.round(value * 1.2))}. Kalau lebih boros, jatah berikutnya ikut berkurang.
                      </span>
                    </span>
                    <input type="checkbox" checked={rollover} onChange={(event) => setRollover(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand-600)]" />
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 flex gap-3 border-t border-rule bg-surface-high px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
        {step > firstStep ? (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        )}
        {step < 2 ? (
          <Button type="button" className="flex-1" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Lanjut <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" className="flex-1" loading={saving} onClick={save}>
            <Check className="h-4 w-4" /> {editing ? "Simpan perubahan" : "Tetapkan anggaran"}
          </Button>
        )}
      </footer>
    </Modal>
  );
}
