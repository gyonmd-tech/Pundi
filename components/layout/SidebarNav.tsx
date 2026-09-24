"use client";

import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface SidebarNavProps {
  onQuickAdd?: () => void;
}

export function SidebarNav({ onQuickAdd }: SidebarNavProps) {
  return (
    <>
      <AppSidebar />
      <MobileBottomNav onQuickAdd={onQuickAdd} />
    </>
  );
}