"use client";

/**
 * components/charts/deferred.tsx
 * Chart yang kodenya baru diunduh saat kartunya mendekati layar. Dipakai di
 * dashboard, tempat semua chart berada di bawah lipatan di ponsel. Halaman
 * yang chart-nya langsung terlihat (arus kas, aset) mengimpor dari "./index".
 */
import type { ComponentType } from "react";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { deferUntilVisible } from "@/components/ui/deferUntilVisible";

type Props<T> = T extends ComponentType<infer P> ? P : never;
const fallback = () => <ChartSkeleton />;

export const CashFlowChart = deferUntilVisible<Props<typeof import("./CashFlowChart").CashFlowChart>>(() => import("./CashFlowChart").then((m) => m.CashFlowChart), { fallback });
export const CategoryBreakdownChart = deferUntilVisible<Props<typeof import("./CategoryBreakdownChart").CategoryBreakdownChart>>(() => import("./CategoryBreakdownChart").then((m) => m.CategoryBreakdownChart), { fallback });
export const AccountBalanceChart = deferUntilVisible<Props<typeof import("./AccountBalanceChart").AccountBalanceChart>>(() => import("./AccountBalanceChart").then((m) => m.AccountBalanceChart), { fallback });
export const SpendingMomentumChart = deferUntilVisible<Props<typeof import("./SpendingMomentumChart").SpendingMomentumChart>>(() => import("./SpendingMomentumChart").then((m) => m.SpendingMomentumChart), { fallback });
