"use client";

/**
 * components/dashboard/InsightFeed.tsx
 * List insight ringkas: budget_warning, goal_progress, trend, tip.
 * (PRD.md § Epic G, ARCHITECTURE.md § 3)
 */

import { cn } from "@/lib/utils/cn";
import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/formatter";
import type { InsightType } from "@/lib/data/mock";

interface Insight {
  id:        string;
  type:      InsightType | string;
  message:   string;
  isRead:    boolean;
  createdAt: Date | string;
}

interface InsightFeedProps {
  insights:  Insight[];
  compact?:  boolean;
  className?: string;
}

const insightConfig: Record<string, {
  Icon:      typeof AlertTriangle;
  bgColor:   string;
  iconColor: string;
}> = {
  budget_warning: {
    Icon:      AlertTriangle,
    bgColor:   "var(--color-ember-10)",
    iconColor: "var(--color-ember)",
  },
  goal_progress: {
    Icon:      CheckCircle,
    bgColor:   "var(--color-brass-10)",
    iconColor: "var(--color-brass)",
  },
  trend: {
    Icon:      TrendingUp,
    bgColor:   "var(--color-pine-10)",
    iconColor: "var(--color-pine)",
  },
  tip: {
    Icon:      Lightbulb,
    bgColor:   "var(--color-paper)",
    iconColor: "var(--color-ink-muted)",
  },
  // Uppercase aliases for compatibility
  BUDGET_WARNING: {
    Icon:      AlertTriangle,
    bgColor:   "var(--color-ember-10)",
    iconColor: "var(--color-ember)",
  },
  GOAL_PROGRESS: {
    Icon:      CheckCircle,
    bgColor:   "var(--color-brass-10)",
    iconColor: "var(--color-brass)",
  },
  TREND: {
    Icon:      TrendingUp,
    bgColor:   "var(--color-pine-10)",
    iconColor: "var(--color-pine)",
  },
  TIP: {
    Icon:      Lightbulb,
    bgColor:   "var(--color-paper)",
    iconColor: "var(--color-ink-muted)",
  },
};

const defaultConfig = {
  Icon:      Lightbulb,
  bgColor:   "var(--color-paper)",
  iconColor: "var(--color-ink-muted)",
};

export function InsightFeed({ insights, compact = false, className }: InsightFeedProps) {
  if (!insights?.length) {
    return (
      <p
        className="text-body text-center py-4"
        style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
      >
        Belum ada insight. Tambah lebih banyak transaksi untuk mendapatkan wawasan keuangan.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {insights.map((insight) => {
        const key = String(insight.type || "").toLowerCase();
        const cfg = insightConfig[key] || insightConfig[insight.type] || defaultConfig;
        const Icon = cfg.Icon;
        return (
          <li
            key={insight.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-card border transition-colors duration-150",
              !insight.isRead && "border-l-2"
            )}
            style={{
              backgroundColor: insight.isRead ? "transparent" : cfg.bgColor + "80",
              borderColor: "var(--color-rule)",
              borderLeftColor: !insight.isRead ? cfg.iconColor : undefined,
            }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: cfg.bgColor }}
            >
              <Icon size={14} strokeWidth={1.5} style={{ color: cfg.iconColor }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-body"
                style={{
                  fontFamily: "var(--font-ui)",
                  color: "var(--color-ink)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                {insight.message}
              </p>
              {!compact && (
                <p
                  suppressHydrationWarning
                  className="text-small mt-1"
                  style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
                >
                  {formatDate(insight.createdAt, "time")}
                </p>
              )}
            </div>

            {/* Unread indicator */}
            {!insight.isRead && (
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                style={{ backgroundColor: cfg.iconColor }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
