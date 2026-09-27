"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, HandCoins, LayoutDashboard, PieChart, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [{ href: "/dashboard", label: "Beranda", icon: LayoutDashboard }, { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight }, { href: "/anggaran", label: "Anggaran", icon: PieChart }, { href: "/utang", label: "Utang", icon: HandCoins }];

export function MobileBottomNav({ onQuickAdd }: { onQuickAdd?: () => void }) {
  const pathname = usePathname();
  return <nav className="fixed inset-x-2 bottom-2 z-40 rounded-[22px] border border-brand-200 bg-[#F9FBFF]/96 pb-[env(safe-area-inset-bottom)] shadow-float backdrop-blur-lg md:hidden" aria-label="Navigasi mobile"><div className="grid h-16 grid-cols-5 items-center px-2">{items.slice(0, 2).map((item) => <MobileItem key={item.href} item={item} active={pathname.startsWith(item.href)} />)}<button type="button" onClick={onQuickAdd} aria-label="Tambah transaksi" className="mx-auto -mt-6 grid h-13 w-13 place-items-center rounded-full border-2 border-brand-100 bg-brand-600 text-white shadow-[0_8px_20px_rgba(36,89,222,.28)] transition active:translate-y-px"><Plus className="h-5 w-5" /></button>{items.slice(2).map((item) => <MobileItem key={item.href} item={item} active={pathname.startsWith(item.href)} />)}</div></nav>;
}

function MobileItem({ item, active }: { item: (typeof items)[number]; active: boolean }) { const Icon = item.icon; return <Link href={item.href} className={cn("flex h-14 flex-col items-center justify-center gap-1 rounded-[12px] text-[10px] font-bold transition", active ? "text-pine" : "text-ink-muted")}><Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.3 : 1.8} />{item.label}</Link>; }
