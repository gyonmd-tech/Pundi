"use client";

/**
 * components/charts/AccountBalanceChart.tsx
 * Batang saldo per rekening (warna rekening masing-masing). SVG murni.
 */
import { useState } from "react";
import { formatRupiah } from "@/lib/utils/formatter";
import { ChartTooltip, TooltipRow, nearestIndex, niceScale, useElementWidth } from "./chartKit";

interface AccountBalancePoint {
  name: string;
  balance: number;
  color: string;
}

const PAD = { top: 16, right: 8, bottom: 30, left: 48 };
const millions = (value: number) => (value >= 1_000_000 ? `${Math.round(value / 100_000) / 10} jt` : value >= 1_000 ? `${Math.round(value / 1_000)} rb` : `${value}`);

export function AccountBalanceChart({ data }: { data: AccountBalancePoint[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const height = width >= 1024 ? 360 : 340;
  const innerWidth = Math.max(width - PAD.left - PAD.right, 1);
  const innerHeight = height - PAD.top - PAD.bottom;
  const { top, ticks } = niceScale(Math.max(...data.map((point) => Math.max(point.balance, 0)), 0));
  const slot = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.min(52, slot * 0.6);
  const xs = data.map((_, index) => PAD.left + slot * index + slot / 2);
  const y = (value: number) => PAD.top + innerHeight - (Math.max(value, 0) / top) * innerHeight;
  const baseline = y(0);

  return (
    <div ref={ref} className="relative h-[340px] w-full min-w-0 lg:h-[360px]">
      {width > 0 ? (
        <svg width={width} height={height} className="chart-enter block touch-pan-y" role="img" aria-label="Saldo per rekening"
          onPointerMove={(event) => setActive(nearestIndex(event, xs))} onPointerDown={(event) => setActive(nearestIndex(event, xs))} onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null); }}>
          {ticks.map((tick) => (
            <g key={tick}>
              {tick > 0 ? <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-rule)" strokeDasharray="3 6" /> : null}
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="chart-axis">{millions(tick)}</text>
            </g>
          ))}
          {data.map((point, index) => {
            const barTop = y(point.balance);
            return (
              <g key={point.name}>
                <rect className="chart-bar" style={{ animationDelay: `${index * 50}ms` }} x={xs[index] - barWidth / 2} y={barTop} width={barWidth} height={Math.max(baseline - barTop, 0)} rx={Math.min(12, barWidth / 3)} fill={point.color} opacity={active === null || active === index ? 1 : 0.5} />
                <text x={xs[index]} y={height - 10} textAnchor="middle" className="chart-axis">{point.name.split(" ")[0]}</text>
              </g>
            );
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} className="chart-baseline" />
        </svg>
      ) : null}
      {active !== null && data[active] ? (
        <ChartTooltip x={xs[active]} width={width}>
          <TooltipRow color={data[active].color} label={data[active].name} value={formatRupiah(data[active].balance)} />
        </ChartTooltip>
      ) : null}
    </div>
  );
}
