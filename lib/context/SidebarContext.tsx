"use client";

import * as React from "react";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);
const STORAGE_KEY = "pundi_sidebar_collapsed";
const CHANGE_EVENT = "pundi:sidebar-change";

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function updateStoredValue(collapsed: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isCollapsed = React.useSyncExternalStore(subscribe, getSnapshot, () => false);
  const value = React.useMemo<SidebarContextValue>(() => ({
    isCollapsed,
    setIsCollapsed: updateStoredValue,
    toggleSidebar: () => updateStoredValue(!isCollapsed),
  }), [isCollapsed]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar harus digunakan di dalam <SidebarProvider>");
  return context;
}