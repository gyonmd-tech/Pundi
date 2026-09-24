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
        "group relative flex min-h-11 items-center gap-3 rounded-[15px] border transition-all duration-200",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "border-pine bg-pine font-extrabold text-white shadow-[0_8px_22px_rgba(91,74,239,0.24)]"
          : "border-transparent font-semibold text-ink-muted hover:border-pine/15 hover:bg-pine-10 hover:font-extrabold hover:text-pine"
      )}
    >
      <span className={cn("grid h-7 w-7 place-items-center rounded-[10px] transition", active ? "bg-white/15" : "bg-transparent group-hover:bg-white/75")}>
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 1.9} />
      </span>
      {!collapsed ? (
        <span className="flex min-w-0 flex-1 items-center justify-between text-sm">
          <span className="truncate">{item.label}</span>
          {item.badge ? <span className={cn("grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 font-mono text-[10px]", active ? "bg-white text-pine" : "bg-ember text-white")}>{item.badge}</span> : null}
        </span>
      ) : item.badge ? (
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ember" />
      ) : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-50 ml-3 translate-x-[-4px] whitespace-nowrap rounded-[10px] bg-ink px-2.5 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-float transition group-hover:translate-x-0 group-hover:opacity-100">{item.label}</span>
      ) : null}
    </Link>
  );
}