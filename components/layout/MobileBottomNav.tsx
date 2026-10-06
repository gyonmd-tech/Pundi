"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, ChevronRight, Download, LayoutDashboard, LayoutGrid, LogOut, PieChart, Plus, Share, X } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useApp, useInsights } from "@/lib/data/store";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import { cn } from "@/lib/utils/cn";
import { getNavigation, isRouteActive } from "./navigation";

const primary = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/anggaran", label: "Anggaran", icon: PieChart },
];
const primaryHrefs = new Set(primary.map((item) => item.href));

export function MobileBottomNav({ onQuickAdd }: { onQuickAdd?: () => void }) {
  const pathname = usePathname();
  const insights = useInsights();
  const unread = insights.filter((item) => !item.isRead).length;
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMoreOpen(false);
  }

  const secondary = getNavigation(unread).filter((item) => !primaryHrefs.has(item.href));
  const moreActive = secondary.some((item) => isRouteActive(pathname, item.href));

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(17,39,114,.08)] backdrop-blur-xl md:hidden"
        aria-label="Navigasi mobile"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-1">
          {primary.slice(0, 2).map((item) => (
            <NavButton key={item.href} href={item.href} label={item.label} icon={item.icon} active={isRouteActive(pathname, item.href)} />
          ))}
          <div className="grid place-items-center">
            <button
              type="button"
              onClick={onQuickAdd}
              aria-label="Tambah transaksi"
              className="-mt-7 grid h-14 w-14 place-items-center rounded-[20px] border-4 border-paper bg-brand-600 text-white shadow-[0_10px_24px_rgba(36,89,222,.35)] transition active:scale-95"
            >
              <Plus className="h-6 w-6" strokeWidth={2.4} />
            </button>
          </div>
          <NavButton href={primary[2].href} label={primary[2].label} icon={primary[2].icon} active={isRouteActive(pathname, primary[2].href)} />
          <NavButton
            label="Lainnya"
            icon={LayoutGrid}
            active={moreActive || moreOpen}
            badge={unread}
            onClick={() => setMoreOpen(true)}
            ariaExpanded={moreOpen}
          />
        </div>
      </nav>
      {moreOpen ? <MoreSheet pathname={pathname} items={secondary} onClose={() => setMoreOpen(false)} /> : null}
    </>
  );
}

interface NavButtonProps {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  badge?: number;
  onClick?: () => void;
  ariaExpanded?: boolean;
}

function NavButton({ href, label, icon: Icon, active, badge, onClick, ariaExpanded }: NavButtonProps) {
  const content = (
    <>
      <span className={cn("relative grid h-8 w-12 place-items-center rounded-full transition-colors", active ? "bg-brand-100 text-brand-700" : "text-ink-muted")}>
        <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.8} />
        {badge ? <span className="absolute right-1.5 top-0 h-2 w-2 rounded-full bg-ember ring-2 ring-surface" /> : null}
      </span>
      <span className={cn("text-[11px] leading-none", active ? "font-bold text-ink" : "font-semibold text-ink-muted")}>{label}</span>
    </>
  );
  const className = "flex h-full flex-col items-center justify-center gap-1 active:opacity-70";
  if (href) {
    return <Link href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
  }
  return <button type="button" onClick={onClick} aria-haspopup="dialog" aria-expanded={ariaExpanded} className={className}>{content}</button>;
}

function MoreSheet({ pathname, items, onClose }: { pathname: string; items: ReturnType<typeof getNavigation>; onClose: () => void }) {
  const router = useRouter();
  const { connection } = useApp();
  const install = useInstallPrompt();
  const [showIosHint, setShowIosHint] = React.useState(false);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [onClose]);

  async function handleInstall() {
    if (install.canPrompt) await install.promptInstall();
    else setShowIosHint((value) => !value);
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-[var(--color-scrim)] backdrop-blur-[3px] animate-in fade-in duration-200 md:hidden"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Menu lainnya"
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] border-t border-rule bg-surface-high px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 shadow-float animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-rule-strong" aria-hidden="true" />
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Menu</p>
            <h2 className="text-xl font-extrabold text-ink">Semua fitur Pundi</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup menu" className="grid h-10 w-10 place-items-center rounded-full bg-surface-soft text-ink-muted active:scale-95">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-2.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[20px] border p-2 text-center transition active:scale-[0.97]",
                  active ? "border-brand-600 bg-brand-600 text-white shadow-[0_10px_22px_rgba(36,89,222,.25)]" : "border-rule bg-surface text-ink",
                )}
              >
                <span className={cn("grid h-10 w-10 place-items-center rounded-[14px]", active ? "bg-white/15" : "bg-brand-100 text-brand-700")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                {item.badge ? <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ember-ink px-1 text-[10px] font-bold text-white">{item.badge}</span> : null}
              </Link>
            );
          })}
        </div>

        {install.installable ? (
          <div className="mt-4 overflow-hidden rounded-[22px] bg-brand-900 p-4 text-white">
            <button type="button" onClick={handleInstall} className="flex w-full items-center gap-3 text-left">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-white/15"><Download className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Pasang aplikasi Pundi</span>
                <span className="block text-[11px] text-white/70">Buka langsung dari layar utama, tampil layar penuh.</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-white/70" />
            </button>
            {showIosHint ? (
              <p className="mt-3 flex items-start gap-2 rounded-[14px] bg-white/10 p-3 text-[12px] leading-relaxed text-white/85">
                <Share className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Di Safari, ketuk tombol <b>Bagikan</b> lalu pilih <b>Tambah ke Layar Utama</b>.</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {connection.mode !== "guest" ? (
          <button
            type="button"
            onClick={async () => { await logoutAction(); onClose(); router.replace("/login"); router.refresh(); }}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-rule text-sm font-bold text-ember-ink active:bg-ember-10"
          >
            <LogOut className="h-4 w-4" /> Keluar dari akun
          </button>
        ) : (
          <Link href="/login" onClick={onClose} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-rule text-sm font-bold text-brand-700 active:bg-brand-50">
            Masuk / daftar untuk menyimpan data
          </Link>
        )}
      </section>
    </div>
  );
}
