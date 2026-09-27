"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah, formatRupiahShort } from "@/lib/utils/formatter";

interface SpendingPoint {
  label: string;
  amount: number;
}

interface MomentumPoint extends SpendingPoint {
  cumulative: number;
}

export function SpendingMomentumChart({ data }: { data: SpendingPoint[] }) {
  const points: MomentumPoint[] = data.map((item, index) => ({
    ...item,
    cumulative: data.slice(0, index + 1).reduce((sum, point) => sum + point.amount, 0),
  }));
  const total = points.at(-1)?.cumulative ?? 0;
  const average = data.length ? total / data.length : 0;

  return (
    <div className="h-[240px] w-full min-w-0" aria-label="Grafik momentum pengeluaran tujuh hari terakhir">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="momentumBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2459DE" stopOpacity={1} />
              <stop offset="100%" stopColor="#5C8FF2" stopOpacity={0.86} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-rule)" strokeDasharray="4 7" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-ui)" }}
            dy={8}
          />
          <YAxis
            yAxisId="daily"
            axisLine={false}
            tickLine={false}
            width={58}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 10, fontFamily: "var(--font-ui)" }}
            tickFormatter={formatRupiahShort}
          />
          <YAxis yAxisId="cumulative" orientation="right" hide />
          <ReferenceLine
            yAxisId="daily"
            y={average}
            stroke="#E95766"
            strokeDasharray="4 5"
            strokeWidth={1.5}
          />
          <Tooltip
            cursor={{ fill: "rgba(36,89,222,.06)", radius: 12 }}
            formatter={(value, name) => [
              formatRupiah(Number(value)),
              name === "amount" ? "Pengeluaran harian" : "Akumulasi minggu",
            ]}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid var(--color-brand-200)",
              background: "#FFFFFF",
              boxShadow: "var(--shadow-card)",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
            }}
          />
          <Bar
            yAxisId="daily"
            dataKey="amount"
            fill="url(#momentumBar)"
            radius={[9, 9, 4, 4]}
            maxBarSize={34}
            isAnimationActive={false}
          />
          <Line
            yAxisId="cumulative"
            type="monotone"
            dataKey="cumulative"
            stroke="#142B87"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#142B87", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#142B87", stroke: "#FFFFFF", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
