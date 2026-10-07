function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[18px] bg-brand-100 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat dashboard">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="h-10 w-full max-w-md" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative min-h-64 overflow-hidden rounded-[28px] border border-brand-700 bg-brand-600 p-6 shadow-card lg:col-span-6">
          <div className="absolute -right-10 -top-14 h-40 w-40 animate-pulse rounded-full border-[24px] border-white/10" />
          <SkeletonBlock className="h-11 w-11 bg-white/20" />
          <SkeletonBlock className="mt-12 h-4 w-36 bg-white/20" />
          <SkeletonBlock className="mt-4 h-12 w-3/4 bg-white/25" />
          <div className="mt-8 flex gap-3"><SkeletonBlock className="h-8 w-36 bg-white/90" /><SkeletonBlock className="h-8 w-32 bg-brand-900" /></div>
        </div>
        <SkeletonBlock className="min-h-64 border border-brand-600/10 bg-surface-high shadow-card lg:col-span-3" />
        <SkeletonBlock className="min-h-64 border border-brand-600/10 bg-surface-high shadow-card lg:col-span-3" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-[22px] border border-rule bg-surface-high p-5 lg:col-span-8">
          <SkeletonBlock className="h-6 w-52" />
          <SkeletonBlock className="mt-8 h-64 w-full bg-brand-50" />
        </div>
        <div className="rounded-[22px] border border-rule bg-surface-high p-5 lg:col-span-4">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mx-auto mt-8 h-44 w-44 animate-pulse rounded-full border-[28px] border-pine-10" />
        </div>
      </div>
      <span className="sr-only">Memuat data keuangan…</span>
    </div>
  );
}
