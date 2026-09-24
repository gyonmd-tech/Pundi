"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  align?: "left" | "right";
  className?: string;
  contentClassName?: string;
}

export function Dropdown({ trigger, children, align = "right", className, contentClassName }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          role="menu"
          className={cn("absolute top-full z-50 mt-2 min-w-56 rounded-[18px] border border-rule bg-white p-2 shadow-float animate-in fade-in slide-in-from-top-2", align === "left" ? "left-0" : "right-0", contentClassName)}
        >
          {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button role="menuitem" type="button" className={cn("flex min-h-10 w-full items-center gap-2 rounded-[12px] px-3 text-left text-sm font-medium text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/25", className)} {...props} />;
}
