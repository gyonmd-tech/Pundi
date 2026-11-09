"use client";

/**
 * components/charts/CashFlowChart.tsx
 * Area chart arus kas (pemasukan vs pengeluaran) per bulan, SVG murni.
 * Ledger baseline: garis dasar tegas di nilai nol, membentang penuh lebar.
 */
import { useState } from "react";
import { formatRupiah, formatRupiahShort } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";
import { ChartLegend, ChartTooltip, TooltipRow, monotonePath, nearestIndex, niceScale, useElementWidth } from "./chartKit";

interface CashFlowDataPoint {
  month: string;
  income: number;
  expense: number;
}

const HEIGHT = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 72 };
const INCOME = "var(--chart-income-color)";
const EXPENSE = "var(--chart-expense-color)";

export function CashFlowChart({ data, className }: { data: CashFlowDataPoint[]; className?: string }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  if (!data?.length) {
    return (
      <div className={cn("flex h-48 flex-col items-center justify-center gap-3 rounded-card border border-rule bg-paper px-6", className)}>
        <span className="h-px w-full bg-rule-strong" />
        <p className="text-small text-center text-ink-muted">Tambahkan transaksi untuk melihat tren arus kasmu</p>
      </div>
    );
  }

  const innerWidth = Math.max(width - PAD.left - PAD.right, 1);
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const { top, ticks } = niceScale(Math.max(...data.flatMap((point) => [point.income, point.expense])));
  const xs = data.map((_, index) => PAD.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth));
  const y = (value: number) => PAD.top + innerHeight - (value / top) * innerHeight;
  const baseline = y(0);
  const line = (key: "income" | "expense") => monotonePath(data.map((point, index) => [xs[index], y(point[key])]));
  const area = (key: "income" | "expense") => `${line(key)}L${xs.at(-1)},${baseline}L${xs[0]},${baseline}Z`;
  const point = active === null ? null : data[active];

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div ref={ref} className="relative" style={{ height: HEIGHT }}>
        {width > 0 ? (
          <svg width={width} height={HEIGHT} className="chart-enter block touch-pan-y" role="img" aria-label="Grafik arus kas pemasukan dan pengeluaran per bulan"
            onPointerMove={(event) => setActive(nearestIndex(event, xs))} onPointerDown={(event) => setActive(nearestIndex(event, xs))} onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}>
            <defs>
              <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={INCOME} stopOpacity="0.22" /><stop offset="100%" stopColor={INCOME} stopOpacity="0" /></linearGradient>
              <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={EXPENSE} stopOpacity="0.18" /><stop offset="100%" stopColor={EXPENSE} stopOpacity="0" /></linearGradient>
            </defs>
            {ticks.map((tick) => (
              <g key={tick}>
                {tick > 0 ? <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-rule)" strokeDasharray="3 6" /> : null}
                <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="chart-axis">{formatRupiahShort(tick)}</text>
              </g>
            ))}
            {data.map((item, index) => <text key={item.month} x={xs[index]} y={HEIGHT - 8} textAnchor="middle" className="chart-axis">{item.month}</text>)}
            <path d={area("income")} fill="url(#cf-income)" />
            <path d={area("expense")} fill="url(#cf-expense)" />
            <path d={line("income")} className="chart-line" fill="none" stroke={INCOME} strokeWidth="2.5" strokeLinecap="round" />
            <path d={line("expense")} className="chart-line" fill="none" stroke={EXPENSE} strokeWidth="2.5" strokeLinecap="round" />
            <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} className="chart-baseline" strokeLinecap="square" />
            {active !== null ? (
              <g>
                <line x1={xs[active]} x2={xs[active]} y1={PAD.top} y2={baseline} stroke="var(--color-rule-strong)" />
                <circle cx={xs[active]} cy={y(data[active].income)} r="5" fill={INCOME} stroke="var(--color-surface-high)" strokeWidth="2" />
                <circle cx={xs[active]} cy={y(data[active].expense)} r="5" fill={EXPENSE} stroke="var(--color-surface-high)" strokeWidth="2" />
              </g>
            ) : null}
          </svg>
        ) : null}
        {point && active !== null ? (
          <ChartTooltip x={xs[active]} width={width}>
            <p className="mb-1 text-[12px] font-semibold text-ink">{point.month}</p>
            <TooltipRow color={INCOME} label="Pemasukan" value={formatRupiah(point.income)} />
            <TooltipRow color={EXPENSE} label="Pengeluaran" value={formatRupiah(point.expense)} />
          </ChartTooltip>
        ) : null}
      </div>
      <ChartLegend className="mt-3" items={[{ color: INCOME, label: "Pemasukan" }, { color: EXPENSE, label: "Pengeluaran" }]} />
    </div>
  );
}
