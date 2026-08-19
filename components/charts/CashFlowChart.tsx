"use client";

/**
 * components/charts/CashFlowChart.tsx
 * Area chart arus kas (income vs expense) 6 bulan terakhir.
 *
 * Signature element: LEDGER BASELINE — garis dasar tegas (1.5px, warna rule)
 * yang membentang penuh lebar chart, meniru garis dasar buku kas.
 * (DESIGN.md § 4.6 — elemen non-negotiable identitas visual Pundi)
 *
 * Stack: Recharts AreaChart + custom SVG untuk baseline
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatRupiahShort, formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface CashFlowDataPoint {
  month:   string;  // "Jan", "Feb", ...
  income:  number;
  expense: number;
}

interface CashFlowChartProps {
  data:      CashFlowDataPoint[];
  className?: string;
  loading?:  boolean;
}

// Custom Tooltip
interface TooltipEntry {
  dataKey: string;
  color:   string;
  value:   number;
}

interface TooltipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
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
        fontFamily: "var(--font-ui)",
      }}
    >
      <p
        className="text-small font-medium mb-1.5"
        style={{ color: "var(--color-ink-muted)" }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className="text-small"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {entry.dataKey === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          </div>
          <span
            className="tabular-nums text-small font-medium"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
          >
            {formatRupiah(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Skeleton loading
function ChartSkeleton() {
  return (
    <div className="w-full h-48 flex items-end gap-3 px-4 pb-4 animate-pulse">
      {["80%", "55%", "70%", "90%", "45%", "65%"].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: h, backgroundColor: "var(--color-rule)", opacity: 0.3 }} />
      ))}
    </div>
  );
}

export function CashFlowChart({ data, className, loading = false }: CashFlowChartProps) {
  if (loading) {
    return (
      <div className={className}>
        <ChartSkeleton />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-48 rounded-card border ${className}`}
        style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-paper)" }}
      >
        {/* Empty state with baseline — sesuai DESIGN.md § 4.6 */}
        <svg width="100%" height="2" style={{ marginBottom: "12px" }}>
          <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--color-rule)" strokeWidth="1.5" />
        </svg>
        <p
          className="text-small text-center"
          style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}
        >
          Tambahkan transaksi untuk melihat tren arus kasmu
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0 overflow-hidden", className)}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            {/* Income gradient */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1B4B3F" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1B4B3F" stopOpacity={0.01} />
            </linearGradient>
            {/* Expense gradient */}
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#9C4A2E" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#9C4A2E" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          {/* Grid — sangat subtle */}
          <CartesianGrid
            strokeDasharray="3 0"
            horizontal={true}
            vertical={false}
            stroke="var(--color-rule)"
            strokeOpacity={0.5}
          />

          {/* LEDGER BASELINE — signature element, wajib ada */}
          <ReferenceLine
            y={0}
            stroke="var(--color-rule)"
            strokeWidth={1.5}
            strokeLinecap="square"
          />

          <XAxis
            dataKey="month"
            tick={{
              fill: "var(--color-ink-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            tickFormatter={formatRupiahShort}
            tick={{
              fill: "var(--color-ink-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
            width={72}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-rule)", strokeWidth: 1 }} />

          {/* Income area */}
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--color-pine)"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-pine)", strokeWidth: 0 }}
          />

          {/* Expense area */}
          <Area
            type="monotone"
            dataKey="expense"
            stroke="var(--color-ember)"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-ember)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend — inline, bukan terpisah */}
      <div className="flex items-center gap-4 mt-3 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: "var(--color-pine)" }} />
          <span className="text-small" style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}>Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: "var(--color-ember)" }} />
          <span className="text-small" style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}>Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}
