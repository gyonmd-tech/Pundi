import { CalendarDays } from "lucide-react";

const fullDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

export function HeaderDateBadge() {
  return (
    <div
      className="hidden min-h-10 shrink-0 items-center gap-2 rounded-[15px] border border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-900 shadow-card sm:flex"
      title="Tanggal hari ini"
    >
      <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-brand-100 text-brand-600">
        <CalendarDays className="h-3.5 w-3.5" />
      </span>
      <span suppressHydrationWarning className="whitespace-nowrap capitalize">{fullDate}</span>
    </div>
  );
}
