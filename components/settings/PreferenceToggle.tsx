"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PreferenceToggleProps {
  label: string;
  description: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone?: "pine" | "mint" | "sky";
}

const iconTone = {
  pine: "text-brand-700",
  mint: "text-mint-ink",
  sky: "text-ink",
};

/** Satu baris preferensi = satu tombol switch (area sentuh penuh). */
export function PreferenceToggle({ label, description, icon: Icon, checked, onChange, tone = "pine" }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="pressable flex w-full items-center gap-3 rounded-sm border border-rule bg-surface p-3.5 text-left transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", iconTone[tone])} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{description}</span>
      </span>
      <span aria-hidden className={cn("relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors duration-200", checked ? "bg-brand-600" : "bg-rule-strong")}>
        <span className={cn("block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,41,.25)] transition-transform duration-200 ease-[var(--ease-out)]", checked && "translate-x-4")} />
      </span>
    </button>
  );
}
