"use client";

/**
 * components/charts/chartKit.tsx
 * Perkakas chart SVG ringan pengganti recharts (±340 KB JS). Koordinat
 * memakai piksel asli dari lebar kontainer (ResizeObserver), sehingga teks
 * sumbu tidak ikut terskala. Animasi masuk lewat kelas CSS di styles/motion.css
 * dan otomatis mati bila pengguna memilih reduced motion.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Lebar kontainer dalam piksel; 0 sebelum terukur. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => setWidth(Math.round(entries[0].contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** Batas atas "bulat" dan tick sumbu Y yang rapi (0, 1, 2, 2.5, 5 × 10^n). */
export function niceScale(maxValue: number, tickCount = 4) {
  const max = maxValue > 0 ? maxValue : 1;
  const rawStep = max / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? 10 * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(value);
  return { top, ticks };
}

/** Kurva monotone (Fritsch–Carlson): mulus tanpa melewati titik data, jadi area tidak "menembus" nol. */
export function monotonePath(points: [number, number][]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  const n = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0];
    slope[i] = dx[i] === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx[i];
  }
  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / slope[i - 1] + (dx[i] + 2 * dx[i - 1]) / slope[i]);
  }
  tangent[n - 1] = slope[n - 2];
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += `C${x0 + h},${y0 + tangent[i] * h} ${x1 - h},${y1 - tangent[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/** Indeks titik terdekat dari posisi pointer (untuk tooltip di sentuh & mouse). */
export function nearestIndex(event: React.PointerEvent<Element>, xs: number[]) {
  const rect = (event.currentTarget as Element).getBoundingClientRect();
  const x = event.clientX - rect.left;
  let best = 0;
  xs.forEach((value, index) => { if (Math.abs(value - x) < Math.abs(xs[best] - x)) best = index; });
  return best;
}

export function ChartTooltip({ x, width, children }: { x: number; width: number; children: ReactNode }) {
  const tooltipWidth = 224;
  const left = Math.min(Math.max(x - tooltipWidth / 2, 0), Math.max(width - tooltipWidth, 0));
  return (
    <div role="status" className="chart-tooltip pointer-events-none absolute top-0 z-10" style={{ left, width: tooltipWidth }}>
      {children}
    </div>
  );
}

export function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px] leading-5">
      <span className="flex min-w-0 items-center gap-1.5 text-ink-muted"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} /><span className="truncate">{label}</span></span>
      <span className="shrink-0 whitespace-nowrap font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}

export function ChartLegend({ items, className }: { items: { color: string; label: string; dashed?: boolean }[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-x-4 gap-y-1", className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          <span className={cn("h-0.5 w-3.5 rounded-full", item.dashed && "border-t-2 border-dashed bg-transparent")} style={item.dashed ? { borderColor: item.color } : { background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
