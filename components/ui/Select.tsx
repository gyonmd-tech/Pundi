"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OptionData {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, value, defaultValue, onChange, disabled, name, id, "aria-label": ariaLabel, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(String(defaultValue ?? ""));
    const rootRef = React.useRef<HTMLDivElement>(null);
    const options = React.Children.toArray(children).flatMap<OptionData>((child) => {
      if (!React.isValidElement<{ value?: string | number; disabled?: boolean; children?: React.ReactNode }>(child) || child.type !== "option") return [];
      return [{ value: String(child.props.value ?? ""), label: child.props.children, disabled: Boolean(child.props.disabled) }];
    });
    const currentValue = value !== undefined ? String(value) : internalValue;
    const selected = options.find((option) => option.value === currentValue) ?? options[0];

    React.useEffect(() => {
      function onOutside(event: MouseEvent) {
        if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
      }
      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onOutside);
        document.removeEventListener("keydown", onKey);
      };
    }, []);

    function choose(nextValue: string) {
      if (value === undefined) setInternalValue(nextValue);
      const event = { target: { value: nextValue, name }, currentTarget: { value: nextValue, name } } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(event);
      setOpen(false);
    }

    return (
      <div ref={rootRef} className="relative w-full">
        <select ref={ref} id={id} name={name} value={currentValue} onChange={onChange} disabled={disabled} tabIndex={-1} aria-hidden className="sr-only" {...props}>{children}</select>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((state) => !state)}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-3 rounded-[14px] border border-pine/12 bg-[linear-gradient(145deg,#FFFFFF,#FAF9FF)] px-3.5 text-left text-sm font-semibold text-ink outline-none shadow-2xs transition hover:border-pine/30 focus-visible:border-pine focus-visible:ring-4 focus-visible:ring-pine/10 disabled:opacity-50",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? "Pilih opsi"}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-pine transition-transform", open && "rotate-180")} />
        </button>
        {open ? (
          <div role="listbox" className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-64 overflow-y-auto rounded-[16px] border border-pine/12 bg-white p-1.5 shadow-float animate-in fade-in slide-in-from-top-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === currentValue}
                disabled={option.disabled}
                onClick={() => choose(option.value)}
                className={cn(
                  "flex min-h-10 w-full items-center gap-2 rounded-[11px] px-3 text-left text-sm font-medium transition",
                  option.value === currentValue ? "bg-pine-10 font-bold text-pine" : "text-ink hover:bg-paper",
                  option.disabled && "pointer-events-none opacity-40",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.value === currentValue ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";