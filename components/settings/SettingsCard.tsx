import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const toneClasses = {
  violet: "border-pine/15 bg-[linear-gradient(145deg,rgba(239,236,255,.96),rgba(255,255,255,.94))]",
  blue: "border-sky/15 bg-[linear-gradient(145deg,rgba(234,243,255,.92),rgba(255,255,255,.96))]",
  mint: "border-mint/15 bg-[linear-gradient(145deg,rgba(229,248,241,.88),rgba(255,255,255,.96))]",
  amber: "border-brass/15 bg-[linear-gradient(145deg,rgba(255,246,220,.9),rgba(255,255,255,.96))]",
} as const;

const iconClasses = {
  violet: "bg-pine-10 text-pine",
  blue: "bg-sky-10 text-sky",
  mint: "bg-mint-10 text-mint",
  amber: "bg-brass-10 text-brass",
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
