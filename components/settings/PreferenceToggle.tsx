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
  pine: "bg-brand-600 text-white",
  mint: "bg-mint-ink text-white",
  sky: "bg-brand-900 text-white",
};

export function PreferenceToggle({ label, description, icon: Icon, checked, onChange, tone = "pine" }: PreferenceToggleProps) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-brand-50 p-3.5 sm:p-4">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[12px]", iconTone[tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-ink">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted sm:text-xs">{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-pine/15", checked ? "bg-pine" : "bg-rule-strong")}>
        <span className={cn("block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200", checked && "translate-x-5")} />
      </button>
    </div>
  );
}
