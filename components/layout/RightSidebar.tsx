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
      <aside className="absolute inset-y-0 right-0 w-full overflow-hidden bg-white shadow-float animate-in slide-in-from-right duration-300 sm:bottom-3 sm:right-3 sm:top-3 sm:max-w-[440px] sm:rounded-[26px] sm:border sm:border-pine/10">
        <QuickAddPanel onClose={onQuickAddClose} />
      </aside>
    </div>
  );
}