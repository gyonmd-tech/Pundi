import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const toneClasses = {
  violet: "border-brand-600/10 bg-white",
  blue: "border-brand-600/10 bg-white",
  mint: "border-brand-600/10 bg-white",
  amber: "border-brand-600/10 bg-white",
} as const;

const iconClasses = {
  violet: "bg-brand-600 text-white shadow-card",
  blue: "bg-brand-900 text-white shadow-card",
  mint: "bg-mint-ink text-white shadow-card",
  amber: "bg-[#855A00] text-white shadow-card",
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
    <section className={cn("flex h-full flex-col rounded-[26px] border p-4 shadow-card sm:p-5", toneClasses[tone], className)}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-rule/70 pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[13px]", iconClasses[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-[-0.02em] text-ink sm:text-lg">{title}</h2>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
