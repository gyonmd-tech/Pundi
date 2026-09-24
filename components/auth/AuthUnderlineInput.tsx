import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface AuthUnderlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: ReactNode;
}

export function AuthUnderlineInput({ label, icon: Icon, suffix, id, className, ...props }: AuthUnderlineInputProps) {
  const inputId = id || props.name;
  return (
    <label htmlFor={inputId} className="group block text-left">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-muted transition-colors group-focus-within:text-pine">
        {label}
      </span>
      <span className="relative mt-2 flex min-h-12 items-center gap-3 border-b border-rule-strong">
        <Icon className="h-[18px] w-[18px] shrink-0 text-ink-muted transition-colors group-focus-within:text-pine" />
        <input
          id={inputId}
          className={cn("auth-underline-input h-12 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/70 focus:outline-none focus:ring-0 focus-visible:rounded-none focus-visible:shadow-none", suffix && "pr-11", className)}
          {...props}
        />
        {suffix ? <span className="absolute bottom-1 right-0 grid h-10 w-10 place-items-center">{suffix}</span> : null}
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 origin-center scale-x-0 rounded-full bg-pine transition-transform duration-300 ease-out group-focus-within:scale-x-100" />
      </span>
    </label>
  );
}
