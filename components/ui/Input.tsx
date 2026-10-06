"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, icon, error, id, ...props }, ref) => (
  <div className="w-full">
    <div className="relative">
      {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span> : null}
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-[15px] border border-surface-high/80 bg-[linear-gradient(145deg,var(--color-surface-high),var(--color-brand-50))] px-3.5 text-sm text-ink outline-none shadow-clay-soft transition-[border-color,box-shadow,background] placeholder:text-ink-muted/70 focus:border-pine/45 focus:bg-surface-high focus:shadow-[inset_2px_2px_7px_rgba(40,96,230,.08),0_0_0_4px_rgba(40,96,230,.1)]",
          icon && "pl-10",
          error && "border-ember focus:border-ember focus:ring-ember/15",
          className,
        )}
        {...props}
      />
    </div>
    {error ? <p id={id ? `${id}-error` : undefined} className="mt-1.5 text-xs font-medium text-ember">{error}</p> : null}
  </div>
));
Input.displayName = "Input";

export function Field({ label, hint, required, children, className }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="flex items-center justify-between gap-3 text-xs font-bold text-ink">
        <span>{label}{required ? <span className="ml-1 text-ember">*</span> : null}</span>
        {hint ? <span className="font-normal text-ink-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
