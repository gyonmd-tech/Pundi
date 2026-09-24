"use client";

import * as React from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const weekdays = ["S", "S", "R", "K", "J", "S", "M"];

function parseValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function toValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function DatePicker({ value, onValueChange, className, min, max, ariaLabel = "Pilih tanggal" }: { value: string; onValueChange: (value: string) => void; className?: string; min?: string; max?: string; ariaLabel?: string }) {
  const selected = value ? parseValue(value) : null;
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date());
  const rootRef = React.useRef<HTMLDivElement>(null);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))] as Array<Date | null>;

  React.useEffect(() => {
    function outside(event: MouseEvent) { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); }
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", keydown); };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button type="button" aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen((state) => !state)} className="flex h-11 w-full items-center gap-3 rounded-[14px] border border-pine/12 bg-[linear-gradient(145deg,#FFFFFF,#FAF9FF)] px-3.5 text-left text-sm font-semibold text-ink shadow-2xs transition hover:border-pine/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pine/10">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-sky-10 text-sky"><CalendarDays className="h-3.5 w-3.5" /></span>
        <span className={cn("flex-1", !selected && "text-ink-muted")}>{selected ? dateFormatter.format(selected) : "Pilih tanggal"}</span>
        <ChevronRight className={cn("h-4 w-4 text-ink-muted transition", open && "rotate-90 text-pine")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[75] mt-2 w-[min(310px,calc(100vw-2rem))] rounded-[18px] border border-pine/12 bg-white p-3 shadow-float animate-in fade-in slide-in-from-top-1">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-muted hover:bg-pine-10 hover:text-pine"><ChevronLeft className="h-4 w-4" /></button>
            <p className="text-sm font-extrabold capitalize text-ink">{monthFormatter.format(month)}</p>
            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-muted hover:bg-pine-10 hover:text-pine"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day, index) => <span key={`${day}-${index}`} className="py-1 text-center text-[10px] font-extrabold text-ink-muted">{day}</span>)}
            {days.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} />;
              const dayValue = toValue(day);
              const disabled = Boolean((min && dayValue < min) || (max && dayValue > max));
              const active = dayValue === value;
              return <button key={dayValue} type="button" disabled={disabled} onClick={() => { onValueChange(dayValue); setOpen(false); }} className={cn("grid aspect-square place-items-center rounded-[10px] text-xs font-semibold transition", active ? "bg-pine text-white shadow-sm" : "text-ink hover:bg-paper", disabled && "pointer-events-none opacity-30")}>{active ? <Check className="h-3.5 w-3.5" /> : day.getDate()}</button>;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
