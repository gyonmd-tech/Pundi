import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const toneClasses = {
  violet: "border-rule bg-surface-high",
  blue: "border-rule bg-surface-high",
  mint: "border-rule bg-surface-high",
  amber: "border-rule bg-surface-high",
} as const;

// Ikon tonal (latar lembut + ikon berwarna), bukan blok warna penuh.
const iconClasses = {
  violet: "bg-brand-100 text-brand-700",
  blue: "bg-surface-soft text-ink",
  mint: "bg-mint-10 text-mint-ink",
  amber: "bg-warning-10 text-warning-ink",
} as const;

interface SettingsCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsCard({ title, description, icon: Icon, tone = "violet", action, children, className }: SettingsCardProps) {
  return (
    <section className={cn("flex h-full min-w-0 flex-col rounded-card border p-4 shadow-card sm:p-5", toneClasses[tone], className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xs", iconClasses[tone])}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
