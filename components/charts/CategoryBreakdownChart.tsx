"use client";

/**
 * components/charts/CategoryBreakdownChart.tsx
 * Donut chart proporsi pengeluaran per kategori.
 *
 * Aturan DESIGN.md § 4.6:
 * - Label langsung di sebelah legenda dengan angka nominal (mono)
 * - Maksimal 5–6 tint dari pine/ink-muted/brass (bukan warna-warni acak)
 * - Wajib ada angka nominal, bukan hanya persentase
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils/formatter";
import { cn } from "@/lib/utils/cn";

interface CategoryDataPoint {
  name:   string;
  amount: number;
  color?: string;
}

// Palet terbatas dari token DESIGN.md — maksimal 6 warna
const CHART_COLORS = [
  "var(--color-pine)",       // pine utama
  "var(--color-pine-40)",    // pine sedang
  "var(--color-ink-muted)",  // abu
  "var(--color-brass)",      // brass
  "var(--color-pine-20)",    // pine terang
  "var(--color-ember-20)",   // ember terang
];

interface CategoryBreakdownChartProps {
  data:       CategoryDataPoint[];
  className?: string;
  loading?:   boolean;
}

interface TooltipEntry {
  name:  string;
  value: number;
}

interface TooltipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="rounded-card px-3 py-2 shadow-float"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "var(--border-hairline)",
        fontFamily: "var(--font-ui)",
      }}
    >
      <p className="text-small font-medium mb-1" style={{ color: "var(--color-ink)" }}>{d.name}</p>
      <p className="tabular-nums text-small" style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-muted)" }}>
        {formatRupiah(d.value)}
      </p>
    </div>
  );
}

export function CategoryBreakdownChart({ data, className, loading = false }: CategoryBreakdownChartProps) {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-28 h-28 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--color-rule)", opacity: 0.3 }} />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-rule)", opacity: 0.4 }} />
              <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: "var(--color-rule)", opacity: 0.3 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-small text-center" style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}>
          Belum ada data pengeluaran bulan ini
        </p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  // Sort by amount descending, show top 6
  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 6);

  return (
    <div className={cn("w-full min-w-0 overflow-hidden", className)}>
      {/* Donut Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={sorted}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            strokeWidth={0}
          >
            {sorted.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend dengan angka nominal — bukan hanya persentase */}
      <ul className="space-y-2 mt-1">
        {sorted.map((entry, index) => {
          const pct = total > 0 ? (entry.amount / total) * 100 : 0;
          const color = entry.color ?? CHART_COLORS[index % CHART_COLORS.length];
          return (
            <li key={entry.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="text-small truncate"
                  style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
                >
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="tabular-nums text-small"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-muted)" }}
                >
                  {pct.toFixed(0)}%
                </span>
                <span
                  className="tabular-nums text-small font-medium"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
                >
                  {formatRupiah(entry.amount)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
