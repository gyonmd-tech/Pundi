"use client";

/**
 * components/ui/deferUntilVisible.tsx
 * Membungkus komponen agar kodenya baru diunduh saat posisinya mendekati
 * layar (IntersectionObserver + next/dynamic). Untuk bagian di bawah lipatan
 * di ponsel, sehingga JS yang diunduh sebelum halaman tampil tetap kecil.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

function useNearViewport<T extends Element>(rootMargin: string) {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(() => typeof window !== "undefined" && typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

export function deferUntilVisible<P extends object>(
  loader: () => Promise<ComponentType<P>>,
  { fallback, rootMargin = "200px", className }: { fallback: () => ReactNode; rootMargin?: string; className?: string },
) {
  const Loaded = dynamic(loader, { ssr: false, loading: () => <>{fallback()}</> });
  function Deferred(props: P) {
    const { ref, near } = useNearViewport<HTMLDivElement>(rootMargin);
    return <div ref={ref} className={className}>{near ? <Loaded {...props} /> : fallback()}</div>;
  }
  return Deferred;
}
