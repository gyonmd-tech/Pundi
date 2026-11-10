import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Header halaman yang sama di semua halaman aplikasi: judul (Fraunces),
 * keterangan singkat (maks. 2 baris di ponsel), dan aksi di kanan. Di ponsel
 * aksi utama cukup ikon + aria-label; teksnya tampil mulai `sm`.
 */
export function PageHeader({ title, description, actions, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-subtitle line-clamp-2 sm:line-clamp-none">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div> : null}
    </header>
  );
}
