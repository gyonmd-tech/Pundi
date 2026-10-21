"use client";

import * as React from "react";

export interface QuickAddOptions {
  /** Nominal awal (mis. hasil kalkulator uang). */
  amount?: number;
}

interface QuickAddContextValue {
  isOpen: boolean;
  initialAmount?: number;
  /** Aman dipakai langsung sebagai onClick: argumen selain QuickAddOptions diabaikan. */
  openQuickAdd: (options?: QuickAddOptions | unknown) => void;
  closeQuickAdd: () => void;
}

const QuickAddContext = React.createContext<QuickAddContextValue | null>(null);

function readAmount(options: unknown) {
  if (!options || typeof options !== "object" || !("amount" in options)) return undefined;
  const amount = (options as QuickAddOptions).amount;
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? Math.round(amount) : undefined;
}

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ isOpen: boolean; initialAmount?: number }>({ isOpen: false });
  const value = React.useMemo<QuickAddContextValue>(
    () => ({
      isOpen: state.isOpen,
      initialAmount: state.initialAmount,
      openQuickAdd: (options?: unknown) => setState({ isOpen: true, initialAmount: readAmount(options) }),
      closeQuickAdd: () => setState({ isOpen: false }),
    }),
    [state]
  );

  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>;
}

export function useQuickAdd() {
  const context = React.useContext(QuickAddContext);
  if (!context) throw new Error("useQuickAdd harus digunakan di dalam <QuickAddProvider>");
  return context;
}
