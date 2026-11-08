"use client";

/**
 * components/charts/lazy.tsx
 * Chart (recharts ±430 KB) hanya diunduh saat kartunya mendekati layar.
 * Di ponsel sebagian besar chart ada di bawah lipatan, jadi halaman pertama
 * tampil tanpa menunggu library grafik.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChartSkeleton } from "@/components/ui/Skeleton";

function useNearViewport<T extends Element>(rootMargin = "300px") {
  const ref = useRef<T | null>(null);
  // Browser tanpa IntersectionObserver langsung memuat chart.
  const [near, setNear] = useState(() => typeof window !== "undefined" && typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

function lazyChart<P extends object>(loader: () => Promise<ComponentType<P>>) {
  const Chart = dynamic(loader, { ssr: false, loading: () => <ChartSkeleton /> });
  function LazyChart(props: P) {
    const { ref, near } = useNearViewport<HTMLDivElement>();
    return <div ref={ref}>{near ? <Chart {...props} /> : <ChartSkeleton />}</div>;
  }
  return LazyChart;
}

type Props<T> = T extends ComponentType<infer P> ? P : never;
type CashFlow = typeof import("./CashFlowChart").CashFlowChart;
type Category = typeof import("./CategoryBreakdownChart").CategoryBreakdownChart;
type AccountBalance = typeof import("./AccountBalanceChart").AccountBalanceChart;
type Momentum = typeof import("./SpendingMomentumChart").SpendingMomentumChart;

export const CashFlowChart = lazyChart<Props<CashFlow>>(() => import("./CashFlowChart").then((m) => m.CashFlowChart));
export const CategoryBreakdownChart = lazyChart<Props<Category>>(() => import("./CategoryBreakdownChart").then((m) => m.CategoryBreakdownChart));
export const AccountBalanceChart = lazyChart<Props<AccountBalance>>(() => import("./AccountBalanceChart").then((m) => m.AccountBalanceChart));
export const SpendingMomentumChart = lazyChart<Props<Momentum>>(() => import("./SpendingMomentumChart").then((m) => m.SpendingMomentumChart));
