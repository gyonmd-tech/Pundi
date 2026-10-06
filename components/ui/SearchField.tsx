"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  containerClassName?: string;
  onClear?: () => void;
  shortcut?: string;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, containerClassName, onClear, shortcut, value, ...props }, ref) => {
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div
        className={cn(
          "relative flex h-12 w-full items-center rounded-[18px] bg-surface-high px-3.5 shadow-[0_10px_28px_rgba(18,44,111,.10)] transition-[background-color,box-shadow] duration-200 focus-within:bg-surface-high focus-within:shadow-[0_14px_34px_rgba(18,44,111,.16)]",
          containerClassName,
        )}
      >
        <span className="pointer-events-none grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-brand-100 text-brand-700" aria-hidden="true">
          <Search className="h-4 w-4" />
        </span>
        <input
          ref={ref}
          data-search-input="true"
          value={value}
          className={cn(
            "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-semibold text-ink outline-none ring-0 placeholder:font-medium placeholder:text-ink-muted focus:border-0 focus:outline-none focus:ring-0",
            className,
          )}
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Hapus pencarian"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-brand-900 text-white transition hover:bg-brand-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : shortcut ? (
          <kbd className="pointer-events-none shrink-0 rounded-[8px] bg-brand-900 px-2 py-1 text-[10px] font-bold text-white">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    );
  },
);

SearchField.displayName = "SearchField";
