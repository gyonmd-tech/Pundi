"use client";

/**
 * components/ui/CategoryIcon.tsx
 * Badge ikon kategori Pundi dengan warna domain solid dan clay depth yang ringkas.
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
    sm: "h-7 w-7 rounded-[9px]",
    md: "h-9 w-9 rounded-[11px]",
    lg: "h-11 w-11 rounded-[14px]",
  };

  return (
    <div
      className={cn(
        "relative isolate grid flex-shrink-0 place-items-center",
        sizeClasses[containerSize],
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[2px] translate-y-[3px] rounded-[inherit] opacity-25"
        style={{ backgroundColor: color || "var(--color-brand-600)" }}
      />
      <span
        className="relative grid h-full w-full place-items-center overflow-hidden rounded-[inherit] text-white"
        style={{
          backgroundColor: color || "var(--color-brand-600)",
          backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${color || "var(--color-brand-600)"} 82%, white 18%), color-mix(in srgb, ${color || "var(--color-brand-600)"} 82%, black 18%))`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.36), inset 0 -1px 0 rgba(17,39,114,.16)",
        }}
      >
        <span aria-hidden="true" className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/20" />
        <IconComponent className="relative drop-shadow-[0_1px_1px_rgba(17,39,114,.28)]" size={size} strokeWidth={2.25} />
        <span aria-hidden="true" className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-white/80" />
      </span>
    </div>
  );
}
