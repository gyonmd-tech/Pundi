"use client";

import * as React from "react";

interface QuickAddContextValue {
  isOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
}

const QuickAddContext = React.createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({
      isOpen,
      openQuickAdd: () => setIsOpen(true),
      closeQuickAdd: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>;
}

export function useQuickAdd() {
  const context = React.useContext(QuickAddContext);
  if (!context) throw new Error("useQuickAdd harus digunakan di dalam <QuickAddProvider>");
  return context;
}
