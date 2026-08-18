"use client";

/**
 * components/ui/EmptyState.tsx
 * Empty state terarah-aksi — bukan sekadar ilustrasi kosong.
 * (PRD.md § 7 Risiko: empty state harus mengarahkan aksi)
 * (DESIGN.md § 4.5: minimal shadow, hairline border)
 */

import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon:        LucideIcon;
  title:       string;
  description: string;
  action?:     {
    label:   string;
    onClick: () => void;
  };
  secondaryAction?: {
    label:   string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "px-6 py-12 rounded-card border",
        className
      )}
      style={{
        borderColor: "var(--color-rule)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-card flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--color-paper)" }}
      >
        <Icon
          size={24}
          strokeWidth={1.5}
          style={{ color: "var(--color-ink-muted)" }}
        />
      </div>

      {/* Title */}
      <h3
        className="text-heading font-medium mb-2"
        style={{
          fontFamily: "var(--font-ui)",
          color: "var(--color-ink)",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-body mb-6 max-w-xs"
        style={{
          fontFamily: "var(--font-ui)",
          color: "var(--color-ink-muted)",
          lineHeight: "var(--leading-body)",
        }}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 rounded-card text-body font-medium transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-pine)",
                color: "white",
                fontFamily: "var(--font-ui)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#153d32";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-pine)";
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-card text-body font-medium transition-colors duration-150"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-ink-muted)",
                fontFamily: "var(--font-ui)",
                border: "var(--border-hairline)",
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
