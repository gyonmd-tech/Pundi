import { ArrowLeftRight, LayoutDashboard, Lightbulb, PieChart, Settings, Target, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem { href: string; label: string; icon: LucideIcon; badge?: number }

export function getNavigation(unread = 0): NavigationItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
    { href: "/anggaran", label: "Anggaran", icon: PieChart },
    { href: "/arus-kas", label: "Arus Kas", icon: TrendingUp },
    { href: "/aset", label: "Aset", icon: Wallet },
    { href: "/tujuan", label: "Tujuan", icon: Target },
    { href: "/insight", label: "Insight", icon: Lightbulb, badge: unread },
    { href: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];
}

export function isRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}
