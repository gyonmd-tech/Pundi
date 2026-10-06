"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useApp, useInsights, usePreferences } from "@/lib/data/store";
import { useSidebar } from "@/lib/context/SidebarContext";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/Button";
import { getAvatarUrl } from "@/lib/appwrite/storage";
import { getNavigation, isRouteActive } from "./navigation";
import { SidebarItem } from "./SidebarItem";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const insights = useInsights();
  const { connection } = useApp();
  const preferences = usePreferences();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigation = getNavigation(insights.filter((item) => !item.isRead).length);
  const displayName = connection.userName ?? (connection.mode === "cloud" ? "Pengguna Pundi" : "Sarah Dewi");
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className={cn(
      "fixed bottom-3 left-3 top-3 z-30 hidden flex-col overflow-hidden rounded-[28px] bg-brand-900 shadow-[0_18px_44px_rgba(17,39,114,.20)] transition-[width] duration-300 md:flex",
      isCollapsed ? "w-[72px]" : "w-[252px]"
    )}>
      <div className={cn("relative flex shrink-0 items-start justify-center overflow-hidden", isCollapsed ? "h-[108px]" : "h-[128px]")}>
        {isCollapsed ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 72 108"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-[108px] w-full text-white"
          >
            <path
              fill="currentColor"
              d="M0 0h72v69c-6 2-7 12-15 14-9 2-12-9-20-8-10 1-11 17-21 17C7 92 8 80 0 81V0Z"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 252 128"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-[128px] w-full text-white"
          >
            <path
              fill="currentColor"
              d="M0 0h252v73c-8 1-14 5-19 12-8 12-17 20-33 19-13-1-20-12-33-10-16 2-20 25-42 29-20 3-29-18-46-20-17-2-25 13-43 9-14-3-16-17-29-20-10-2-18 1-27 6V0Z"
            />
            <path fill="currentColor" d="M187 91c1 8-6 13-6 20a9 9 0 0 0 18 0c0-7-8-12-7-21Z" />
            <path fill="currentColor" d="M45 103c0 5-4 8-4 12a5 5 0 0 0 10 0c0-4-5-7-4-12Z" />
          </svg>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="relative z-10 mt-3 flex min-h-16 w-full items-center justify-center px-3 transition hover:-translate-y-0.5 focus-visible:rounded-[18px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/20"
        >
          {isCollapsed ? (
            <Image src="/PUNDI-brand-assets/pundi-symbol.svg" alt="Pundi" width={48} height={48} priority className="h-12 w-12 object-contain" />
          ) : (
            <Image src="/PUNDI-brand-assets/pundi-logo.svg" alt="Pundi" width={156} height={48} priority className="h-12 w-auto object-contain" />
          )}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4" aria-label="Navigasi utama">
        {!isCollapsed ? <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">Menu utama</p> : null}
        <div className="space-y-1.5">
          {navigation.map((item) => <SidebarItem key={item.href} item={item} active={isRouteActive(pathname, item.href)} collapsed={isCollapsed} />)}
        </div>
      </nav>

      <div className="border-t border-white/10 p-2.5">
        <div className={cn("flex items-center rounded-[18px] border border-white/15 bg-white/10 p-2 shadow-card", isCollapsed ? "justify-center" : "gap-2.5")}>
          <Link href="/pengaturan" className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-xs font-bold text-[var(--color-brand-900)] shadow-card">
            {preferences.avatarFileId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getAvatarUrl(preferences.avatarFileId)} alt="" className="h-full w-full object-cover" />
            ) : initials}
          </Link>
          {!isCollapsed ? (
            <>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{displayName}</p><p className="text-[10px] font-medium text-white/60">{connection.mode === "cloud" ? "Akun cloud" : "Mode demo"}</p></div>
              <IconButton type="button" variant="ghost" size="icon" aria-label="Keluar dari akun" onClick={async () => { await logoutAction(); router.replace("/login"); router.refresh(); }} className="h-9 min-h-9 w-9 text-white/75 hover:bg-white/15 hover:text-white"><LogOut className="h-4 w-4" /></IconButton>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
