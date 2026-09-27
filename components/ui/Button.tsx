"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[15px] border px-4 text-sm font-bold tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "border-pine/80 bg-[linear-gradient(145deg,#6957F6,#4F3DDD)] text-white shadow-[6px_8px_18px_rgba(91,74,239,.22),inset_0_1px_1px_rgba(255,255,255,.32)] hover:-translate-y-0.5 hover:shadow-[8px_11px_24px_rgba(91,74,239,.28)]",
        secondary: "border-mint/40 bg-mint/15 text-ink hover:bg-mint/25",
        outline: "border-white/80 bg-[linear-gradient(145deg,#FFFFFF,#F5F2FF)] text-ink shadow-clay-soft hover:border-pine/25 hover:bg-pine-10",
        ghost: "border-transparent bg-transparent text-ink-muted hover:bg-paper hover:text-ink",
        danger: "border-ember bg-ember text-white shadow-sm hover:brightness-105",
        soft: "border-white/80 bg-[linear-gradient(145deg,#F8F6FF,#EAE5FF)] text-pine shadow-clay-soft hover:border-pine/20 hover:bg-pine/15",
      },
      size: {
        sm: "min-h-8 rounded-[11px] px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-12 rounded-[16px] px-5 text-base",
        icon: "h-10 min-h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ "aria-label": ariaLabel, ...props }, ref) => (
    <Button ref={ref} size="icon" aria-label={ariaLabel} {...props} />
  ),
);
IconButton.displayName = "IconButton";
