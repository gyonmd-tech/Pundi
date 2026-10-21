"use client";

/**
 * components/landing/motion.tsx
 * Primitif motion landing (ADR-003) — tanpa library animasi:
 *  - useScrollStory: progres scroll section sticky (0–1), dihaluskan lerp di
 *    rAF, ditulis sebagai CSS variable (--p, --a0..--aN) tanpa re-render
 *    React; hanya berjalan saat section terlihat.
 *  - Reveal: elemen naik-memudar sekali saat masuk viewport.
 *  - SectionHeading: pola judul section yang seragam di seluruh landing.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils/cn";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Menggerakkan section "pinned". `acts` = jumlah babak; tiap babak mendapat
 * --aK (0..1). `onFrame` dipanggil tiap frame untuk hal imperatif (angka
 * berjalan, dsb.). Mengembalikan indeks babak aktif (berubah jarang → aman
 * untuk state React).
 */
export function useScrollStory(ref: RefObject<HTMLElement | null>, acts: number, onFrame?: (progress: number) => void) {
  const [act, setAct] = useState(0);
  const frameRef = useRef(onFrame);
  useEffect(() => { frameRef.current = onFrame; }, [onFrame]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = prefersReducedMotion();
    let smoothed = 0;
    let raf = 0;
    let visible = false;
    let lastAct = -1;

    const write = (progress: number) => {
      element.style.setProperty("--p", progress.toFixed(4));
      for (let index = 0; index < acts; index += 1) {
        element.style.setProperty(`--a${index}`, clamp(progress * acts - index).toFixed(4));
      }
      const nextAct = Math.min(acts - 1, Math.floor(progress * acts * 0.9999));
      if (nextAct !== lastAct) {
        lastAct = nextAct;
        setAct(nextAct);
      }
      frameRef.current?.(progress);
    };

    const target = () => {
      const rect = element.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      return range > 0 ? clamp(-rect.top / range) : 0;
    };

    const tick = () => {
      const goal = target();
      smoothed = reduced ? goal : smoothed + (goal - smoothed) * 0.14;
      if (Math.abs(goal - smoothed) < 0.0005) smoothed = goal;
      write(smoothed);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    observer.observe(element);
    smoothed = target();
    write(smoothed);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [acts, ref]);

  return act;
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "article" }) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "center", tone = "light" }: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <span className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em]",
        tone === "dark" ? "bg-white/10 text-brand-200" : "bg-brand-600/10 text-brand-600",
      )}>
        <span className={cn("h-1.5 w-1.5 rounded-full", tone === "dark" ? "bg-brand-300" : "bg-brand-600")} />
        {eyebrow}
      </span>
      <h2 className={cn(
        "mt-4 font-display text-[clamp(1.85rem,4vw,3.1rem)] font-black leading-[1.05] tracking-[-0.04em]",
        tone === "dark" ? "text-white" : "text-ink",
      )}>
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-[15px] leading-7 sm:text-base", tone === "dark" ? "text-white/70" : "text-ink-muted")}>{description}</p>
      ) : null}
    </Reveal>
  );
}
