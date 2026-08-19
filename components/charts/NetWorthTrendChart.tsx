"use client";

/**
 * components/charts/NetWorthTrendChart.tsx
 * Line chart tren net worth (total aset − total utang) per bulan.
 * Ledger Baseline wajib ada.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { formatRupiahShort, formatRupiah } from "@/lib/utils/formatter";

interface NetWorthDataPoint {
  month:    string;
  netWorth: number;
}

interface NetWorthTrendChartProps {
  data:       NetWorthDataPoint[];
  className?: string;
  loading?:   boolean;
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-card px-3 py-2.5 shadow-float"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "var(--border-hairline)",
      }}
    >
      <p className="text-small mb-1" style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}>{label}</p>
      <p className="tabular-nums text-small font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--color-pine)" }}>
        {formatRupiah(payload[0].value)}
      </p>
    </div>
  );
}

export function NetWorthTrendChart({ data, className, loading = false }: NetWorthTrendChartProps) {
  if (loading) {
    return (
      <div className={`w-full h-40 animate-pulse rounded-card ${className}`}
        style={{ backgroundColor: "var(--color-rule)", opacity: 0.15 }}
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160} className={className}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 0"
          horizontal={true}
          vertical={false}
          stroke="var(--color-rule)"
          strokeOpacity={0.5}
        />

        {/* LEDGER BASELINE — signature */}
        <ReferenceLine
          y={0}
          stroke="var(--color-rule)"
          strokeWidth={1.5}
          strokeLinecap="square"
        />

        <XAxis
          dataKey="month"
          tick={{ fill: "var(--color-ink-muted)", fontFamily: "var(--font-ui)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />

        <YAxis
          tickFormatter={formatRupiahShort}
          tick={{ fill: "var(--color-ink-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={72}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-rule)", strokeWidth: 1 }} />

        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="var(--color-pine)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-pine)", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
