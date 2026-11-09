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
          "h-11 w-full rounded-sm border border-rule bg-surface-high px-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow,background] duration-150 placeholder:text-ink-soft hover:border-rule-strong focus:border-brand-500 focus:shadow-focus",
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
      <span className="flex items-center justify-between gap-3 text-xs font-semibold text-ink">
        <span>{label}{required ? <span className="ml-1 text-ember">*</span> : null}</span>
        {hint ? <span className="font-normal text-ink-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
