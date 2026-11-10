"use client";

/**
 * app/(app)/kalkulator/page.tsx
 * Hub alat hitung uang: grid kartu alat → ketuk untuk membuka tampilan
 * fokus satu alat (dengan tombol kembali). Alat aktif disimpan di hash URL
 * (#tunai, #patungan, …) supaya bisa dibagikan & tombol Back browser bekerja.
 */
import * as React from "react";
import { ArrowLeft, ArrowUpRight, Banknote, Calculator, CalendarClock, Landmark, Percent, Users, type LucideIcon } from "lucide-react";
import { MoneyCalculator } from "@/components/calculator/MoneyCalculator";
import { CashCounter, DailyAllowance, DiscountCalc, LoanCalc, SplitBill } from "@/components/calculator/MoneyTools";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "@/components/ui/PageHeader";

interface Tool {
  id: string;
  label: string;
  description: string;
  example: string;
  icon: LucideIcon;
  /** Gradasi kartu — hex karena kartu selalu berwarna di kedua tema. */
  /** Kelas warna tonal untuk ikon alat. */
  gradient: string;
  Component: React.ComponentType;
}

const TOOLS: Tool[] = [
  { id: "kalkulator", label: "Kalkulator", description: "Hitung cepat dalam Rupiah, lengkap dengan terbilang.", example: "200.000 − 10%", icon: Calculator, gradient: "bg-brand-100 text-brand-700", Component: MoneyCalculator },
  { id: "tunai", label: "Uang tunai", description: "Jumlahkan lembar & koin di dompet, cocokkan dengan saldo.", example: "3 × 50rb + 4 × 2rb", icon: Banknote, gradient: "bg-mint-10 text-mint-ink", Component: CashCounter },
  { id: "patungan", label: "Bagi tagihan", description: "Patungan makan atau liburan, termasuk pajak & servis.", example: "Rp450rb ÷ 4 orang", icon: Users, gradient: "bg-lavender-10 text-lavender-ink", Component: SplitBill },
  { id: "diskon", label: "Diskon", description: "Harga akhir diskon bertingkat dan cashback.", example: "50% + 20%", icon: Percent, gradient: "bg-ember-10 text-ember-ink", Component: DiscountCalc },
  { id: "cicilan", label: "Cicilan", description: "Simulasi kredit HP, motor, paylater, atau KTA.", example: "Rp6jt · 12 bulan", icon: Landmark, gradient: "bg-warning-10 text-warning-ink", Component: LoanCalc },
  { id: "jatah", label: "Jatah harian", description: "Berapa boleh dipakai per hari sampai gajian.", example: "Rp1,2jt ÷ 11 hari", icon: CalendarClock, gradient: "bg-cyan-10 text-cyan-ink", Component: DailyAllowance },
];

function readHash() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  return TOOLS.some((tool) => tool.id === hash) ? hash : null;
}

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

export default function KalkulatorPage() {
  const active = React.useSyncExternalStore(subscribeHash, readHash, () => null);
  const tool = TOOLS.find((item) => item.id === active);
  const openedFromHub = React.useRef(false);

  function open(id: string) {
    openedFromHub.current = true;
    window.history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0 });
  }

  function back() {
    // Dibuka dari hub → kembali lewat riwayat (tombol Back browser tetap sinkron).
    // Dibuka langsung dari tautan #alat → cukup hapus hash.
    if (openedFromHub.current) {
      openedFromHub.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  if (tool) {
    const Active = tool.Component;
    const Icon = tool.icon;
    return (
      <div key={tool.id} className="animate-in fade-in slide-in-from-right-2 space-y-4">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            aria-label="Kembali ke semua alat"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rule bg-surface-high text-ink transition hover:border-brand-300 hover:text-brand-600 active:scale-95"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-gradient-to-br text-white shadow-card", tool.gradient)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-black tracking-[-0.02em] text-ink sm:text-2xl">{tool.label}</h1>
            <p className="truncate text-xs text-ink-muted">{tool.description}</p>
          </div>
        </header>
        <Active />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Kalkulator" description="Pilih alat — hasilnya bisa langsung dicatat sebagai transaksi." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {TOOLS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item.id)}
              style={{ animationDelay: `${index * 45}ms` }}
              className="pressable group flex min-h-[9rem] flex-col rounded-card border border-rule bg-surface-high p-4 text-left shadow-card animate-in fade-in slide-in-from-bottom-2 hover:border-rule-strong hover:shadow-card-hover sm:min-h-[10.5rem] sm:p-5"
            >
              <span className="flex items-start justify-between">
                <span className={cn("grid h-10 w-10 place-items-center rounded-xs", item.gradient)}><Icon className="h-5 w-5" /></span>
                <ArrowUpRight className="h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
              </span>
              <span className="mt-auto pt-4">
                <span className="block text-[15px] font-semibold leading-tight text-ink sm:text-base">{item.label}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-snug text-ink-muted">{item.description}</span>
                <span className="mt-2 hidden rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-ink-muted tabular-nums sm:inline-block">{item.example}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
