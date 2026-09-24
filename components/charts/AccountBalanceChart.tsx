"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRupiah } from "@/lib/utils/formatter";

interface AccountBalancePoint {
  name: string;
  balance: number;
  color: string;
}

export function AccountBalanceChart({ data }: { data: AccountBalancePoint[] }) {
  return (
    <div className="h-[340px] w-full min-w-0 lg:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-rule)" strokeDasharray="4 7" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-muted)", fontSize: 11, fontFamily: "var(--font-ui)" }} tickFormatter={(value) => String(value).split(" ")[0]} />
          <YAxis axisLine={false} tickLine={false} width={64} tick={{ fill: "var(--color-ink-muted)", fontSize: 10, fontFamily: "var(--font-ui)" }} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)} jt`} />
          <Tooltip cursor={{ fill: "rgba(91,74,239,.05)", radius: 12 }} formatter={(value) => [formatRupiah(Number(value)), "Saldo"]} contentStyle={{ borderRadius: 14, border: "1px solid var(--color-rule)", boxShadow: "var(--shadow-card)", fontFamily: "var(--font-ui)", fontSize: 12 }} />
          <Bar dataKey="balance" radius={[10, 10, 4, 4]} maxBarSize={54}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
