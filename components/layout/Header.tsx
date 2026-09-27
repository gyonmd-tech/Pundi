"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4 lg:px-5">
      <div className="rounded-[24px] border border-brand-200/80 bg-[#F9FBFF]/96 p-2.5 shadow-card backdrop-blur-xl">
        <div className="flex min-h-12 flex-wrap items-center gap-2 lg:grid lg:grid-cols-[minmax(320px,1fr)_minmax(280px,560px)_minmax(205px,auto)] lg:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:col-start-1 lg:row-start-1">
            <AccountDropdown selectedId={selectedAccountId} onSelect={(id) => onSelectAccount?.(id)} />
            <HeaderDateBadge />
          </div>

          <div className="order-3 mt-1 flex w-full min-w-0 justify-center lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0">
            <HeaderSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-2 lg:col-start-3 lg:row-start-1 lg:ml-0">
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
