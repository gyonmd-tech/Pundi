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
      className="hidden min-h-10 items-center gap-2.5 rounded-[15px] border border-sky/15 bg-[linear-gradient(135deg,#F7FAFF,#EAF3FF)] px-3.5 text-xs font-semibold text-ink shadow-2xs sm:flex"
      title="Tanggal hari ini"
    >
      <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-white text-sky shadow-sm">
        <CalendarDays className="h-3.5 w-3.5" />
      </span>
      <span suppressHydrationWarning className="capitalize">{fullDate}</span>
    </div>
  );
}
