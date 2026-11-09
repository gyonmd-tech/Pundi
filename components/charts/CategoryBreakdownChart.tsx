"use client";

/**
 * components/charts/CategoryBreakdownChart.tsx
 * Donut proporsi per kategori (SVG murni) + legenda dengan nominal.
 * Ketuk segmen atau baris legenda untuk menyorot satu kategori.
 */
import { useState } from "react";
import { formatRupiah, formatRupiahShort } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface CategoryDataPoint {
  name: string;
  amount: number;
  color?: string;
}

const CHART_COLORS = [1, 2, 3, 4, 5, 6].map((index) => `var(--chart-category-${index})`);
const SIZE = 168;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 4; // jarak antarsegmen (px di keliling)

export function CategoryBreakdownChart({ data, className }: { data: CategoryDataPoint[]; className?: string }) {
  const [active, setActive] = useState<number | null>(null);

  if (!data?.length) {
    return (
      <div className={cn("flex h-full min-h-40 items-center justify-center", className)}>
        <p className="text-small text-center text-ink-muted">Belum ada data pengeluaran bulan ini</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 6);
  const total = sorted.reduce((sum, item) => sum + item.amount, 0);
  const colorOf = (index: number) => sorted[index].color ?? CHART_COLORS[index % CHART_COLORS.length];
  const lengths = sorted.map((item) => (total > 0 ? (item.amount / total) * CIRCUMFERENCE : 0));
  const segments = lengths.map((length, index) => ({
    index,
    dash: Math.max(length - (sorted.length > 1 ? GAP : 0), 0.5),
    offset: lengths.slice(0, index).reduce((sum, value) => sum + value, 0),
  }));
  const focus = active === null ? null : sorted[active];

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="chart-donut -rotate-90" role="img" aria-label="Proporsi per kategori">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--color-surface-soft)" strokeWidth={STROKE} />
          {segments.map((segment) => (
            <circle
              key={sorted[segment.index].name}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colorOf(segment.index)}
              strokeWidth={active === segment.index ? STROKE + 4 : STROKE}
              strokeDasharray={`${segment.dash} ${CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
              opacity={active === null || active === segment.index ? 1 : 0.32}
              className="cursor-pointer transition-[opacity,stroke-width] duration-200"
              onPointerEnter={() => setActive(segment.index)}
              onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}
              onClick={() => setActive(active === segment.index ? null : segment.index)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p className="truncate text-[11px] font-medium text-ink-muted">{focus ? focus.name : "Total"}</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-ink tabular-nums">{formatRupiahShort(focus ? focus.amount : total)}</p>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {sorted.map((entry, index) => {
          const pct = total > 0 ? (entry.amount / total) * 100 : 0;
          return (
            <li key={entry.name}>
              <button
                type="button"
                className={cn("flex w-full items-center justify-between gap-2 rounded-xs px-2 py-1.5 text-left transition-colors", active === index ? "bg-surface-soft" : "hover:bg-surface-soft/70")}
                onClick={() => setActive(active === index ? null : index)}
                aria-pressed={active === index}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: colorOf(index) }} />
                  <span className="truncate text-small text-ink">{entry.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="text-small text-ink-muted">{pct.toFixed(0)}%</span>
                  <span className="text-small font-semibold text-ink">{formatRupiah(entry.amount)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
