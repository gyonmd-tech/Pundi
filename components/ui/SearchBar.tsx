"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { SearchField } from "./SearchField";

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
      <SearchField
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onClear={() => onValueChange("")}
        placeholder={placeholder}
        {...props}
      />
    </form>
  );
}
