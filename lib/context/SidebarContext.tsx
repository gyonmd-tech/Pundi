"use client";

/**
 * lib/context/SidebarContext.tsx
 * Context untuk mengelola status buka/tutup (collapse) Sidebar di desktop dan tablet.
 */

import React, { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Gunakan lazy initializer untuk baca localStorage hanya sekali saat mount,
  // tanpa perlu useEffect — menghindari cascading render (react-hooks/set-state-in-effect).
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("pundi_sidebar_collapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pundi_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar harus digunakan di dalam <SidebarProvider>");
  }
  return ctx;
}
