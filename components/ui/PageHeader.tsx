import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>{eyebrow ? <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-pine">{eyebrow}</p> : null}<h1 className="text-2xl font-black tracking-[-0.035em] text-ink sm:text-3xl">{title}</h1>{description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p> : null}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
