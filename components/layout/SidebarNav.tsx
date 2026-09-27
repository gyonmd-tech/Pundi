"use client";

import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface SidebarNavProps {
  onQuickAdd?: () => void;
  hideMobileNav?: boolean;
}

export function SidebarNav({ onQuickAdd, hideMobileNav }: SidebarNavProps) {
  return (
    <>
      <AppSidebar />
      {!hideMobileNav ? <MobileBottomNav onQuickAdd={onQuickAdd} /> : null}
    </>
  );
}
