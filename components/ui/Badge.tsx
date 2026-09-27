import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-[0_5px_12px_rgba(19,43,94,.12)]", {
  variants: {
    tone: {
      neutral: "border-brand-900 bg-brand-900 text-white",
      primary: "border-brand-600 bg-brand-600 text-white",
      success: "border-mint-ink bg-mint-ink text-white",
      warning: "border-[#855A00] bg-[#855A00] text-white",
      danger: "border-ember-ink bg-ember-ink text-white",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
