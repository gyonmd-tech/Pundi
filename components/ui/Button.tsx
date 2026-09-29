"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[16px] border px-4 text-sm font-semibold tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "border-brand-600 bg-brand-600 text-white shadow-[0_8px_18px_rgba(36,89,222,.20)] hover:border-brand-700 hover:bg-brand-700 hover:shadow-[0_10px_24px_rgba(36,89,222,.25)]",
        secondary: "border-brand-900 bg-brand-900 text-white shadow-[0_8px_18px_rgba(19,43,94,.20)] hover:bg-brand-950",
        outline: "border-brand-200 bg-white text-ink shadow-card hover:border-brand-300 hover:bg-brand-50",
        ghost: "border-transparent bg-transparent text-ink-muted hover:bg-brand-50 hover:text-brand-800",
        danger: "border-ember-ink bg-ember-ink text-white shadow-card hover:brightness-95",
        soft: "border-brand-800 bg-brand-800 text-white shadow-[0_8px_18px_rgba(23,54,143,.20)] hover:brightness-95",
        success: "border-mint-ink bg-mint-ink text-white shadow-[0_8px_18px_rgba(11,107,84,.20)] hover:brightness-95",
      },
      size: {
        sm: "min-h-9 rounded-[12px] px-3 text-xs",
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
