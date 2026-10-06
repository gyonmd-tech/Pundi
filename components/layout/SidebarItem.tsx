import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { NavigationItem } from "./navigation";

export function SidebarItem({ item, active, collapsed }: { item: NavigationItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-[16px] border transition-[background-color,border-color,color,box-shadow] duration-200",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "border-white bg-white font-semibold text-[var(--color-brand-900)] shadow-[0_10px_22px_rgba(7,28,70,0.24)]"
          : "border-transparent font-medium text-white/70 hover:border-white/10 hover:bg-white/10 hover:font-semibold hover:text-white"
      )}
    >
      <span className="grid h-7 w-7 place-items-center bg-transparent">
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 1.9} />
      </span>
      {!collapsed ? (
        <span className="flex min-w-0 flex-1 items-center justify-between text-sm">
          <span className="truncate">{item.label}</span>
          {item.badge ? <span className="grid min-w-5 place-items-center rounded-full bg-ember-ink px-1.5 py-0.5 font-mono text-[10px] text-white">{item.badge}</span> : null}
        </span>
      ) : item.badge ? (
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ember" />
      ) : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-50 ml-3 translate-x-[-4px] whitespace-nowrap rounded-[10px] bg-brand-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-float transition group-hover:translate-x-0 group-hover:opacity-100">{item.label}</span>
      ) : null}
    </Link>
  );
}
