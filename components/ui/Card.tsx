import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-[22px] border shadow-card transition-[transform,box-shadow,border-color] duration-200",
  {
    variants: {
      variant: {
        default: "border-brand-600/10 bg-white text-ink",
        highlight:
          "border-brand-700 bg-brand-600 text-white shadow-[0_16px_36px_rgba(36,89,222,.24)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Card({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return <section className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-4 p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-display text-lg font-semibold tracking-[-0.02em] text-inherit", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs leading-relaxed text-current opacity-70", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 border-t border-current/10 p-5", className)} {...props} />;
}
