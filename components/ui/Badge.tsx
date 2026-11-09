import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// Chip tonal: latar lembut + teks gelap senada, terbaca di terang & gelap.
const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5", {
  variants: {
    tone: {
      neutral: "border-rule bg-surface-soft text-ink-muted",
      primary: "border-transparent bg-brand-100 text-brand-700",
      success: "border-transparent bg-mint-10 text-mint-ink",
      warning: "border-transparent bg-warning-10 text-warning-ink",
      danger: "border-transparent bg-ember-10 text-ember-ink",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
