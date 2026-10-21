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

interface Tool {
  id: string;
  label: string;
  description: string;
  example: string;
  icon: LucideIcon;
  /** Gradasi kartu — hex karena kartu selalu berwarna di kedua tema. */
  gradient: string;
  Component: React.ComponentType;
}

const TOOLS: Tool[] = [
  { id: "kalkulator", label: "Kalkulator", description: "Hitung cepat dalam Rupiah, lengkap dengan terbilang.", example: "200.000 − 10%", icon: Calculator, gradient: "from-[#1D48B5] to-[#2860E6]", Component: MoneyCalculator },
  { id: "tunai", label: "Uang tunai", description: "Jumlahkan lembar & koin di dompet, cocokkan dengan saldo.", example: "3 × 50rb + 4 × 2rb", icon: Banknote, gradient: "from-[#0B6B54] to-[#159B78]", Component: CashCounter },
  { id: "patungan", label: "Bagi tagihan", description: "Patungan makan atau liburan, termasuk pajak & servis.", example: "Rp450rb ÷ 4 orang", icon: Users, gradient: "from-[#5B3FD0] to-[#7B61D1]", Component: SplitBill },
  { id: "diskon", label: "Diskon", description: "Harga akhir diskon bertingkat dan cashback.", example: "50% + 20%", icon: Percent, gradient: "from-[#C2410C] to-[#E95766]", Component: DiscountCalc },
  { id: "cicilan", label: "Cicilan", description: "Simulasi kredit HP, motor, paylater, atau KTA.", example: "Rp6jt · 12 bulan", icon: Landmark, gradient: "from-[#B87708] to-[#D99418]", Component: LoanCalc },
  { id: "jatah", label: "Jatah harian", description: "Berapa boleh dipakai per hari sampai gajian.", example: "Rp1,2jt ÷ 11 hari", icon: CalendarClock, gradient: "from-[#0E7490] to-[#0891B2]", Component: DailyAllowance },
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
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br text-white shadow-card", tool.gradient)}>
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
      <header>
        <p className="eyebrow">Alat hitung</p>
        <h1 className="page-title mt-1">Kalkulator Uang</h1>
        <p className="page-subtitle">Pilih alat — hasilnya bisa langsung dicatat sebagai transaksi.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {TOOLS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item.id)}
              style={{ animationDelay: `${index * 45}ms` }}
              className={cn(
                "group relative isolate flex min-h-[9.5rem] flex-col overflow-hidden rounded-[22px] bg-gradient-to-br p-4 text-left text-white shadow-card transition duration-200 animate-in fade-in slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-float active:scale-[.98] sm:min-h-[11rem] sm:p-5",
                item.gradient,
              )}
            >
              <span aria-hidden className="absolute -right-8 -top-10 -z-10 h-32 w-32 rounded-full border-[18px] border-white/10 transition duration-500 group-hover:scale-110" />
              <span className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-white/15 backdrop-blur-sm"><Icon className="h-5 w-5" /></span>
                <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </span>
              <span className="mt-auto pt-4">
                <span className="block text-[15px] font-extrabold leading-tight sm:text-base">{item.label}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-snug text-white/75">{item.description}</span>
                <span className="mt-2 hidden rounded-full bg-white/12 px-2 py-0.5 font-mono text-[11px] text-white/85 sm:inline-block">{item.example}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
