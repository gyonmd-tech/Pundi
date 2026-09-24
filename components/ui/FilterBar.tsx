import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";

export function FilterBar({ children, activeCount = 0, onReset, className }: { children: React.ReactNode; activeCount?: number; onReset?: () => void; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-[18px] border border-rule bg-white p-3 shadow-2xs sm:flex-row sm:items-center", className)}>
      <div className="flex items-center gap-2 text-xs font-extrabold text-ink">
        <SlidersHorizontal className="h-4 w-4 text-pine" />
        Filter
        {activeCount > 0 ? <Badge tone="primary">{activeCount} aktif</Badge> : null}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {onReset && activeCount > 0 ? <Button type="button" variant="ghost" size="sm" onClick={onReset}><X className="h-3.5 w-3.5" />Reset</Button> : null}
    </div>
  );
}
