"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "border-pine bg-pine text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md",
        secondary: "border-mint/40 bg-mint/15 text-ink hover:bg-mint/25",
        outline: "border-rule bg-white text-ink shadow-2xs hover:border-pine/45 hover:bg-pine-10",
        ghost: "border-transparent bg-transparent text-ink-muted hover:bg-paper hover:text-ink",
        danger: "border-ember bg-ember text-white shadow-sm hover:brightness-105",
        soft: "border-pine/15 bg-pine-10 text-pine hover:bg-pine/15",
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
