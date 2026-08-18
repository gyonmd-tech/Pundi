"use client";

/**
 * components/ui/CategoryIcon.tsx
 * Komponen icon kategori SVG standar Lucide (aturan ui-ux-pro-max: NO emoji as structural icons).
 */

import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Music,
  Heart,
  Zap,
  Book,
  PiggyBank,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconMap: Record<string, LucideIcon> = {
  utensils:        Utensils,
  car:             Car,
  "shopping-bag":  ShoppingBag,
  music:           Music,
  heart:           Heart,
  zap:             Zap,
  book:            Book,
  "piggy-bank":    PiggyBank,
  "more-horizontal": MoreHorizontal,
  briefcase:       Briefcase,
  laptop:          Laptop,
  "trending-up":   TrendingUp,
  "plus-circle":   PlusCircle,
};

interface CategoryIconProps {
  icon?: string;
  color?: string;
  size?: number;
  className?: string;
  containerSize?: "sm" | "md" | "lg";
}

export function CategoryIcon({
  icon = "tag",
  color = "var(--color-pine)",
  size = 14,
  className,
  containerSize = "md",
}: CategoryIconProps) {
  const IconComponent = (icon && iconMap[icon]) || Tag;

  const sizeClasses = {
    sm: "w-6 h-6 rounded-sm",
    md: "w-8 h-8 rounded-sm",
    lg: "w-10 h-10 rounded-card",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
        sizeClasses[containerSize],
        className
      )}
      style={{
        backgroundColor: color ? `${color}18` : "var(--color-paper)",
        color: color || "var(--color-ink)",
      }}
    >
      <IconComponent size={size} strokeWidth={2} />
    </div>
  );
}
