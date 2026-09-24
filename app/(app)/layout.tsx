"use client";

import React, { useState } from "react";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { AppProvider } from "@/lib/data/store";
import { ToastProvider } from "@/lib/context/ToastContext";
import { SidebarProvider, useSidebar } from "@/lib/context/SidebarContext";
import { QuickAddProvider, useQuickAdd } from "@/lib/context/QuickAddContext";
import { BackgroundPattern } from "@/components/ui/BackgroundPattern";
import { cn } from "@/lib/utils/cn";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const { isCollapsed } = useSidebar();
  const { isOpen: quickAddOpen, openQuickAdd, closeQuickAdd } = useQuickAdd();

  return (
    <div className="app-modern relative flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-paper text-ink">
      <BackgroundPattern />
      <SidebarNav onQuickAdd={openQuickAdd} />

      <div className={cn("relative z-10 flex min-w-0 flex-1 flex-col transition-all duration-300", isCollapsed ? "md:pl-[92px]" : "md:pl-[268px]")}>
        <Header
          onQuickAdd={openQuickAdd}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
        />

        <div className="flex min-w-0 flex-1">
          <main className="min-w-0 flex-1 overflow-x-clip px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0.5rem))] sm:px-6 md:pb-8 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-[90rem] animate-in fade-in duration-300">{children}</div>
          </main>
          <RightSidebar
            quickAddOpen={quickAddOpen}
            onQuickAddClose={closeQuickAdd}
          />
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AppProvider>
          <QuickAddProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
          </QuickAddProvider>
        </AppProvider>
      </SidebarProvider>
    </ToastProvider>
  );
}