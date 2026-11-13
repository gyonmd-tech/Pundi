"use client";

/**
 * components/budget/BudgetWizard.tsx
 * Membuat / mengubah anggaran dalam 3 langkah:
 *   1. Kategori — kategori yang belum punya anggaran aktif di atas, dengan
 *      rata-rata belanja sebagai patokan.
 *   2. Jatah    — nominal + ritme (hari / minggu / siklus) + BERLAKU MULAI.
 *      Jatah dihitung sejak tanggal mulai saja (prorata), tanpa jatah mundur.
 *   3. Cek      — ringkasan, SUMBER DANA (rekening yang dihitung, dengan cek
 *      saldo), ULANGI tiap siklus, dan sisa jatah terbawa.
 * Saat mengubah anggaran, langkah kategori dilewati.
 */
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gift, Lightbulb } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useAccounts, useApp, useBudgets, useCategories, useGoals, usePreferences, useTransactions } from "@/lib/data/store";
import { upsertBudgetAction } from "@/actions/budgets";
import { createCategoryAction } from "@/actions/categories";
import { useToast } from "@/lib/context/ToastContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { averageSpendFor, cadenceAmountOf, CADENCE_LABEL } from "@/lib/utils/budgetPace";
import { activeBudgetsFor, budgetStart, cycleFor, dailyRateFor, daysBetween, formatCycleRange, nextCycle, startOfDay } from "@/lib/utils/budgetCycle";
import type { Budget, BudgetCadence } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const CADENCES: { value: BudgetCadence; label: string; hint: string }[] = [
  { value: "daily", label: "hari", hint: "Untuk makan, kopi, jajan — pengeluaran yang terjadi hampir tiap hari." },
  { value: "weekly", label: "minggu", hint: "Untuk bensin, hiburan, self reward — rutin tapi tidak harian." },
  { value: "monthly", label: "siklus", hint: "Untuk tagihan, belanja bulanan, cicilan — sekali-dua kali per gajian." },
];

const LIQUID = ["bank", "ewallet", "cash"];
const STEPS = ["Kategori", "Jatah", "Cek"] as const;
type StartChoice = "keep" | "today" | "cycle" | "next";

const shortDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

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
  const accounts = useAccounts();
  const goals = useGoals();
  const preferences = usePreferences();
  const { showToast } = useToast();
  const cycleDay = preferences.budgetCycleDay ?? 1;

  const now = useMemo(() => new Date(), []);
  const cycle = useMemo(() => cycleFor(now, cycleDay), [now, cycleDay]);
  const upcoming = useMemo(() => nextCycle(cycle, cycleDay), [cycle, cycleDay]);

  const [step, setStep] = useState(editing ? 1 : 0);
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [cadence, setCadence] = useState<BudgetCadence>(editing?.cadence ?? "daily");
  const [amount, setAmount] = useState(editing ? String(cadenceAmountOf(editing)) : "");
  const [startChoice, setStartChoice] = useState<StartChoice>(editing ? "keep" : "today");
  const [accountIds, setAccountIds] = useState<string[]>(editing?.accountIds ?? []);
  const [repeat, setRepeat] = useState(editing ? editing.repeat !== false : true);
  const [rollover, setRollover] = useState(editing ? editing.rollover !== false : true);
  const [leftoverGoalId, setLeftoverGoalId] = useState(editing?.leftoverGoalId ?? "");
  const [saving, setSaving] = useState(false);

  const expense = categories.filter((category) => category.type === "expense");
  const budgeted = new Set(activeBudgetsFor(budgets, cycle, cycleDay).map((budget) => budget.categoryId));
  const options = expense
    .map((category) => ({
      category,
      taken: budgeted.has(category.id) && category.id !== editing?.categoryId,
      monthlyAverage: averageSpendFor(category.id, "monthly", transactions, cycle.key),
    }))
    .sort((a, b) => Number(a.taken) - Number(b.taken) || b.monthlyAverage - a.monthlyAverage);
  const hasSelfReward = expense.some((category) => /self\s*reward/i.test(category.name));

  const category = categories.find((item) => item.id === categoryId);
  const value = Number(amount || 0);
  const unit = CADENCE_LABEL[cadence].unit;
  const suggestion = categoryId ? averageSpendFor(categoryId, cadence, transactions, cycle.key) : 0;

  const today = startOfDay(now);
  const startDate =
    startChoice === "keep" && editing ? budgetStart(editing, cycleDay)
      : startChoice === "cycle" ? cycle.start
        : startChoice === "next" ? upcoming.start
          : today;
  const dailyRate = dailyRateFor(cadence, value, cycle.days);
  const fullCycle = Math.round(dailyRate * cycle.days);
  const activeDaysNow = startDate > cycle.end ? 0 : cycle.days - Math.max(0, daysBetween(cycle.start, startDate));
  const thisCycle = Math.round(dailyRate * activeDaysNow);

  const liquidAccounts = accounts.filter((account) => account.isActive && LIQUID.includes(account.type));
  const fundAccounts = accountIds.length ? liquidAccounts.filter((account) => accountIds.includes(account.id)) : liquidAccounts;
  const fund = fundAccounts.reduce((sum, account) => sum + account.balance, 0);
  const fundEnough = fund >= thisCycle;

  const startOptions: { value: StartChoice; label: string; hint: string }[] = [
    ...(editing ? [{ value: "keep" as const, label: `Tetap · ${shortDate.format(budgetStart(editing, cycleDay))}`, hint: "Tanggal mulai tidak diubah" }] : []),
    { value: "today", label: `Hari ini · ${shortDate.format(today)}`, hint: "Belanja sebelum hari ini tidak dihitung" },
    { value: "cycle", label: `Awal siklus · ${shortDate.format(cycle.start)}`, hint: `Belanja sejak ${shortDate.format(cycle.start)} ikut dihitung` },
    { value: "next", label: `Siklus depan · ${shortDate.format(upcoming.start)}`, hint: "Mulai bersih di siklus berikutnya" },
  ];

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

  function toggleAccount(id: string) {
    setAccountIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function save() {
    if (!categoryId || !value) return;
    const period = cycleFor(startDate, cycleDay).key;
    const draft: Budget = {
      id: editing?.id ?? `bud-${categoryId}-${Date.now()}`,
      categoryId,
      period,
      limitAmount: cadence === "monthly" ? value : fullCycle,
      cadence,
      cadenceAmount: cadence === "monthly" ? undefined : value,
      rollover: cadence === "monthly" ? true : rollover,
      startDate,
      repeat,
      accountIds: accountIds.length ? accountIds : undefined,
      leftoverGoalId: leftoverGoalId || undefined,
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
      message: `${category?.name ?? "Kategori"}: ${formatRupiah(value)} per ${unit}, mulai ${shortDate.format(startDate)}.`,
    });
    if ("warning" in result && result.warning) showToast({ type: "info", title: "Perlu pembaruan database", message: result.warning });
    onClose();
  }

  const firstStep = editing ? 1 : 0;

  return (
    <Modal open onClose={() => { if (!saving) onClose(); }} title={editing ? "Ubah anggaran" : "Anggaran baru"} description={`Siklus ${formatCycleRange(cycle)} · ${cycle.days} hari`} className="sm:max-w-lg">
      <ol className="flex items-center gap-2 px-5 pt-4" aria-label="Langkah">
        {STEPS.map((label, index) => {
          if (editing && index === 0) return null;
          const done = index < step;
          const current = index === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2" aria-current={current ? "step" : undefined}>
              <span className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                done ? "bg-mint text-white" : current ? "bg-brand-700 text-white" : "border-2 border-rule-strong text-ink-muted",
              )}>
                {done ? <Check className="h-4 w-4" /> : index + 1 - firstStep}
              </span>
              <span className={cn("text-sm font-semibold", current ? "text-ink" : "text-ink-muted")}>{label}</span>
              {index < STEPS.length - 1 ? <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-mint" : "bg-rule")} /> : null}
            </li>
          );
        })}
      </ol>

      <div key={step} className="animate-in fade-in slide-in-from-right-2 min-h-[18rem] px-5 py-5">
        {step === 0 ? (
          <div>
            <h3 className="text-base font-bold text-ink">Untuk pengeluaran apa?</h3>
            <p className="mt-0.5 text-sm text-ink-muted">Angka kecil = rata-rata belanjamu per bulan.</p>
            <div className="mt-4 grid max-h-[46dvh] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {options.map(({ category: item, taken, monthlyAverage }) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={taken}
                  onClick={() => { setCategoryId(item.id); setStep(1); }}
                  className={cn(
                    "flex min-h-14 items-center gap-2.5 rounded-sm border p-2.5 text-left transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
                    categoryId === item.id ? "border-2 border-brand-700 bg-surface-high" : "border-rule bg-surface hover:border-brand-400",
                  )}
                >
                  <CategoryIcon icon={item.icon} color={item.color} size={14} containerSize="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                    <span className="block truncate text-xs text-ink-muted">
                      {taken ? "Sudah dianggarkan" : monthlyAverage ? `±${formatRupiah(monthlyAverage)}/bln` : "Belum ada riwayat"}
                    </span>
                  </span>
                </button>
              ))}
              {!hasSelfReward ? (
                <button type="button" onClick={createSelfReward} className="flex min-h-14 items-center gap-2.5 rounded-sm border border-dashed border-lavender/60 p-2.5 text-left text-lavender-ink transition hover:bg-lavender-10">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-lavender-10"><Gift className="h-3.5 w-3.5" /></span>
                  <span className="text-sm font-bold">+ Self Reward</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              {category ? <CategoryIcon icon={category.icon} color={category.color} size={14} containerSize="sm" /> : null}
              <h3 className="text-base font-bold text-ink">Berapa batas untuk {category?.name ?? "kategori ini"}?</h3>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-1 rounded-sm bg-surface-soft p-1" role="radiogroup" aria-label="Ritme jatah">
                {CADENCES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={cadence === option.value}
                    onClick={() => setCadence(option.value)}
                    className={cn("h-11 rounded-xs text-sm font-bold transition", cadence === option.value ? "bg-brand-950 text-white" : "text-ink-muted hover:text-ink")}
                  >
                    per {option.label}
                  </button>
                ))}
              </div>
              <label className="mt-3 flex min-h-16 items-center gap-2 rounded-card border-2 border-ink bg-surface-high px-4">
                <span className="text-lg font-bold text-ink-muted">Rp</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  aria-label={`Nominal jatah per ${unit}`}
                  data-bare-input="true"
                  value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="min-w-0 flex-1 bg-transparent font-display text-[2rem] font-semibold tabular-nums text-ink outline-none placeholder:text-ink-soft"
                />
                <span className="text-sm font-bold text-ink-muted">/{unit}</span>
              </label>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{CADENCES.find((option) => option.value === cadence)?.hint}</p>
              {suggestion ? (
                <button type="button" onClick={() => setAmount(String(suggestion))} className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-rule bg-surface-high px-3 text-sm font-semibold text-ink transition hover:border-brand-400">
                  <Lightbulb className="h-4 w-4 text-brass" />
                  Rata-rata {formatRupiah(suggestion)}/{unit} · pakai
                </button>
              ) : null}
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Berlaku mulai</legend>
              <div className="grid gap-2" role="radiogroup" aria-label="Berlaku mulai">
                {startOptions.map((option) => {
                  const selected = startChoice === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setStartChoice(option.value)}
                      className={cn("flex min-h-14 items-center gap-3 rounded-sm px-3.5 text-left transition", selected ? "border-2 border-brand-700 bg-surface-high" : "border border-rule bg-surface-high hover:border-brand-400")}
                    >
                      <span aria-hidden className={cn("h-5 w-5 shrink-0 rounded-full", selected ? "border-[6px] border-brand-700" : "border-2 border-rule-strong")} />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink">{option.label}</span>
                        <span className="block text-xs text-ink-muted">{option.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {value ? (
              <div className="flex items-center justify-between gap-3 rounded-sm bg-brand-950 px-4 py-3 text-white">
                <span className="text-sm text-white/80">Jatah di siklus ini{activeDaysNow > 0 && activeDaysNow < cycle.days ? ` (${activeDaysNow} hari)` : ""}</span>
                <span className="text-base font-bold tabular-nums">{activeDaysNow > 0 ? formatRupiah(thisCycle) : `Mulai ${shortDate.format(startDate)}`}</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-card bg-brand-700 p-5 text-white">
              <div className="flex items-center gap-2.5">
                {category ? <span className="rounded-xs bg-white p-0.5"><CategoryIcon icon={category.icon} color={category.color} size={14} containerSize="sm" /></span> : null}
                <p className="font-bold">{category?.name}</p>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-white/80">Jatah per {unit}</p>
              <p className="font-display text-3xl font-semibold tabular-nums">{formatRupiah(value)}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-sm bg-white/12 p-2.5"><dt className="text-xs text-white/80">Siklus ini</dt><dd className="mt-0.5 font-bold tabular-nums">{activeDaysNow > 0 ? formatRupiah(thisCycle) : "—"}</dd></div>
                <div className="rounded-sm bg-white/12 p-2.5"><dt className="text-xs text-white/80">Mulai</dt><dd className="mt-0.5 font-bold">{shortDate.format(startDate)}</dd></div>
              </dl>
            </div>

            <fieldset>
              <legend className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Sumber dana</legend>
              <p className="mb-2 text-sm text-ink-muted">Hanya belanja dari rekening terpilih yang dihitung. Kosongkan = semua rekening.</p>
              <div className="grid gap-2">
                {liquidAccounts.map((account) => {
                  const checked = accountIds.includes(account.id);
                  return (
                    <button
                      key={account.id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleAccount(account.id)}
                      className={cn("flex min-h-12 items-center gap-3 rounded-sm px-3.5 text-left transition", checked ? "border-2 border-brand-700 bg-surface-high" : "border border-rule bg-surface-high hover:border-brand-400")}
                    >
                      <span aria-hidden className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-[6px]", checked ? "bg-brand-700 text-white" : "border-2 border-rule-strong")}>{checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{account.name}</span>
                      <span className="text-sm font-bold tabular-nums text-ink">{formatRupiah(account.balance)}</span>
                    </button>
                  );
                })}
              </div>
              {thisCycle > 0 ? (
                <p className={cn("mt-2 rounded-sm px-3.5 py-2.5 text-sm font-semibold text-white", fundEnough ? "bg-mint-ink" : "bg-ember-ink")}>
                  {fundEnough
                    ? `Saldo ${accountIds.length ? "terpilih" : "semua rekening"} ${formatRupiah(fund)} — cukup untuk jatah siklus ini.`
                    : `Saldo ${accountIds.length ? "terpilih" : ""} ${formatRupiah(fund)} — kurang ${formatRupiah(thisCycle - fund)} untuk jatah siklus ini.`}
                </p>
              ) : null}
            </fieldset>

            {goals.length > 0 ? (
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                Sisa di akhir siklus
                <select value={leftoverGoalId} onChange={(event) => setLeftoverGoalId(event.target.value)} className="mt-1 h-12 w-full rounded-sm border border-rule-strong bg-surface-high px-3 text-[15px] font-semibold normal-case tracking-normal text-ink">
                  <option value="">Biarkan (tidak disetor ke mana pun)</option>
                  {goals.map((goal) => <option key={goal.id} value={goal.id}>Setor ke tujuan: {goal.name}</option>)}
                </select>
                <span className="mt-1 block text-xs font-medium normal-case tracking-normal text-ink-muted">Sisa jatah siklus yang sudah berakhir otomatis ditambahkan ke progres tujuan.</span>
              </label>
            ) : null}

            <div className="divide-y divide-rule rounded-sm border border-rule">
              <SwitchRow label="Ulangi tiap siklus" hint={`Lanjut otomatis ${shortDate.format(upcoming.start)} dan seterusnya`} checked={repeat} onChange={setRepeat} />
              {cadence !== "monthly" ? (
                <SwitchRow
                  label={`Sisa jatah terbawa ke ${unit} berikutnya`}
                  hint={`Kelebihan juga mengurangi jatah ${unit} berikutnya`}
                  checked={rollover}
                  onChange={setRollover}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 flex gap-3 border-t border-rule bg-surface-high px-5 py-4 pb-[max(1rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] sm:pb-4">
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

function SwitchRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block text-xs text-ink-muted">{hint}</span>
      </span>
      <span aria-hidden className={cn("flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors", checked ? "justify-end bg-brand-700" : "justify-start bg-rule-strong")}>
        <span className="h-6 w-6 rounded-full bg-white shadow-card" />
      </span>
    </button>
  );
}
