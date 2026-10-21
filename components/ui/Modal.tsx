"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./Button";
import { useIsClient } from "./usePortalPosition";

export function Modal({ open, onClose, title, description, children, className }: { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; className?: string }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [open, onClose]);
  const isClient = useIsClient();
  if (!open || !isClient) return null;
  // Portal ke <body>: modal tidak ikut terkurung/terpotong oleh wadah halaman.
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-end bg-[var(--color-scrim)] p-0 backdrop-blur-sm sm:place-items-center sm:p-4" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] border border-rule bg-surface-high shadow-float sm:max-w-xl sm:rounded-[24px]", className)}>
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rule bg-surface-high/95 p-5 backdrop-blur">
          <div><h2 id="modal-title" className="text-lg font-extrabold text-ink">{title}</h2>{description ? <p className="mt-1 text-xs text-ink-muted">{description}</p> : null}</div>
          <IconButton type="button" variant="ghost" aria-label="Tutup dialog" onClick={onClose}><X className="h-5 w-5" /></IconButton>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
