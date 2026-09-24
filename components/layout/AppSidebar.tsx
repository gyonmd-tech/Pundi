"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useApp, useInsights } from "@/lib/data/store";
import { useSidebar } from "@/lib/context/SidebarContext";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/Button";
import { getNavigation, isRouteActive } from "./navigation";
import { SidebarItem } from "./SidebarItem";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const insights = useInsights();
  const { connection } = useApp();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigation = getNavigation(insights.filter((item) => !item.isRead).length);
  const displayName = connection.userName ?? (connection.mode === "cloud" ? "Pengguna Pundi" : "Sarah Dewi");
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className={cn(
      "fixed bottom-3 left-3 top-3 z-30 hidden flex-col rounded-[26px] border border-pine/10 bg-white/92 shadow-card backdrop-blur-xl transition-[width] duration-300 md:flex",
      isCollapsed ? "w-[68px]" : "w-[248px]"
    )}>
      <div className="flex h-[78px] shrink-0 items-center justify-center border-b border-rule/80 px-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="flex min-h-12 w-full items-center justify-center rounded-[18px] transition hover:bg-pine-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/25"
        >
          {isCollapsed ? (
            <Image src="/PUNDI-brand-assets/pundi-symbol.svg" alt="Pundi" width={46} height={46} priority className="h-11 w-11 object-contain transition-transform hover:scale-105" />
          ) : (
            <Image src="/PUNDI-brand-assets/pundi-logo.svg" alt="Pundi" width={148} height={45} priority className="h-11 w-auto object-contain transition-transform hover:scale-[1.03]" />
          )}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4" aria-label="Navigasi utama">
        {!isCollapsed ? <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">Menu utama</p> : null}
        <div className="space-y-1.5">
          {navigation.map((item) => <SidebarItem key={item.href} item={item} active={isRouteActive(pathname, item.href)} collapsed={isCollapsed} />)}
        </div>
      </nav>

      <div className="border-t border-rule/80 p-2.5">
        <div className={cn("flex items-center rounded-[17px] border border-pine/10 bg-pine-10/55 p-2", isCollapsed ? "justify-center" : "gap-2.5")}>
          <Link href="/pengaturan" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#5B4AEF,#3E86ED)] text-xs font-black text-white shadow-sm">{initials}</Link>
          {!isCollapsed ? (
            <>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-ink">{displayName}</p><p className="text-[10px] font-medium text-ink-muted">{connection.mode === "cloud" ? "Akun cloud" : "Mode demo"}</p></div>
              <IconButton type="button" variant="ghost" size="icon" aria-label="Keluar dari akun" onClick={async () => { await logoutAction(); router.replace("/login"); router.refresh(); }} className="h-9 min-h-9 w-9 hover:bg-ember-10 hover:text-ember"><LogOut className="h-4 w-4" /></IconButton>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}