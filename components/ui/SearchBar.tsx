"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./Button";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSubmit"> {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export function SearchBar({ value, onValueChange, onSubmit, className, placeholder = "Cari...", ...props }: SearchBarProps) {
  return (
    <form
      role="search"
      className={cn("relative w-full", className)}
      onSubmit={(event) => { event.preventDefault(); onSubmit?.(value.trim()); }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[14px] border border-rule bg-white pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-pine focus:ring-2 focus:ring-pine/15"
        {...props}
      />
      {value ? (
        <IconButton type="button" variant="ghost" size="icon" aria-label="Hapus pencarian" className="absolute right-1 top-1/2 h-9 min-h-9 w-9 -translate-y-1/2" onClick={() => onValueChange("")}>
          <X className="h-4 w-4" />
        </IconButton>
      ) : null}
    </form>
  );
}
