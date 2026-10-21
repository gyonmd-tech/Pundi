"use client";

/**
 * components/calculator/MoneyCalculator.tsx
 * Kalkulator uang: keypad besar yang nyaman di ponsel, tombol "000",
 * persen ala kalkulator HP (200.000 − 10% = 180.000), terbilang, riwayat,
 * salin, dan "Catat transaksi" yang membuka panel tambah transaksi
 * dengan nominal hasil hitungan.
 */
import * as React from "react";
import { Copy, Delete, History, NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuickAdd } from "@/lib/context/QuickAddContext";
import { useToast } from "@/lib/context/ToastContext";
import { evaluateExpression, formatExpression, formatNumber, OPERATORS, terbilang, type Operator } from "@/lib/utils/moneyMath";
import { cn } from "@/lib/utils/cn";

const HISTORY_KEY = "pundi-calculator-history";
const MAX_LENGTH = 60;

interface HistoryEntry { expression: string; result: number }

type Key =
  | { kind: "digit"; value: string; label?: string }
  | { kind: "op"; value: Operator; label: string }
  | { kind: "percent" | "decimal" | "clear" | "back" | "equals"; label: string };

const KEYS: Key[] = [
  { kind: "clear", label: "C" }, { kind: "back", label: "⌫" }, { kind: "percent", label: "%" }, { kind: "op", value: "/", label: "÷" },
  { kind: "digit", value: "7" }, { kind: "digit", value: "8" }, { kind: "digit", value: "9" }, { kind: "op", value: "*", label: "×" },
  { kind: "digit", value: "4" }, { kind: "digit", value: "5" }, { kind: "digit", value: "6" }, { kind: "op", value: "-", label: "−" },
  { kind: "digit", value: "1" }, { kind: "digit", value: "2" }, { kind: "digit", value: "3" }, { kind: "op", value: "+", label: "+" },
  { kind: "digit", value: "000" }, { kind: "digit", value: "0" }, { kind: "decimal", label: "," }, { kind: "equals", label: "=" },
];

const QUICK_AMOUNTS = [10_000, 20_000, 50_000, 100_000];

function lastNumber(expression: string) {
  return expression.match(/[0-9.]*%?$/)?.[0] ?? "";
}

export function MoneyCalculator() {
  const { openQuickAdd } = useQuickAdd();
  const { showToast } = useToast();
  const [expression, setExpression] = React.useState("");
  const [justEvaluated, setJustEvaluated] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as HistoryEntry[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- baca localStorage sekali setelah mount
      if (Array.isArray(saved)) setHistory(saved.slice(0, 12));
    } catch {
      // Riwayat hanya kenyamanan — abaikan bila storage tidak tersedia.
    }
  }, []);

  const result = evaluateExpression(expression);
  const hasOperator = /[+\-*/%]/.test(expression.replace(/^-/, ""));

  const press = React.useCallback((key: Key) => {
    setExpression((current) => {
      const fresh = justEvaluated && (key.kind === "digit" || key.kind === "decimal");
      const base = fresh ? "" : current;
      const last = base.slice(-1);
      switch (key.kind) {
        case "digit": {
          const number = lastNumber(base);
          if (number.endsWith("%")) return base;
          if (number === "0" && key.value !== ".") return (base.slice(0, -1) + key.value).replace(/^000/, "0");
          if (!number && key.value === "000") return base + "0";
          return (base + key.value).slice(0, MAX_LENGTH);
        }
        case "decimal": {
          const number = lastNumber(base);
          if (number.includes(".") || number.endsWith("%")) return base;
          return base + (number ? "." : "0.");
        }
        case "op": {
          if (!base) return key.value === "-" ? "-" : base;
          if ((OPERATORS as string[]).includes(last)) return base.slice(0, -1) + key.value;
          if (last === ".") return base.slice(0, -1) + key.value;
          return base + key.value;
        }
        case "percent": {
          const number = lastNumber(base);
          if (!number || number.endsWith("%") || last === ".") return base;
          return base + "%";
        }
        case "back":
          return base.slice(0, -1);
        case "clear":
          return "";
        case "equals":
          return base;
      }
    });
    if (key.kind === "equals") {
      const value = evaluateExpression(expression);
      if (value !== null && hasOperator) {
        const entry = { expression, result: value };
        setHistory((current) => {
          const next = [entry, ...current.filter((item) => item.expression !== expression)].slice(0, 12);
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* abaikan */ }
          return next;
        });
        setExpression(String(value));
      }
      setJustEvaluated(true);
    } else {
      setJustEvaluated(false);
    }
  }, [expression, hasOperator, justEvaluated]);

  // Dukungan keyboard fisik (desktop / tablet dengan keyboard).
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
      const map: Record<string, Key | undefined> = {
        "+": KEYS[15], "-": KEYS[11], "*": KEYS[7], x: KEYS[7], "/": KEYS[3], "%": KEYS[2],
        ",": KEYS[18], ".": KEYS[18], Enter: KEYS[19], "=": KEYS[19], Backspace: KEYS[1], Escape: KEYS[0], Delete: KEYS[0],
      };
      const key = /^[0-9]$/.test(event.key) ? ({ kind: "digit", value: event.key } as Key) : map[event.key];
      if (!key) return;
      event.preventDefault();
      press(key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const shown = result ?? 0;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(String(Math.round(shown)));
      showToast({ type: "success", title: "Disalin", message: `Rp ${formatNumber(Math.round(shown))} disalin ke clipboard.` });
    } catch {
      showToast({ type: "error", title: "Gagal menyalin", message: "Browser tidak mengizinkan akses clipboard." });
    }
  }

  function clearHistory() {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* abaikan */ }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start">
      <section className="overflow-hidden rounded-[26px] border border-rule bg-surface-high shadow-card">
        <div className="bg-brand-900 px-5 pb-5 pt-4 text-white">
          <p className="min-h-6 break-all text-right font-mono text-sm text-white/65" aria-label="Ekspresi">{expression ? formatExpression(expression) : "0"}</p>
          <p className="mt-1 break-all text-right font-mono text-[clamp(2rem,9vw,2.6rem)] font-bold leading-tight tabular-nums tracking-[-0.04em]" aria-live="polite">
            <span className="mr-1 text-lg font-semibold text-white/60">Rp</span>{formatNumber(shown)}
          </p>
          <p className="mt-1 min-h-4 text-right text-[11px] capitalize leading-snug text-white/60">{shown ? terbilang(shown) : ""}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-rule px-3 py-2.5 [scrollbar-width:none]">
          {QUICK_AMOUNTS.map((amount) => (
            <button key={amount} type="button" onClick={() => { setExpression((current) => (justEvaluated || !current ? String(amount) : /[0-9.%]$/.test(current) ? `${current}+${amount}` : `${current}${amount}`)); setJustEvaluated(false); }} className="shrink-0 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs font-bold text-ink transition hover:border-pine/40 active:scale-95">
              +{formatNumber(amount / 1000)}rb
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 p-3">
          {KEYS.map((key) => {
            const label = key.kind === "digit" ? key.label ?? key.value : key.label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => press(key)}
                aria-label={key.kind === "back" ? "Hapus satu digit" : key.kind === "clear" ? "Hapus semua" : label}
                className={cn(
                  "grid h-14 place-items-center rounded-[18px] text-xl font-bold transition active:scale-95 sm:h-16",
                  key.kind === "digit" || key.kind === "decimal" ? "bg-surface text-ink hover:bg-surface-soft" : "",
                  key.kind === "op" || key.kind === "percent" ? "bg-brand-50 text-[1.6rem] text-brand-700 hover:bg-brand-100" : "",
                  key.kind === "clear" || key.kind === "back" ? "bg-ember-10 text-ember-ink hover:brightness-95" : "",
                  key.kind === "equals" ? "bg-brand-600 text-white shadow-[0_8px_18px_rgba(36,89,222,.3)] hover:bg-brand-700" : "",
                  key.kind === "digit" && key.value === "000" ? "text-lg" : "",
                )}
              >
                {key.kind === "back" ? <Delete className="h-5 w-5" /> : label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-rule p-3">
          <Button type="button" variant="outline" onClick={copyResult} disabled={!shown}><Copy className="h-4 w-4" />Salin</Button>
          <Button type="button" onClick={() => openQuickAdd({ amount: Math.round(Math.abs(shown)) })} disabled={!shown}><NotebookPen className="h-4 w-4" />Catat transaksi</Button>
        </div>
      </section>

      <section className="rounded-[26px] border border-rule bg-surface-high p-4 shadow-card sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink"><History className="h-4 w-4 text-pine" />Riwayat hitungan</h2>
          {history.length ? <button type="button" onClick={clearHistory} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ember"><Trash2 className="h-3.5 w-3.5" />Hapus</button> : null}
        </div>
        {history.length ? (
          <ul className="mt-3 divide-y divide-rule">
            {history.map((entry) => (
              <li key={entry.expression}>
                <button type="button" onClick={() => { setExpression(entry.expression); setJustEvaluated(false); }} className="flex w-full items-center justify-between gap-3 py-2.5 text-left">
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{formatExpression(entry.expression)}</span>
                  <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-ink">= {formatNumber(entry.result)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Hasil hitungan akan muncul di sini. Tips: ketik <b className="text-ink">200.000 − 10%</b> untuk langsung dapat harga setelah diskon, atau pakai tombol <b className="text-ink">000</b> untuk ribuan.
          </p>
        )}
      </section>
    </div>
  );
}
