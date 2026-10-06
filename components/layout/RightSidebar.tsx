"use client";

import { QuickAddPanel } from "@/components/transaction/QuickAddPanel";

interface RightSidebarProps {
  quickAddOpen: boolean;
  onQuickAddClose: () => void;
}

export function RightSidebar({ quickAddOpen, onQuickAddClose }: RightSidebarProps) {
  if (!quickAddOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(28,24,47,0.42)] backdrop-blur-[3px] animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Tambah transaksi"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onQuickAddClose(); }}
    >
      <aside className="absolute inset-x-0 bottom-0 top-[max(2.5rem,env(safe-area-inset-top))] overflow-hidden rounded-t-[28px] border border-rule bg-surface-high pb-[env(safe-area-inset-bottom)] shadow-clay animate-in slide-in-from-bottom duration-300 sm:inset-x-auto sm:bottom-3 sm:right-3 sm:top-3 sm:w-[calc(100%-1.5rem)] sm:max-w-[440px] sm:rounded-[28px] sm:pb-0 sm:slide-in-from-right">
        <QuickAddPanel onClose={onQuickAddClose} />
      </aside>
    </div>
  );
}
