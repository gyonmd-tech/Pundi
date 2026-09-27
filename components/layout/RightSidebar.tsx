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
      <aside className="absolute bottom-2 right-2 top-2 w-[calc(100%-1rem)] max-w-[440px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-clay animate-in slide-in-from-right duration-300 sm:bottom-3 sm:right-3 sm:top-3">
        <QuickAddPanel onClose={onQuickAddClose} />
      </aside>
    </div>
  );
}
