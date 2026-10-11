"use client";

/**
 * components/calculator/MoneyTools.tsx
 * Alat hitung uang sehari-hari: uang tunai per pecahan, bagi tagihan,
 * diskon, cicilan, dan jatah harian sampai gajian.
 */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Minus, NotebookPen, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { useAccounts } from "@/lib/data/store";
import { useQuickAdd } from "@/lib/context/QuickAddContext";
import { formatRupiah } from "@/lib/utils/formatter";
import { installment, roundUpTo, terbilang } from "@/lib/utils/moneyMath";
import { cn } from "@/lib/utils/cn";

/* ── Komponen kecil bersama ─────────────────────────────────────────── */

export function MoneyField({ label, value, onChange, suffix, hint, id }: { label: string; value: number; onChange: (value: number) => void; suffix?: string; hint?: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-[16px] border border-rule bg-surface px-3.5 focus-within:border-pine focus-within:shadow-[var(--shadow-focus)]">
        {suffix ? null : <span className="text-sm font-bold text-pine">Rp</span>}
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          data-search-input="true"
          value={value ? value.toLocaleString("id-ID") : ""}
          onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "").slice(0, 13)) || 0)}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-right font-mono text-lg font-bold tabular-nums text-ink outline-none"
        />
        {suffix ? <span className="shrink-0 text-sm font-semibold text-ink-muted">{suffix}</span> : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function PercentField({ label, value, onChange, id, step = 0.5 }: { label: string; value: number; onChange: (value: number) => void; id: string; step?: number }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</label>
      <div className="flex items-center gap-2 rounded-[16px] border border-rule bg-surface px-3.5 focus-within:border-pine focus-within:shadow-[var(--shadow-focus)]">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) && value !== 0 ? value : ""}
          placeholder="0"
          data-search-input="true"
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-right font-mono text-lg font-bold tabular-nums text-ink outline-none"
        />
        <span className="shrink-0 text-sm font-semibold text-ink-muted">%</span>
      </div>
    </div>
  );
}

function ResultPanel({ label, value, rows, footer }: { label: string; value: number; rows?: Array<[string, string]>; footer?: React.ReactNode }) {
  return (
    <div className="rounded-[22px] bg-brand-900 p-5 text-white">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/65">{label}</p>
      <p className="mt-1 break-all font-mono text-[clamp(1.75rem,8vw,2.25rem)] font-bold leading-tight tabular-nums tracking-[-0.04em]">{formatRupiah(value)}</p>
      <p className="mt-1 text-[11px] capitalize text-white/60">{value ? terbilang(value) : ""}</p>
      {rows?.length ? (
        <dl className="mt-4 space-y-1.5 border-t border-white/15 pt-3 text-sm">
          {rows.map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-3"><dt className="text-white/70">{key}</dt><dd className="font-mono font-semibold tabular-nums">{val}</dd></div>
          ))}
        </dl>
      ) : null}
      {footer}
    </div>
  );
}

function RecordButton({ amount }: { amount: number }) {
  const { openQuickAdd } = useQuickAdd();
  return (
    <Button type="button" variant="outline" size="sm" className="mt-4 w-full border-white/25 bg-white/10 text-white hover:bg-white/20" disabled={!amount} onClick={() => openQuickAdd({ amount })}>
      <NotebookPen className="h-4 w-4" />Catat sebagai transaksi
    </Button>
  );
}

function ToolLayout({ form, result }: { form: React.ReactNode; result: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
      <section className="space-y-4 rounded-[26px] border border-rule bg-surface-high p-4 shadow-card sm:p-5">{form}</section>
      <div className="lg:sticky lg:top-28">{result}</div>
    </div>
  );
}

/* ── 1. Hitung uang tunai per pecahan ───────────────────────────────── */

const DENOMINATIONS = [
  { value: 100_000, kind: "kertas", tone: "bg-ember-10 text-ember-ink" },
  { value: 50_000, kind: "kertas", tone: "bg-brand-50 text-brand-700" },
  { value: 20_000, kind: "kertas", tone: "bg-mint-10 text-mint-ink" },
  { value: 10_000, kind: "kertas", tone: "bg-lavender-10 text-lavender-ink" },
  { value: 5_000, kind: "kertas", tone: "bg-warning-10 text-warning-ink" },
  { value: 2_000, kind: "kertas", tone: "bg-surface-soft text-ink-muted" },
  { value: 1_000, kind: "kertas", tone: "bg-cyan-10 text-cyan-ink" },
  { value: 1_000, kind: "koin", tone: "bg-surface-soft text-ink-muted" },
  { value: 500, kind: "koin", tone: "bg-surface-soft text-ink-muted" },
  { value: 200, kind: "koin", tone: "bg-surface-soft text-ink-muted" },
  { value: 100, kind: "koin", tone: "bg-surface-soft text-ink-muted" },
] as const;

export function CashCounter() {
  const accounts = useAccounts().filter((account) => account.isActive);
  const [counts, setCounts] = React.useState<number[]>(() => DENOMINATIONS.map(() => 0));
  const [accountId, setAccountId] = React.useState("");
  const total = counts.reduce((sum, count, index) => sum + count * DENOMINATIONS[index].value, 0);
  const pieces = counts.reduce((sum, count) => sum + count, 0);
  const account = accounts.find((item) => item.id === accountId);
  const difference = account ? total - account.balance : 0;

  const setCount = (index: number, value: number) => setCounts((current) => current.map((count, i) => (i === index ? Math.max(0, Math.min(9999, value)) : count)));

  return (
    <ToolLayout
      form={
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">Hitung uang tunai</h2>
              <p className="text-xs text-ink-muted">Masukkan jumlah lembar / keping tiap pecahan.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setCounts(DENOMINATIONS.map(() => 0))} disabled={!pieces}><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
          </div>
          <ul className="divide-y divide-rule">
            {DENOMINATIONS.map((denomination, index) => (
              <li key={`${denomination.kind}-${denomination.value}`} className="flex items-center gap-3 py-2.5">
                <span className={cn("grid h-10 w-16 shrink-0 place-items-center rounded-lg text-xs font-extrabold", denomination.kind === "koin" ? "rounded-full" : "", denomination.tone)}>
                  {denomination.value >= 1000 ? `${denomination.value / 1000}rb` : denomination.value}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold capitalize text-ink">{denomination.kind}</span>
                  <span className="block font-mono text-[11px] text-ink-muted tabular-nums">{formatRupiah(counts[index] * denomination.value)}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => setCount(index, counts[index] - 1)} aria-label={`Kurangi ${denomination.kind} ${denomination.value}`} className="grid h-10 w-10 place-items-center rounded-xl bg-surface-soft text-ink active:scale-95 disabled:opacity-40" disabled={!counts[index]}><Minus className="h-4 w-4" /></button>
                  <input
                    inputMode="numeric"
                    aria-label={`Jumlah ${denomination.kind} ${denomination.value}`}
                    value={counts[index] || ""}
                    placeholder="0"
                    data-search-input="true"
                    onChange={(event) => setCount(index, Number(event.target.value.replace(/\D/g, "")) || 0)}
                    className="h-10 w-12 rounded-xl border-0 bg-transparent text-center font-mono text-base font-bold tabular-nums text-ink outline-none"
                  />
                  <button type="button" onClick={() => setCount(index, counts[index] + 1)} aria-label={`Tambah ${denomination.kind} ${denomination.value}`} className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white active:scale-95"><Plus className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </>
      }
      result={
        <ResultPanel
          label={`Total uang tunai · ${pieces} lembar/keping`}
          value={total}
          footer={
            <div className="mt-4 space-y-2 border-t border-white/15 pt-3">
              <label htmlFor="cash-account" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-white/65">Cocokkan dengan saldo di Pundi</label>
              <select id="cash-account" value={accountId} onChange={(event) => setAccountId(event.target.value)} className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none [&>option]:text-ink">
                <option value="">Pilih rekening / dompet…</option>
                {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              {account ? (
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  <p className="flex justify-between gap-3"><span className="text-white/70">Saldo tercatat</span><b className="font-mono tabular-nums">{formatRupiah(account.balance)}</b></p>
                  <p className="mt-1 flex justify-between gap-3"><span className="text-white/70">Selisih</span><b className={cn("font-mono tabular-nums", difference === 0 ? "text-white" : difference > 0 ? "text-[#7CE7C3]" : "text-[#FFB3BC]")}>{difference > 0 ? "+" : difference < 0 ? "−" : ""}{formatRupiah(Math.abs(difference))}</b></p>
                  {difference !== 0 ? (
                    <Link href="/catatan-kondisi" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white underline-offset-2 hover:underline">Sesuaikan saldo di Catatan Kondisi <ArrowRight className="h-3.5 w-3.5" /></Link>
                  ) : <p className="mt-2 text-xs text-white/70">Cocok! Saldo tunai sesuai catatan.</p>}
                </div>
              ) : null}
            </div>
          }
        />
      }
    />
  );
}

/* ── 2. Bagi tagihan / patungan ─────────────────────────────────────── */

export function SplitBill() {
  const [subtotal, setSubtotal] = React.useState(0);
  const [people, setPeople] = React.useState(2);
  const [tax, setTax] = React.useState(10);
  const [service, setService] = React.useState(0);
  const [rounding, setRounding] = React.useState(1000);
  const taxAmount = Math.round((subtotal * tax) / 100);
  const serviceAmount = Math.round((subtotal * service) / 100);
  const total = subtotal + taxAmount + serviceAmount;
  const perPerson = people > 0 ? total / people : 0;
  const perPersonRounded = roundUpTo(Math.ceil(perPerson), rounding);

  return (
    <ToolLayout
      form={
        <>
          <div><h2 className="text-base font-bold text-ink">Bagi tagihan</h2><p className="text-xs text-ink-muted">Patungan makan, kado, atau liburan bareng.</p></div>
          <MoneyField id="split-subtotal" label="Total tagihan (sebelum pajak)" value={subtotal} onChange={setSubtotal} />
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Jumlah orang</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPeople((n) => Math.max(1, n - 1))} aria-label="Kurangi orang" className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-soft text-ink active:scale-95"><Minus className="h-5 w-5" /></button>
              <span className="grid h-12 flex-1 place-items-center rounded-2xl border border-rule bg-surface font-mono text-xl font-bold text-ink tabular-nums">{people}</span>
              <button type="button" onClick={() => setPeople((n) => Math.min(99, n + 1))} aria-label="Tambah orang" className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white active:scale-95"><Plus className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PercentField id="split-tax" label="Pajak (PB1)" value={tax} onChange={setTax} />
            <PercentField id="split-service" label="Servis" value={service} onChange={setService} />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Bulatkan per orang</p>
            <div className="grid grid-cols-4 gap-2">
              {[0, 500, 1000, 5000].map((step) => (
                <button key={step} type="button" onClick={() => setRounding(step)} className={cn("h-10 rounded-xl border text-xs font-bold transition", rounding === step ? "border-brand-600 bg-brand-600 text-white" : "border-rule bg-surface text-ink")}>{step ? `${step.toLocaleString("id-ID")}` : "Pas"}</button>
              ))}
            </div>
          </div>
        </>
      }
      result={
        <ResultPanel
          label="Bayar per orang"
          value={perPersonRounded}
          rows={[
            ["Subtotal", formatRupiah(subtotal)],
            [`Pajak ${tax}%`, formatRupiah(taxAmount)],
            [`Servis ${service}%`, formatRupiah(serviceAmount)],
            ["Total tagihan", formatRupiah(total)],
            ["Terkumpul", formatRupiah(perPersonRounded * people)],
            ["Lebih bayar (untuk tip/kembalian)", formatRupiah(Math.max(0, perPersonRounded * people - total))],
          ]}
          footer={<RecordButton amount={perPersonRounded} />}
        />
      }
    />
  );
}

/* ── 3. Diskon ──────────────────────────────────────────────────────── */

export function DiscountCalc() {
  const [price, setPrice] = React.useState(0);
  const [discount, setDiscount] = React.useState(20);
  const [extraDiscount, setExtraDiscount] = React.useState(0);
  const [cashback, setCashback] = React.useState(0);
  const afterFirst = price * (1 - discount / 100);
  const afterSecond = afterFirst * (1 - extraDiscount / 100);
  const finalPrice = Math.max(0, Math.round(afterSecond - cashback));
  const saved = price - finalPrice;
  const effective = price ? (saved / price) * 100 : 0;

  return (
    <ToolLayout
      form={
        <>
          <div><h2 className="text-base font-bold text-ink">Hitung diskon</h2><p className="text-xs text-ink-muted">Termasuk diskon bertingkat (mis. 50% + 20%) dan potongan nominal.</p></div>
          <MoneyField id="disc-price" label="Harga normal" value={price} onChange={setPrice} />
          <div className="grid grid-cols-2 gap-3">
            <PercentField id="disc-1" label="Diskon" value={discount} onChange={(v) => setDiscount(Math.min(100, v))} step={5} />
            <PercentField id="disc-2" label="Diskon tambahan" value={extraDiscount} onChange={(v) => setExtraDiscount(Math.min(100, v))} step={5} />
          </div>
          <MoneyField id="disc-cashback" label="Potongan / cashback nominal" value={cashback} onChange={setCashback} />
        </>
      }
      result={
        <ResultPanel
          label="Harga yang dibayar"
          value={finalPrice}
          rows={[
            ["Harga normal", formatRupiah(price)],
            ["Kamu hemat", formatRupiah(saved)],
            ["Diskon efektif", `${effective.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`],
          ]}
          footer={<RecordButton amount={finalPrice} />}
        />
      }
    />
  );
}

/* ── 4. Cicilan ─────────────────────────────────────────────────────── */

export function LoanCalc() {
  const [principal, setPrincipal] = React.useState(0);
  const [rate, setRate] = React.useState(12);
  const [months, setMonths] = React.useState(12);
  const [method, setMethod] = React.useState<"flat" | "anuitas">("flat");
  const result = installment(principal, rate, months, method);

  return (
    <ToolLayout
      form={
        <>
          <div><h2 className="text-base font-bold text-ink">Simulasi cicilan</h2><p className="text-xs text-ink-muted">Untuk kredit HP, motor, paylater, atau KTA.</p></div>
          <MoneyField id="loan-principal" label="Pokok pinjaman" value={principal} onChange={setPrincipal} />
          <div className="grid grid-cols-2 gap-3">
            <PercentField id="loan-rate" label="Bunga per tahun" value={rate} onChange={setRate} />
            <div>
              <label htmlFor="loan-months" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Tenor</label>
              <div className="flex items-center gap-2 rounded-[16px] border border-rule bg-surface px-3.5 focus-within:border-pine">
                <input id="loan-months" type="number" inputMode="numeric" min={1} max={360} value={months || ""} placeholder="12" data-search-input="true" onChange={(event) => setMonths(Math.max(0, Math.min(360, Number(event.target.value) || 0)))} className="h-12 min-w-0 flex-1 border-0 bg-transparent text-right font-mono text-lg font-bold tabular-nums text-ink outline-none" />
                <span className="text-sm font-semibold text-ink-muted">bln</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[3, 6, 12, 24, 36].map((tenor) => (
              <button key={tenor} type="button" onClick={() => setMonths(tenor)} className={cn("h-9 rounded-full border px-3 text-xs font-bold", months === tenor ? "border-brand-600 bg-brand-600 text-white" : "border-rule bg-surface text-ink")}>{tenor} bln</button>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Metode bunga</p>
            <div className="grid grid-cols-2 gap-2">
              {(["flat", "anuitas"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setMethod(option)} className={cn("rounded-2xl border p-3 text-left transition", method === option ? "border-brand-600 bg-brand-50" : "border-rule bg-surface")}>
                  <span className="block text-sm font-bold capitalize text-ink">{option}</span>
                  <span className="block text-[11px] text-ink-muted">{option === "flat" ? "Bunga tetap dari pokok awal (umum di leasing)" : "Bunga efektif menurun (umum di bank)"}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      }
      result={
        <ResultPanel
          label="Cicilan per bulan"
          value={result.monthly}
          rows={[
            ["Pokok", formatRupiah(principal)],
            ["Total bunga", formatRupiah(result.totalInterest)],
            ["Total dibayar", formatRupiah(result.total)],
          ]}
        />
      }
    />
  );
}

/* ── 5. Jatah harian sampai gajian ──────────────────────────────────── */

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function DailyAllowance() {
  const [funds, setFunds] = React.useState(0);
  const [reserved, setReserved] = React.useState(0);
  const [payday, setPayday] = React.useState(() => {
    const now = new Date();
    return toDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = payday ? new Date(`${payday}T00:00:00`) : today;
  const days = Math.max(1, Math.round((target.getTime() - today.getTime()) / 86_400_000));
  const usable = Math.max(0, funds - reserved);
  const perDay = Math.floor(usable / days);
  const perWeek = perDay * 7;

  return (
    <ToolLayout
      form={
        <>
          <div><h2 className="text-base font-bold text-ink">Jatah harian sampai gajian</h2><p className="text-xs text-ink-muted">Berapa yang boleh dipakai per hari supaya uang cukup sampai tanggal tertentu.</p></div>
          <MoneyField id="allow-funds" label="Uang yang tersedia sekarang" value={funds} onChange={setFunds} />
          <MoneyField id="allow-reserved" label="Sisihkan untuk tagihan / tabungan" value={reserved} onChange={setReserved} hint="Dikurangi dulu sebelum dibagi per hari." />
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Sampai tanggal (gajian berikutnya)</p>
            <DatePicker value={payday} onValueChange={setPayday} min={toDateInput(new Date(today.getTime() + 86_400_000))} ariaLabel="Tanggal gajian berikutnya" />
          </div>
        </>
      }
      result={
        <ResultPanel
          label={`Jatah per hari · ${days} hari lagi`}
          value={perDay}
          rows={[
            ["Bisa dipakai", formatRupiah(usable)],
            ["Setara per minggu", formatRupiah(perWeek)],
          ]}
          footer={
            <Link href="/anggaran" className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-bold text-white hover:bg-white/20">
              Jadikan anggaran harian <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      }
    />
  );
}
