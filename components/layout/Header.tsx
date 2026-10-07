"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { AccountDropdown } from "./AccountDropdown";
import { HeaderDateBadge } from "./HeaderDateBadge";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationDropdown } from "./NotificationDropdown";

interface HeaderProps {
  onQuickAdd: () => void;
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
}

export function Header({ onQuickAdd, selectedAccountId = "all", onSelectAccount }: HeaderProps) {
  const pathname = usePathname();
  // Di ponsel, kolom pencarian dilipat jadi tombol ikon supaya header tetap satu baris.
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileSearchOpen(false);
  }

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "+" && !isTyping) onQuickAdd();
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [onQuickAdd]);

  return (
    <header className="sticky top-0 z-20 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-3 lg:px-5">
      <div className="rounded-[20px] border border-brand-200/80 bg-surface/95 p-2 shadow-card backdrop-blur-xl sm:rounded-[24px] sm:p-2.5">
        <div className="flex min-h-11 flex-wrap items-center gap-2 lg:grid lg:min-h-12 lg:grid-cols-[minmax(320px,1fr)_minmax(280px,560px)_minmax(205px,auto)] lg:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:col-start-1 lg:row-start-1">
            <Link href="/dashboard" aria-label="Pundi — ke dashboard" className="shrink-0 overflow-hidden rounded-[13px] shadow-card md:hidden">
              <Image src="/PUNDI-brand-assets/app-icon-192.png" alt="" width={40} height={40} className="h-10 w-10" priority />
            </Link>
            <AccountDropdown selectedId={selectedAccountId} onSelect={(id) => onSelectAccount?.(id)} />
            <HeaderDateBadge />
          </div>

          <div className={cn("order-3 mt-1 w-full min-w-0 justify-center sm:flex lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0", mobileSearchOpen ? "flex animate-in fade-in slide-in-from-top-1 duration-200" : "hidden")}>
            <HeaderSearch autoFocus={mobileSearchOpen} />
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:col-start-3 lg:row-start-1 lg:ml-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              aria-label={mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"}
              aria-expanded={mobileSearchOpen}
              className="grid h-10 w-10 place-items-center rounded-[14px] border border-brand-200 bg-surface-high text-ink shadow-card transition active:scale-95 sm:hidden"
            >
              {mobileSearchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>
            <NotificationDropdown />
            <Button
              type="button"
              aria-label="Tambah transaksi"
              onClick={onQuickAdd}
              className="hidden h-11 min-h-11 px-5 sm:inline-flex"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              <span>Tambah transaksi</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
