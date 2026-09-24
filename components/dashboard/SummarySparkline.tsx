import { cn } from "@/lib/utils/cn";

export function SummarySparkline({ values, className }: { values: number[]; className?: string }) {
  const width = 240;
  const height = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2;
    const y = height - 8 - ((value - min) / range) * (height - 18);
    return `${x},${y}`;
  });
  const area = `M ${points.join(" L ")} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-16 w-full overflow-visible", className)} preserveAspectRatio="none" aria-hidden>
      <path d={area} fill="currentColor" opacity="0.1" />
      <polyline points={points.join(" ")} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {points.length ? <circle cx={points.at(-1)?.split(",")[0]} cy={points.at(-1)?.split(",")[1]} r="4" fill="currentColor" /> : null}
    </svg>
  );
}
