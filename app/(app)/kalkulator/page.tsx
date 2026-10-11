"use client";

/**
 * app/(app)/kalkulator/page.tsx
 * Kalkulator khusus uang: kalkulator Rupiah + alat hitung sehari-hari.
 * Tab aktif tersimpan di URL hash (#tunai, #patungan, …) supaya bisa dibagikan.
 */
import * as React from "react";
import { Banknote, Calculator, CalendarClock, Landmark, Percent, Users } from "lucide-react";
import { MoneyCalculator } from "@/components/calculator/MoneyCalculator";
import { CashCounter, DailyAllowance, DiscountCalc, LoanCalc, SplitBill } from "@/components/calculator/MoneyTools";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "kalkulator", label: "Kalkulator", icon: Calculator, Component: MoneyCalculator },
  { id: "tunai", label: "Uang tunai", icon: Banknote, Component: CashCounter },
  { id: "patungan", label: "Bagi tagihan", icon: Users, Component: SplitBill },
  { id: "diskon", label: "Diskon", icon: Percent, Component: DiscountCalc },
  { id: "cicilan", label: "Cicilan", icon: Landmark, Component: LoanCalc },
  { id: "jatah", label: "Jatah harian", icon: CalendarClock, Component: DailyAllowance },
] as const;

type TabId = (typeof TABS)[number]["id"];

function readHash(): TabId {
  if (typeof window === "undefined") return "kalkulator";
  const hash = window.location.hash.replace("#", "");
  return (TABS.find((tab) => tab.id === hash)?.id ?? "kalkulator") as TabId;
}

export default function KalkulatorPage() {
  const [active, setActive] = React.useState<TabId>("kalkulator");

  React.useEffect(() => {
    const sync = () => setActive(readHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function select(id: TabId) {
    setActive(id);
    window.history.replaceState(null, "", id === "kalkulator" ? window.location.pathname : `#${id}`);
  }

  const current = TABS.find((tab) => tab.id === active) ?? TABS[0];
  const Active = current.Component;

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Alat hitung</p>
        <h1 className="page-title mt-1">Kalkulator Uang</h1>
        <p className="mt-1 text-xs text-ink-muted sm:text-small">Hitung belanja, uang tunai, patungan, diskon, cicilan, dan jatah harian — hasilnya bisa langsung dicatat.</p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist" aria-label="Jenis kalkulator">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => select(tab.id)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition active:scale-[0.98]",
                  selected ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_18px_rgba(36,89,222,.25)]" : "border-rule bg-surface-high text-ink hover:border-pine/40",
                )}
              >
                <Icon className="h-4 w-4" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" aria-label={current.label}>
        <Active />
      </div>
    </div>
  );
}
