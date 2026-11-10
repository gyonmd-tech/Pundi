"use client";

/**
 * app/(app)/insight/page.tsx
 * Feed insight & notifikasi keuangan interaktif dengan tab filter,
 * toast notification, dan single-click mark as read.
 */

import React, { useState } from "react";
import { useApp, useInsights } from "@/lib/data/store";
import { InsightFeed } from "@/components/dashboard/InsightFeed";
import { useToast } from "@/lib/context/ToastContext";
import { CheckCheck, Bell, Sparkles, AlertTriangle, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { InsightType } from "@/lib/data/mock";
import { markAllInsightsReadAction } from "@/actions/insights";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

const filterTabs: { key: InsightType | "all"; label: string; icon: LucideIcon }[] = [
  { key: "all",            label: "Semua",    icon: Sparkles },
  { key: "budget_warning", label: "Anggaran", icon: AlertTriangle },
  { key: "trend",          label: "Tren",     icon: TrendingUp },
  { key: "goal_progress",  label: "Tujuan",   icon: CheckCircle2 },
  { key: "tip",            label: "Tips",     icon: Lightbulb },
];

export default function InsightPage() {
  const { dispatch }  = useApp();
  const insights      = useInsights();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = insights.filter((i) => !i.isRead).length;

  const filteredInsights = insights.filter((i) => {
    if (activeTab === "all") return true;
    return String(i.type).toLowerCase() === activeTab;
  });

  const sortedInsights = [...filteredInsights].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadList = sortedInsights.filter((i) => !i.isRead);
  const readList   = sortedInsights.filter((i) => i.isRead);

  async function handleMarkAllRead() {
    const result = await markAllInsightsReadAction();
    if (!result.success) {
      showToast({ type: "error", title: "Insight gagal diperbarui", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "MARK_ALL_READ" });
    showToast({
      type: "success",
      title: "Semua Ditandai Dibaca",
      message: "Seluruh notifikasi insight telah dipindahkan ke riwayat terbaca.",
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Insight"
        description={unreadCount > 0 ? <><strong className="font-semibold text-ember">{unreadCount} baru</strong> perlu perhatianmu</> : "Semua insight sudah dibaca"}
        actions={unreadCount > 0 ? <Button variant="outline" size="sm" onClick={handleMarkAllRead} aria-label="Tandai semua dibaca"><CheckCheck size={15} /><span className="hidden sm:inline">Tandai dibaca</span></Button> : null}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 touch-pan-x overscroll-x-contain w-full max-w-full">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          const count = tab.key === "all"
            ? insights.length
            : insights.filter(i => String(i.type).toLowerCase() === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-card border text-small font-semibold transition-all whitespace-nowrap active:scale-95 shadow-2xs",
                isSelected
                  ? "shadow-sm"
                  : "hover:text-ink hover:bg-paper"
              )}
              style={{
                backgroundColor: isSelected ? "var(--color-pine)" : "var(--color-surface)",
                color: isSelected ? "#FFFFFF" : "var(--color-ink)",
                borderColor: isSelected ? "var(--color-pine)" : "var(--color-rule)",
              }}
            >
              <Icon size={14} strokeWidth={2} style={{ color: isSelected ? "#FFFFFF" : "var(--color-pine)" }} />
              <span>{tab.label}</span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "var(--color-paper)",
                  color: isSelected ? "#FFFFFF" : "var(--color-ink-muted)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unread Section Card */}
      {unreadList.length > 0 && (
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-rule">
            <span className="w-2.5 h-2.5 rounded-full bg-ember animate-pulse" />
            <h2 className="text-small font-bold uppercase tracking-wider text-ember font-ui">
              Perlu Perhatian · {unreadList.length} Baru
            </h2>
          </div>
          <InsightFeed insights={unreadList} compact={false} />
        </div>
      )}

      {/* Read Section Card */}
      {readList.length > 0 && (
        <div className="card p-4 sm:p-5">
          <div className="pb-3 mb-3 border-b border-rule">
            <h2 className="text-small font-bold uppercase tracking-wider text-ink-muted font-ui">
              Riwayat Insight Sebelumnya
            </h2>
          </div>
          <InsightFeed insights={readList} compact={false} />
        </div>
      )}

      {/* Empty State */}
      {sortedInsights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mb-3 text-ink-muted">
            <Bell size={24} strokeWidth={1.5} />
          </div>
          <p className="text-body font-semibold text-ink mb-1">
            Tidak ada insight pada kategori ini
          </p>
          <p className="text-small text-ink-muted max-w-sm">
            Terus catat mutasi harianmu dan sistem akan otomatis menganalisis kebiasaan finansialmu.
          </p>
        </div>
      )}
    </div>
  );
}
