"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Transaction } from "@/lib/data/mock";
import { formatRupiah } from "@/lib/utils/formatter";

const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function daysForMonth(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))] as Array<Date | null>;
}

export function DashboardCalendar({ transactions }: { transactions: Transaction[] }) {
  const today = React.useMemo(() => new Date(), []);
  const [month, setMonth] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = React.useState(today);
  const days = daysForMonth(month);
  const grouped = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach((transaction) => {
      const key = dateKey(new Date(transaction.date));
      map.set(key, [...(map.get(key) ?? []), transaction]);
    });
    return map;
  }, [transactions]);
  const selectedTransactions = grouped.get(dateKey(selected)) ?? [];
  const selectedExpense = selectedTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  return (
    <article className="card h-full overflow-hidden border-pine/15 bg-[linear-gradient(160deg,#FFFFFF,#F8F6FF)] p-0">
      <div className="flex items-center justify-between border-b border-rule bg-[linear-gradient(135deg,#F5F2FF,#EEF8FF)] px-5 py-4">
        <div><p className="eyebrow">Kalender finansial</p><h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-ink capitalize">{monthFormatter.format(month)}</h2></div>
        <div className="flex gap-1.5">
          <button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-[12px] border border-white bg-white/80 text-ink-muted shadow-sm transition hover:text-pine"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-[12px] border border-white bg-white/80 text-ink-muted shadow-sm transition hover:text-pine"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-1.5">
          {weekdays.map((day) => <span key={day} className="py-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">{day}</span>)}
          {days.map((day, index) => {
            if (!day) return <span key={`blank-${index}`} />;
            const items = grouped.get(dateKey(day)) ?? [];
            const active = dateKey(day) === dateKey(selected);
            const isToday = dateKey(day) === dateKey(today);
            return (
              <button key={dateKey(day)} type="button" onClick={() => setSelected(day)} className={`relative h-10 rounded-[12px] sm:h-11 text-xs font-bold transition ${active ? "bg-pine text-white shadow-[0_7px_16px_rgba(91,74,239,.25)]" : isToday ? "bg-mint-10 text-mint" : "text-ink hover:bg-paper"}`}>
                {day.getDate()}
                {items.length ? <span className={`absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${active ? "bg-white" : items.some((item) => item.type === "expense") ? "bg-ember" : "bg-mint"}`} /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[15px] bg-paper px-4 py-3">
          <div><p className="text-[11px] font-semibold text-ink-muted">Aktivitas tanggal {selected.getDate()}</p><p className="mt-0.5 text-sm font-extrabold text-ink">{selectedTransactions.length} transaksi</p></div>
          <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-wide text-ember">Pengeluaran</p><p className="mt-0.5 text-sm font-bold tabular-nums text-ink">{formatRupiah(selectedExpense)}</p></div>
        </div>
      </div>
    </article>
  );
}
