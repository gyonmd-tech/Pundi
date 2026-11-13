"use client";

/**
 * components/budget/BudgetCycleSheet.tsx
 * Memilih tanggal mulai siklus anggaran (tanggal gajian). Disimpan sebagai
 * preferensi `budgetCycleDay`; semua anggaran ikut dihitung per siklus ini.
 */
import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp, usePreferences, DEMO_PREFERENCES_STORAGE_KEY } from "@/lib/data/store";
import { updatePreferencesAction } from "@/actions/preferences";
import { useToast } from "@/lib/context/ToastContext";
import { cycleFor, daysBetween, END_OF_MONTH, formatCycleRange, normalizeCycleDay } from "@/lib/utils/budgetCycle";
import { cn } from "@/lib/utils/cn";

const DAYS = [...Array.from({ length: 28 }, (_, index) => index + 1), END_OF_MONTH];

export function BudgetCycleSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <SheetBody onClose={onClose} />;
}

function SheetBody({ onClose }: { onClose: () => void }) {
  const { dispatch, connection } = useApp();
  const preferences = usePreferences();
  const { showToast } = useToast();
  const [day, setDay] = useState(normalizeCycleDay(preferences.budgetCycleDay ?? 1));
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const cycle = cycleFor(now, day);
  const passed = daysBetween(cycle.start, now) + 1;
  const pct = Math.min(100, Math.round((passed / cycle.days) * 100));

  async function save() {
    const previous = preferences;
    const merged = { ...preferences, budgetCycleDay: day };
    dispatch({ type: "UPDATE_PREFERENCES", payload: merged });
    if (connection.mode === "demo" || connection.mode === "guest") {
      try {
        localStorage.setItem(DEMO_PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // localStorage tidak tersedia — berlaku untuk sesi ini saja.
      }
      onClose();
      return;
    }
    setSaving(true);
    const result = await updatePreferencesAction({ budgetCycleDay: day });
    setSaving(false);
    if (!result.success) {
      dispatch({ type: "UPDATE_PREFERENCES", payload: previous });
      showToast({ type: "error", title: "Siklus gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    showToast({ type: "success", title: "Siklus anggaran diperbarui", message: `Siklus berjalan: ${formatCycleRange(cycle)}.` });
    onClose();
  }

  return (
    <Modal open onClose={() => { if (!saving) onClose(); }} title="Siklus anggaran" description="Mulai siklus di hari uangmu masuk, supaya jatah tidak habis sebelum gajian." className="sm:max-w-md">
      <div className="space-y-5 px-5 py-5">
        <div className="grid grid-cols-2 gap-1 rounded-sm bg-surface-soft p-1" role="radiogroup" aria-label="Jenis siklus">
          {[{ label: "Tanggal 1", value: 1 }, { label: "Tanggal gajian", value: day === 1 ? 25 : day }].map((option) => {
            const selected = option.value === 1 ? day === 1 : day !== 1;
            return (
              <button key={option.label} type="button" role="radio" aria-checked={selected} onClick={() => setDay(option.value)} className={cn("h-11 rounded-xs text-sm font-bold transition", selected ? "bg-brand-950 text-white" : "text-ink-muted hover:text-ink")}>
                {option.label}
              </button>
            );
          })}
        </div>

        {day !== 1 ? (
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Tanggal gajian</legend>
            <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Tanggal gajian">
              {DAYS.filter((value) => value !== 1).map((value) => {
                const selected = value === day;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={value === END_OF_MONTH ? "Akhir bulan" : `Tanggal ${value}`}
                    onClick={() => setDay(value)}
                    className={cn("h-11 rounded-sm text-sm tabular-nums transition", selected ? "bg-brand-700 font-bold text-white" : "border border-rule bg-surface-high font-semibold text-ink hover:border-brand-400", value === END_OF_MONTH && "col-span-2 text-xs")}
                  >
                    {value === END_OF_MONTH ? "Akhir bulan" : value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="rounded-card bg-brand-950 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/75">Siklus berjalan</p>
          <p className="mt-1 text-lg font-bold tabular-nums">{formatCycleRange(cycle)} · {cycle.days} hari</p>
          <div className="relative mt-3 h-2.5 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-lime" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-white/80">Hari ke-{passed} · {cycle.days - passed} hari lagi</p>
        </div>
      </div>
      <footer className="sticky bottom-0 flex gap-3 border-t border-rule bg-surface-high px-5 py-4 pb-[max(1rem,var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] sm:pb-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        <Button type="button" className="flex-1" loading={saving} onClick={save}><Check className="h-4 w-4" />Simpan siklus</Button>
      </footer>
    </Modal>
  );
}
