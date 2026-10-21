"use client";

import { cn } from "@/lib/utils/cn";
import type { PenjagaMood } from "@/lib/penjaga/types";
import { PenjagaCharacter } from "./PenjagaCharacter";

/** Potongan kepala Penjaga dalam lingkaran — untuk avatar chat & ikon navigasi. */
export function PenjagaAvatar({ size = 36, mood = "idle", animated = false, className }: {
  size?: number;
  mood?: PenjagaMood;
  animated?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-brand-100 ring-1 ring-brand-200/70", className)}
      style={{ width: size, height: size }}
    >
      <PenjagaCharacter
        mood={mood}
        animated={animated}
        grounded={false}
        title=""
        size={size * 1.55}
        className="absolute left-1/2 top-[6%] -translate-x-1/2"
      />
    </span>
  );
}
