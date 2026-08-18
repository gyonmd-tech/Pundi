"use client";

/**
 * lib/context/SidebarContext.tsx
 * Context untuk mengelola status buka/tutup (collapse) Sidebar di desktop dan tablet.
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Load preferred state from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pundi_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, []);

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
