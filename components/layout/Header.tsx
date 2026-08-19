"use client";

/**
 * components/layout/Header.tsx
 * Topbar profesional & elegan:
 * - Sidebar Toggle Button (PanelLeft)
 * - Interactive Account Switcher Dropdown
 * - Status & Periode Aktif Pill
 * - Quick Search Bar (⌘K)
 * - Notification Popover dengan unread counter
 * - Elevated Quick Add CTA
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  Bell,
  Search,
  ExternalLink,
  CheckCheck,
  PanelLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useAccounts, useInsights, useApp } from "@/lib/data/store";
import { formatRupiah, formatDate } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { useSidebar } from "@/lib/context/SidebarContext";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  onQuickAdd: () => void;
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
}

export function Header({ onQuickAdd, selectedAccountId = "all", onSelectAccount }: HeaderProps) {
  const accounts = useAccounts();
  const insights = useInsights();
  const { dispatch } = useApp();
  const { showToast } = useToast();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadInsights = insights.filter((i) => !i.isRead);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMarkAllRead() {
    dispatch({ type: "MARK_ALL_READ" });
    showToast({
      type: "success",
      title: "Notifikasi Ditandai Dibaca",
      message: "Semua insight kini berstatus telah dibaca.",
    });
  }

  function handleSelectAccount(id: string) {
    if (onSelectAccount) onSelectAccount(id);
    setAccountMenuOpen(false);
    const acc = accounts.find((a) => a.id === id);
    showToast({
      type: "info",
      title: "Filter Akun Aktif",
      message: id === "all" ? "Menampilkan data semua akun." : `Menampilkan akun ${acc?.name}.`,
    });
  }

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between px-3 xs:px-4 lg:px-6 border-b select-none transition-all w-full max-w-full overflow-hidden"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderColor: "var(--color-rule)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* ── Left: Sidebar Toggle, App Status & Account Selector ────── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Sidebar Toggle Button (Desktop & Tablet) */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "hidden md:flex items-center justify-center w-9 h-9 rounded-card border transition-all duration-200",
            "hover:border-pine hover:bg-pine-10 hover:text-pine text-ink-muted active:scale-95 shadow-2xs"
          )}
          style={{
            borderColor: "var(--color-rule)",
            backgroundColor: "var(--color-surface)",
          }}
          title={isCollapsed ? "Buka Sidebar (Expanded)" : "Tutup Sidebar (Collapsed)"}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft size={18} strokeWidth={1.8} />
        </button>

        {/* Account Switcher Dropdown */}
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-card border text-small font-medium",
              "transition-all duration-200 ease-out hover:border-pine hover:bg-pine-10",
              "active:scale-[0.98] shadow-2xs"
            )}
            style={{
              borderColor: accountMenuOpen ? "var(--color-pine)" : "var(--color-rule)",
              backgroundColor: accountMenuOpen ? "var(--color-pine-10)" : "var(--color-surface)",
              fontFamily: "var(--font-ui)",
              color: "var(--color-ink)",
            }}
            aria-expanded={accountMenuOpen}
            aria-label="Pilih Akun"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedAccount?.colorTag || "var(--color-pine)" }}
            />
            <span className="truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[170px] font-semibold text-xs sm:text-small">
              {selectedAccount ? selectedAccount.name : "Semua Akun"}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={cn("transition-transform duration-200 flex-shrink-0", accountMenuOpen && "rotate-180")}
              style={{ color: "var(--color-ink-muted)" }}
            />
          </button>

          {/* Account Dropdown Menu Popover */}
          {accountMenuOpen && (
            <div
              className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border shadow-float p-2 z-50 animate-in fade-in slide-in-from-top-2"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-rule)",
              }}
            >
              <div className="px-2 py-1.5 mb-1 border-b flex items-center justify-between" style={{ borderColor: "var(--color-rule)" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Pilih Sumber Dana
                </span>
                <span className="text-[10px] font-mono text-ink-muted">
                  {accounts.length} Akun
                </span>
              </div>

              {/* Option: Semua Akun */}
              <button
                onClick={() => handleSelectAccount("all")}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-small transition-colors text-left",
                  selectedAccountId === "all" ? "bg-pine-10 text-pine font-semibold" : "hover:bg-paper text-ink"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pine" />
                  <span className="text-xs font-semibold">Semua Akun</span>
                </div>
                <span className="tabular-nums font-mono text-xs text-ink-muted">
                  {formatRupiah(totalBalance)}
                </span>
              </button>

              {/* Per-Account Options */}
              <div className="space-y-0.5 mt-1">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-small transition-colors text-left group",
                        isSelected ? "bg-pine-10 text-pine font-semibold" : "hover:bg-paper text-ink"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: acc.colorTag }} />
                        <span className="truncate text-xs font-medium">{acc.name}</span>
                      </div>
                      <span className="tabular-nums font-mono text-xs flex-shrink-0" style={{ color: isSelected ? "var(--color-pine)" : "var(--color-ink-muted)" }}>
                        {formatRupiah(acc.balance)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Settings Link */}
              <div className="mt-2 pt-1.5 border-t" style={{ borderColor: "var(--color-rule)" }}>
                <Link
                  href="/pengaturan"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-pine hover:bg-pine-10 transition-colors font-semibold"
                >
                  <span>Kelola Rekening & Dompet</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Active Month Status Badge (Desktop Only) */}
        <div
          suppressHydrationWarning
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-card border text-xs font-mono font-medium text-ink-muted"
          style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-paper)" }}
        >
          <Calendar size={13} className="text-pine" />
          <span>{formatDate(new Date(), "month")}</span>
        </div>
      </div>

      {/* ── Right: Search, Notifications, & Quick Add CTA ─────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Shortcut */}
        <Link
          href="/transaksi"
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-card border text-xs text-ink-muted hover:border-pine hover:text-ink hover:bg-paper transition-all shadow-2xs"
          style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
          title="Cari transaksi cepat"
        >
          <Search size={14} strokeWidth={1.8} />
          <span className="font-ui">Cari mutasi...</span>
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{ backgroundColor: "var(--color-paper)", borderColor: "var(--color-rule)" }}
          >
            ⌘K
          </kbd>
        </Link>

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={cn(
              "w-9 h-9 rounded-card border flex items-center justify-center relative transition-all duration-200 shadow-2xs",
              "hover:border-pine hover:bg-pine-10 active:scale-95"
            )}
            style={{
              borderColor: notificationOpen ? "var(--color-pine)" : "var(--color-rule)",
              backgroundColor: notificationOpen ? "var(--color-pine-10)" : "var(--color-surface)",
              color: notificationOpen ? "var(--color-pine)" : "var(--color-ink-muted)",
            }}
            aria-label={`Notifikasi (${unreadInsights.length} belum dibaca)`}
          >
            <Bell size={17} strokeWidth={1.8} />
            {unreadInsights.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-mono font-bold flex items-center justify-center bg-ember animate-pulse shadow-xs"
              >
                {unreadInsights.length}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {notificationOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-card border shadow-float p-3 z-50 animate-in fade-in slide-in-from-top-2"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-rule)",
              }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: "var(--color-rule)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-small font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                    Notifikasi & Insight
                  </span>
                  {unreadInsights.length > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-ember-10 text-ember"
                    >
                      {unreadInsights.length} baru
                    </span>
                  )}
                </div>

                {unreadInsights.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-pine hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck size={13} />
                    Baca semua
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {insights.slice(0, 4).map((ins) => (
                  <div
                    key={ins.id}
                    className={cn(
                      "p-2.5 rounded-sm border transition-all text-left",
                      !ins.isRead ? "bg-pine-10/50 border-pine/30" : "bg-paper/50 border-rule/50"
                    )}
                  >
                    <p className="text-xs text-ink leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
                      {ins.message}
                    </p>
                    <span className="text-[10px] text-ink-muted mt-1 block font-mono">
                      {formatDate(ins.createdAt, "time")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Popover footer link */}
              <div className="pt-2 mt-2 border-t text-center" style={{ borderColor: "var(--color-rule)" }}>
                <Link
                  href="/insight"
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs text-pine font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Lihat Seluruh Riwayat Insight
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Elevated Quick Add CTA Button */}
        <button
          onClick={onQuickAdd}
          className={cn(
            "flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3.5 sm:px-4 py-2 rounded-card text-xs sm:text-small font-semibold shadow-sm",
            "transition-all duration-200 ease-out active:scale-95 group flex-shrink-0",
            "hover:shadow-md hover:brightness-105"
          )}
          style={{
            backgroundColor: "var(--color-pine)",
            color: "white",
            fontFamily: "var(--font-ui)",
          }}
          aria-label="Tambah Transaksi Cepat"
        >
          <Plus size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:rotate-90 flex-shrink-0" />
          <span className="inline">Tambah</span>
          <kbd
            className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono border border-white/20 bg-white/10"
          >
            +
          </kbd>
        </button>
      </div>
    </header>
  );
}
