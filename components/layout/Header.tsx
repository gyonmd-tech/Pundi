"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccountDropdown } from "./AccountDropdown";
import { HeaderDateBadge } from "./HeaderDateBadge";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationDropdown } from "./NotificationDropdown";
import { ConnectionBadge } from "./ConnectionBadge";

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
      <div className="rounded-[24px] border border-pine/10 bg-white/88 p-2.5 shadow-card backdrop-blur-xl">
        <div className="flex min-h-12 flex-wrap items-center gap-2 lg:grid lg:grid-cols-[minmax(260px,1fr)_minmax(340px,640px)_minmax(230px,1fr)] lg:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:col-start-1 lg:row-start-1">
            <AccountDropdown selectedId={selectedAccountId} onSelect={(id) => onSelectAccount?.(id)} />
            <HeaderDateBadge />
            <ConnectionBadge />
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
              className="h-11 min-h-11 w-11 rounded-[16px] border-pine/80 bg-[linear-gradient(135deg,#6552F5,#5140DD)] px-0 font-semibold tracking-[-0.01em] shadow-[0_8px_20px_rgba(91,74,239,0.22)] hover:shadow-[0_10px_26px_rgba(91,74,239,0.28)] sm:w-auto sm:px-5"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Tambah transaksi</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}