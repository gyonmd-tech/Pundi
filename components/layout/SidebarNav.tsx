"use client";

/**
 * components/layout/SidebarNav.tsx
 * Navigasi utama Pundi dengan dukungan Buka/Tutup (Collapsible Sidebar):
 * - Buka (Expanded): 240px dengan logo lengkap, teks menu, live unread badge, dan user profile card.
 * - Tutup (Collapsed): 72px icon-only dengan micro-tooltips melayang dan avatar ringkas.
 * - Tombol toggle: Ikon PanelLeft / Chevron dengan animasi halus.
 * - Mobile: 5-item bottom bar dengan glowing Quick Add FAB.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  Wallet,
  Target,
  Lightbulb,
  Settings,
  Plus,
  MoreHorizontal,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useInsights } from "@/lib/data/store";
import { useSidebar } from "@/lib/context/SidebarContext";

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ElementType;
  badge?: number;
}

interface SidebarNavProps {
  onQuickAdd?: () => void;
}

export function SidebarNav({ onQuickAdd }: SidebarNavProps) {
  const pathname = usePathname();
  const insights = useInsights();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const unreadCount = insights.filter((i) => !i.isRead).length;

  const navItems: NavItem[] = [
    { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { href: "/transaksi",  label: "Transaksi",  icon: ArrowLeftRight },
    { href: "/anggaran",   label: "Anggaran",   icon: PieChart },
    { href: "/arus-kas",   label: "Arus Kas",   icon: TrendingUp },
    { href: "/aset",       label: "Aset",       icon: Wallet },
    { href: "/tujuan",     label: "Tujuan",     icon: Target },
    { href: "/insight",    label: "Insight",    icon: Lightbulb, badge: unreadCount },
    { href: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <>
      {/* ── Desktop & Tablet Collapsible Sidebar ─────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen z-30",
          "border-r bg-surface select-none shadow-sm",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[240px]"
        )}
        style={{
          borderColor: "var(--color-rule)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Brand Logo Header with Toggle Button */}
        <div
          className={cn(
            "flex items-center h-16 border-b flex-shrink-0 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
          style={{ borderColor: "var(--color-rule)" }}
        >
          {/* Logo Mark & Text */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden group"
            title="Pundi Dashboard"
          >
            {/* Logo Mark */}
            <div
              className="w-9 h-9 rounded-card flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
              style={{
                backgroundColor: "var(--color-pine)",
                border: "1.5px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="font-display font-bold text-white text-base leading-none tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                P
              </span>
            </div>

            {/* Logo Text (Hidden if collapsed) */}
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-display font-semibold text-lg leading-tight tracking-tight text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Pundi
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-pine bg-pine-10 border border-pine/20"
                  >
                    Demo
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted leading-tight font-ui">
                  Personal Finance
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Button (Visible when expanded) */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-card text-ink-muted hover:text-ink hover:bg-paper transition-all active:scale-95"
              title="Tutup Sidebar"
              aria-label="Tutup Sidebar"
            >
              <PanelLeftClose size={17} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button floating below header when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-rule">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-card text-ink-muted hover:text-pine hover:bg-pine-10 transition-all active:scale-95"
              title="Buka Sidebar"
              aria-label="Buka Sidebar"
            >
              <PanelLeftOpen size={18} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-4 mb-2 animate-in fade-in duration-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 font-mono">
                Menu Navigasi
              </p>
            </div>
          )}

          <ul className={cn("space-y-1", isCollapsed ? "px-2" : "px-2.5")}>
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-card relative group",
                      "transition-all duration-200 ease-out",
                      isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                      active
                        ? "text-pine bg-pine-10 font-semibold shadow-xs"
                        : "text-ink-muted hover:bg-paper hover:text-ink active:scale-[0.98]"
                    )}
                    style={{
                      color: active ? "var(--color-pine)" : undefined,
                      backgroundColor: active ? "var(--color-pine-10)" : undefined,
                    }}
                  >
                    {/* Active vertical accent bar */}
                    {active && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-pine"
                      />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={active ? 2.2 : 1.7}
                      className={cn(
                        "flex-shrink-0 transition-transform duration-200",
                        active ? "text-pine scale-105" : "text-ink-muted group-hover:text-ink group-hover:scale-110"
                      )}
                    />

                    {/* Full label & Badge (when expanded) */}
                    {!isCollapsed && (
                      <span
                        className="flex-1 flex items-center justify-between text-small whitespace-nowrap overflow-hidden animate-in fade-in duration-200"
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.badge && item.badge > 0 ? (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white bg-ember flex items-center justify-center animate-pulse"
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                    )}

                    {/* Small Dot Badge when Collapsed */}
                    {isCollapsed && item.badge && item.badge > 0 && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-ember animate-pulse" />
                    )}

                    {/* Floating Tooltip when Collapsed */}
                    {isCollapsed && (
                      <div
                        className={cn(
                          "absolute left-full ml-3 px-3 py-1.5 rounded-card text-xs font-semibold whitespace-nowrap z-50 shadow-float",
                          "bg-ink text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                          "transition-all duration-150 transform -translate-x-1 group-hover:translate-x-0"
                        )}
                        style={{ fontFamily: "var(--font-ui)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-ember text-white text-[10px] font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t" style={{ borderColor: "var(--color-rule)" }} />

        {/* Bottom Section: Settings & User Profile */}
        <div className={cn("p-2 space-y-1.5 flex-shrink-0", isCollapsed && "flex flex-col items-center")}>
          {/* Settings Link */}
          {(() => {
            const item = navItems[7];
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-card relative group w-full",
                  "transition-all duration-200",
                  isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                  active
                    ? "text-pine bg-pine-10 font-semibold"
                    : "text-ink-muted hover:bg-paper hover:text-ink active:scale-[0.98]"
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.2 : 1.7} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-small font-medium animate-in fade-in duration-200" style={{ fontFamily: "var(--font-ui)" }}>
                    {item.label}
                  </span>
                )}

                {/* Collapsed Tooltip for Settings */}
                {isCollapsed && (
                  <div
                    className={cn(
                      "absolute left-full ml-3 px-3 py-1.5 rounded-card text-xs font-semibold whitespace-nowrap z-50 shadow-float",
                      "bg-ink text-white opacity-0 pointer-events-none group-hover:opacity-100",
                      "transition-all duration-150 transform -translate-x-1 group-hover:translate-x-0"
                    )}
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Pengaturan
                  </div>
                )}
              </Link>
            );
          })()}

          {/* User Profile Card */}
          {isCollapsed ? (
            /* Collapsed Profile: Avatar only with tooltip */
            <div className="relative group mt-1">
              <Link
                href="/pengaturan"
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-pine text-white font-mono shadow-xs hover:scale-105 transition-transform"
              >
                SD
              </Link>
              <div
                className={cn(
                  "absolute left-full ml-3 bottom-0 p-2.5 rounded-card text-xs whitespace-nowrap z-50 shadow-float",
                  "bg-surface border border-rule text-ink opacity-0 pointer-events-none group-hover:opacity-100",
                  "transition-all duration-150 transform -translate-x-1 group-hover:translate-x-0"
                )}
              >
                <p className="font-semibold">Sarah Dewi</p>
                <p className="text-[10px] text-ink-muted">Personal Plan · Online</p>
              </div>
            </div>
          ) : (
            /* Expanded Profile Card */
            <div
              className="flex items-center justify-between p-2.5 rounded-card border transition-colors hover:border-pine/30 animate-in fade-in duration-200"
              style={{
                backgroundColor: "var(--color-paper)",
                borderColor: "var(--color-rule)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-pine text-white flex-shrink-0 font-mono shadow-xs"
                >
                  SD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                    Sarah Dewi
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-ink-muted leading-none">Online Demo</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="p-1.5 rounded text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                title="Keluar / Ganti Akun"
              >
                <LogOut size={14} />
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar ───────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t shadow-float pb-safe"
        style={{
          borderColor: "var(--color-rule)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ul className="flex items-center justify-around h-16 px-1 xs:px-2">
          {/* Dashboard */}
          <li className="flex-1 text-center">
            <Link
              href="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 xs:gap-1 py-1.5 rounded-card transition-all active:scale-95 mx-auto",
                isActive("/dashboard") ? "text-pine font-semibold" : "text-ink-muted hover:text-ink"
              )}
            >
              <LayoutDashboard size={18} strokeWidth={isActive("/dashboard") ? 2.2 : 1.7} />
              <span className="text-[10px] xs:text-[11px] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>Dashboard</span>
            </Link>
          </li>

          {/* Transaksi */}
          <li className="flex-1 text-center">
            <Link
              href="/transaksi"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 xs:gap-1 py-1.5 rounded-card transition-all active:scale-95 mx-auto",
                isActive("/transaksi") ? "text-pine font-semibold" : "text-ink-muted hover:text-ink"
              )}
            >
              <ArrowLeftRight size={18} strokeWidth={isActive("/transaksi") ? 2.2 : 1.7} />
              <span className="text-[10px] xs:text-[11px] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>Transaksi</span>
            </Link>
          </li>

          {/* Elevated FAB: Quick Add Button */}
          <li className="-mt-5 flex-shrink-0 px-1">
            <button
              onClick={onQuickAdd}
              className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 active:scale-90 hover:scale-105"
              style={{
                backgroundColor: "var(--color-pine)",
                boxShadow: "0 8px 20px -4px rgba(27, 75, 63, 0.45)",
                border: "2px solid var(--color-surface)",
              }}
              aria-label="Tambah transaksi cepat"
            >
              <Plus size={22} color="white" strokeWidth={2.5} />
            </button>
          </li>

          {/* Anggaran */}
          <li className="flex-1 text-center">
            <Link
              href="/anggaran"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 xs:gap-1 py-1.5 rounded-card transition-all active:scale-95 mx-auto",
                isActive("/anggaran") ? "text-pine font-semibold" : "text-ink-muted hover:text-ink"
              )}
            >
              <PieChart size={18} strokeWidth={isActive("/anggaran") ? 2.2 : 1.7} />
              <span className="text-[10px] xs:text-[11px] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>Anggaran</span>
            </Link>
          </li>

          {/* Lainnya */}
          <li className="flex-1 text-center">
            <Link
              href="/insight"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 xs:gap-1 py-1.5 rounded-card transition-all active:scale-95 relative mx-auto",
                (isActive("/insight") || isActive("/aset") || isActive("/tujuan") || isActive("/pengaturan"))
                  ? "text-pine font-semibold"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <div className="relative">
                <MoreHorizontal size={18} strokeWidth={1.7} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-ember animate-pulse" />
                )}
              </div>
              <span className="text-[10px] xs:text-[11px] leading-tight" style={{ fontFamily: "var(--font-ui)" }}>Lainnya</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
