"use client";

/**
 * components/charts/SpendingMomentumChart.tsx
 * Batang pengeluaran harian + garis akumulasi (skala sendiri) + garis
 * rata-rata harian sebagai titik referensi. SVG murni.
 */
import { useState } from "react";
import { formatRupiah, formatRupiahShort } from "@/lib/utils/formatter";
import { ChartLegend, ChartTooltip, TooltipRow, monotonePath, nearestIndex, niceScale, useElementWidth } from "./chartKit";

interface SpendingPoint {
  label: string;
  amount: number;
}

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 68 };
const BAR = "var(--color-brand-600)";
const LINE = "var(--chart-line-strong)";
const AVERAGE = "var(--chart-expense-color)";

export function SpendingMomentumChart({ data }: { data: SpendingPoint[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const cumulative = data.map((_, index) => data.slice(0, index + 1).reduce((sum, point) => sum + point.amount, 0));
  const total = cumulative.at(-1) ?? 0;
  const average = data.length ? total / data.length : 0;

  const innerWidth = Math.max(width - PAD.left - PAD.right, 1);
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const { top, ticks } = niceScale(Math.max(...data.map((point) => point.amount), average));
  const cumulativeTop = Math.max(total, 1) * 1.08;
  const slot = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.min(34, slot * 0.56);
  const xs = data.map((_, index) => PAD.left + slot * index + slot / 2);
  const y = (value: number) => PAD.top + innerHeight - (value / top) * innerHeight;
  const yCumulative = (value: number) => PAD.top + innerHeight - (value / cumulativeTop) * innerHeight;
  const baseline = y(0);

  return (
    <div className="w-full min-w-0">
      <div ref={ref} className="relative" style={{ height: HEIGHT }} aria-label="Grafik momentum pengeluaran tujuh hari terakhir">
        {width > 0 ? (
          <svg width={width} height={HEIGHT} className="chart-enter block touch-pan-y" role="img" aria-label="Pengeluaran harian dan akumulasinya"
            onPointerMove={(event) => setActive(nearestIndex(event, xs))} onPointerDown={(event) => setActive(nearestIndex(event, xs))} onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}>
            {ticks.map((tick) => (
              <g key={tick}>
                {tick > 0 ? <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-rule)" strokeDasharray="3 6" /> : null}
                <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="chart-axis">{formatRupiahShort(tick)}</text>
              </g>
            ))}
            {data.map((point, index) => {
              const barTop = y(point.amount);
              return (
                <g key={`${point.label}-${index}`}>
                  {active === index ? <rect x={xs[index] - slot / 2 + 2} y={PAD.top} width={slot - 4} height={innerHeight} rx="10" fill="var(--color-brand-50)" /> : null}
                  <rect className="chart-bar" style={{ animationDelay: `${index * 40}ms` }} x={xs[index] - barWidth / 2} y={barTop} width={barWidth} height={Math.max(baseline - barTop, 0)} rx={Math.min(8, barWidth / 3)} fill={BAR} opacity={active === null || active === index ? 1 : 0.55} />
                  <text x={xs[index]} y={HEIGHT - 8} textAnchor="middle" className="chart-axis">{point.label}</text>
                </g>
              );
            })}
            <line x1={PAD.left} x2={width - PAD.right} y1={y(average)} y2={y(average)} stroke={AVERAGE} strokeWidth="1.5" strokeDasharray="4 5" />
            <path d={monotonePath(data.map((_, index) => [xs[index], yCumulative(cumulative[index])]))} className="chart-line" pathLength={1} fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
            {data.map((_, index) => <circle key={index} cx={xs[index]} cy={yCumulative(cumulative[index])} r={active === index ? 5 : 3.5} fill={active === index ? LINE : "var(--color-surface-high)"} stroke={LINE} strokeWidth="2" />)}
            <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} className="chart-baseline" />
          </svg>
        ) : null}
        {active !== null && data[active] ? (
          <ChartTooltip x={xs[active]} width={width}>
            <p className="mb-1 text-[12px] font-semibold text-ink">{data[active].label}</p>
            <TooltipRow color={BAR} label="Harian" value={formatRupiah(data[active].amount)} />
            <TooltipRow color={LINE} label="Akumulasi" value={formatRupiah(cumulative[active])} />
          </ChartTooltip>
        ) : null}
      </div>
      <ChartLegend className="mt-3" items={[{ color: BAR, label: "Harian" }, { color: LINE, label: "Akumulasi" }, { color: AVERAGE, label: `Rata-rata ${formatRupiahShort(average)}`, dashed: true }]} />
    </div>
  );
}
