import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold", {
  variants: {
    tone: {
      neutral: "border-rule bg-paper text-ink-muted",
      primary: "border-pine/20 bg-pine-10 text-pine",
      success: "border-mint/40 bg-mint/15 text-ink",
      warning: "border-brass/30 bg-brass/10 text-brass",
      danger: "border-ember/20 bg-ember-10 text-ember",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
