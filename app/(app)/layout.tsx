"use client";

/**
 * app/(app)/layout.tsx
 * App Layout Shell dengan:
 * - SidebarProvider untuk buka/tutup (collapse) sidebar interaktif
 * - ToastProvider untuk floating notifications
 * - BackgroundPattern material texture & subtle particles
 * - Header & SidebarNav yang tersinkronisasi
 * - Global QuickAddTransaction modal
 */

import React, { useState } from "react";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Header } from "@/components/layout/Header";
import { AppProvider } from "@/lib/data/store";
import { ToastProvider } from "@/lib/context/ToastContext";
import { SidebarProvider, useSidebar } from "@/lib/context/SidebarContext";
import { QuickAddTransaction } from "@/components/transaction/QuickAddTransaction";
import { BackgroundPattern } from "@/components/ui/BackgroundPattern";
import { cn } from "@/lib/utils/cn";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const { isCollapsed } = useSidebar();

  return (
    <div
      className="min-h-screen flex flex-col relative text-ink transition-colors duration-300"
      style={{ backgroundColor: "var(--color-paper)" }}
    >
      {/* Subtle Material & Particle Texture */}
      <BackgroundPattern />

      {/* Collapsible Sidebar Navigation */}
      <SidebarNav onQuickAdd={() => setQuickAddOpen(true)} />

      {/* Main Content Area — Offset Dynamically by Sidebar State */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10",
          isCollapsed ? "md:pl-[72px]" : "md:pl-[240px]"
        )}
      >
        {/* Interactive Topbar Header */}
        <Header
          onQuickAdd={() => setQuickAddOpen(true)}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
        />

        {/* Main Content Container */}
        <main className="flex-1 px-3 xs:px-4 sm:px-6 py-4 lg:p-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0.5rem))] md:pb-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <QuickAddTransaction
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AppProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AppProvider>
      </SidebarProvider>
    </ToastProvider>
  );
}
