"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex min-h-10 select-none items-center justify-center gap-2 rounded-sm border px-4 text-sm font-semibold tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_1px_2px_rgba(15,23,41,.12),0_6px_16px_color-mix(in_srgb,var(--color-brand-600)_24%,transparent)] hover:bg-brand-700",
        secondary: "border-transparent bg-ink text-paper shadow-[0_1px_2px_rgba(15,23,41,.16)] hover:opacity-90",
        outline: "border-rule bg-surface-high text-ink shadow-[0_1px_2px_rgba(15,23,41,.04)] hover:border-rule-strong hover:bg-surface",
        ghost: "border-transparent bg-transparent text-ink-muted hover:bg-surface-soft hover:text-ink",
        danger: "border-ember-ink bg-ember-ink text-white shadow-card hover:brightness-95",
        soft: "border-transparent bg-brand-50 text-brand-700 hover:bg-brand-100",
        success: "border-transparent bg-mint-ink text-white shadow-[0_1px_2px_rgba(15,23,41,.12)] hover:brightness-95",
      },
      size: {
        sm: "min-h-9 rounded-sm px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-12 rounded-sm px-5 text-base",
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
