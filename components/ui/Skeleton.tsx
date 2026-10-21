"use client";

/**
 * components/ui/Skeleton.tsx
 * Sistem skeleton "motion graphics" Pundi: kilau menyapu (bukan pulse
 * berkedip), kartu yang muncul bertahap, grafik garis yang tergambar,
 * batang yang tumbuh, donat yang berputar, dan Penjaga yang memasukkan koin
 * ke pundi selagi data dimuat. CSS ada di styles/motion.css.
 *
 * RouteSkeleton memilih kerangka sesuai halaman tujuan sehingga layout
 * tidak "melompat" saat data tiba.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { PenjagaCharacter } from "@/components/penjaga/PenjagaCharacter";

type DelayStyle = CSSProperties & { "--skeleton-delay"?: string };

export function Skeleton({ className, delay = 0, onBrand = false }: { className?: string; delay?: number; onBrand?: boolean }) {
  return <div aria-hidden className={cn("skeleton", onBrand && "skeleton-on-brand", className)} style={{ "--skeleton-delay": `${delay}ms` } as DelayStyle} />;
}

/** Bungkus yang muncul naik-memudar dengan jeda bertahap. */
export function SkeletonRise({ className, delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  return <div className={cn("skeleton-rise", className)} style={{ "--skeleton-delay": `${delay}ms` } as DelayStyle}>{children}</div>;
}

export function ChartSkeleton({ className, variant = "line" }: { className?: string; variant?: "line" | "bars" }) {
  return (
    <div role="status" aria-label="Memuat grafik" className={cn("relative h-64 overflow-hidden rounded-[18px] bg-brand-50/60", className)}>
      <svg viewBox="0 0 320 160" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        {[32, 64, 96, 128].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="var(--color-brand-200)" strokeDasharray="3 5" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {variant === "line" ? (
          <>
            <path d="M0 120 C30 112 50 80 80 88 S130 120 160 92 S210 40 240 56 S290 70 320 30" fill="none" stroke="var(--color-brand-400)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="skeleton-line-draw" />
            <path d="M0 140 C40 134 70 118 110 124 S180 104 220 110 S280 92 320 84" fill="none" stroke="var(--color-mint)" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="skeleton-line-draw" style={{ animationDelay: "300ms" }} />
          </>
        ) : (
          Array.from({ length: 8 }, (_, index) => (
            <rect key={index} x={14 + index * 38} y="30" width="20" height="120" rx="6" fill="var(--color-brand-200)" className="skeleton-bar" style={{ animationDelay: `${index * 110}ms` }} />
          ))
        )}
      </svg>
    </div>
  );
}

function DonutSkeleton() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40" aria-hidden>
      <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-brand-100)" strokeWidth="18" />
      <g className="skeleton-spin">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-brand-400)" strokeWidth="18" strokeDasharray="70 207" strokeLinecap="round" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-mint)" strokeOpacity=".7" strokeWidth="18" strokeDasharray="40 237" strokeDashoffset="-82" strokeLinecap="round" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-brass)" strokeOpacity=".7" strokeWidth="18" strokeDasharray="28 249" strokeDashoffset="-134" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const LOADING_LINES = ["Menghitung koin di pundimu…", "Merapikan catatan transaksi…", "Menyeimbangkan saldo rekening…", "Hampir siap…"];

/** Banner kecil: Penjaga memasukkan koin ke pundi + teks status bergilir. */
export function PenjagaLoader({ className }: { className?: string }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setLine((value) => Math.min(value + 1, LOADING_LINES.length - 1)), 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("flex items-center gap-3 overflow-hidden rounded-[20px] border border-brand-600/10 bg-surface-high px-3 py-2 shadow-card", className)}>
      <div className="relative h-14 w-12 shrink-0">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden
            className="skeleton-coin absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full border border-[#B87708] bg-[#F2B544]"
            style={{ animationDelay: `${index * 0.53}s`, marginLeft: `${(index - 1) * 5}px` }}
          />
        ))}
        <PenjagaCharacter mood="thinking" size={48} grounded={false} title="" className="absolute bottom-0 left-0" />
      </div>
      <div className="min-w-0 flex-1">
        <p key={line} className="animate-in fade-in slide-in-from-bottom-1 truncate text-[13px] font-semibold text-ink">{LOADING_LINES[line]}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full w-1/3 animate-[pundi-indeterminate_1.4s_cubic-bezier(.65,0,.35,1)_infinite] rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
        </div>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <SkeletonRise className="space-y-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-9 w-64 max-w-full" delay={80} />
      <Skeleton className="h-4 w-80 max-w-full" delay={160} />
    </SkeletonRise>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Memuat dashboard">
      <PenjagaLoader className="max-w-md" />
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SkeletonRise delay={120} className="relative min-h-60 overflow-hidden rounded-[28px] bg-brand-600 p-6 shadow-card lg:col-span-6">
          <div aria-hidden className="skeleton-spin absolute -right-10 -top-14 h-40 w-40 rounded-full border-[24px] border-dashed border-white/10" />
          <Skeleton onBrand className="h-11 w-11" />
          <Skeleton onBrand className="mt-10 h-4 w-36" delay={100} />
          <Skeleton onBrand className="mt-4 h-11 w-3/4" delay={200} />
          <div className="mt-7 flex gap-3"><Skeleton onBrand className="h-8 w-32" delay={300} /><Skeleton onBrand className="h-8 w-28" delay={400} /></div>
        </SkeletonRise>
        {[0, 1].map((index) => (
          <SkeletonRise key={index} delay={200 + index * 80} className="rounded-[22px] border border-brand-600/10 bg-surface-high p-5 shadow-card lg:col-span-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="mt-8 h-3 w-24" delay={100} />
            <Skeleton className="mt-3 h-8 w-36" delay={200} />
            <Skeleton className="mt-6 h-12 w-full" delay={300} />
          </SkeletonRise>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SkeletonRise delay={360} className="rounded-[22px] border border-brand-600/10 bg-surface-high p-5 shadow-card lg:col-span-8">
          <Skeleton className="h-5 w-48" />
          <ChartSkeleton className="mt-6" />
        </SkeletonRise>
        <SkeletonRise delay={440} className="rounded-[22px] border border-brand-600/10 bg-surface-high p-5 shadow-card lg:col-span-4">
          <Skeleton className="h-5 w-36" />
          <div className="mt-6"><DonutSkeleton /></div>
        </SkeletonRise>
      </div>
      <span className="sr-only">Memuat data keuangan…</span>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Memuat daftar">
      <PenjagaLoader className="max-w-md" />
      <HeaderSkeleton />
      <SkeletonRise delay={100} className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-10 w-28 shrink-0 rounded-full" delay={index * 80} />)}
      </SkeletonRise>
      <SkeletonRise delay={180} className="divide-y divide-rule overflow-hidden rounded-[22px] border border-brand-600/10 bg-surface-high shadow-card">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-[13px]" delay={index * 90} />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" delay={index * 90 + 40} />
              <Skeleton className="h-3 w-1/4" delay={index * 90 + 80} />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" delay={index * 90 + 120} />
          </div>
        ))}
      </SkeletonRise>
      <span className="sr-only">Memuat data…</span>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Memuat halaman">
      <PenjagaLoader className="max-w-md" />
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonRise key={index} delay={120 + index * 70} className="rounded-[22px] border border-brand-600/10 bg-surface-high p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-[14px]" delay={index * 70} />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/5" delay={index * 70 + 60} /><Skeleton className="h-3 w-2/5" delay={index * 70 + 120} /></div>
            </div>
            <Skeleton className="mt-6 h-7 w-1/2" delay={index * 70 + 180} />
            <Skeleton className="mt-4 h-2.5 w-full rounded-full" delay={index * 70 + 240} />
          </SkeletonRise>
        ))}
      </div>
      <span className="sr-only">Memuat data…</span>
    </div>
  );
}

export function PenjagaSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 pt-10" role="status" aria-label="Memuat Penjaga">
      <PenjagaCharacter mood="thinking" size={120} title="" />
      <Skeleton className="h-8 w-72 max-w-full" delay={80} />
      <Skeleton className="h-4 w-96 max-w-full" delay={160} />
      <div className="mt-4 grid w-full gap-2.5 sm:grid-cols-3">
        {[0, 1, 2].map((index) => <Skeleton key={index} className="h-24 w-full rounded-[18px]" delay={220 + index * 90} />)}
      </div>
    </div>
  );
}

const LIST_ROUTES = ["/transaksi", "/pengaturan/log-aktivitas", "/utang", "/insight", "/catatan-kondisi"];
const CARD_ROUTES = ["/anggaran", "/tujuan", "/aset", "/pengaturan", "/kalkulator"];

/** Kerangka yang cocok dengan halaman yang sedang dibuka. */
export function RouteSkeleton() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/penjaga")) return <PenjagaSkeleton />;
  if (LIST_ROUTES.some((route) => pathname.startsWith(route))) return <ListSkeleton />;
  if (CARD_ROUTES.some((route) => pathname.startsWith(route))) return <CardsSkeleton />;
  return <DashboardSkeleton />;
}
