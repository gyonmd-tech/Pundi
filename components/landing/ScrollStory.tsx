"use client";

/**
 * components/landing/ScrollStory.tsx
 * Storyboard landing yang berjalan mengikuti scroll (ADR-003). Section
 * setinggi 4 layar dengan panggung sticky; progres tiap babak (--a0..--a3)
 * menggerakkan elemen lewat calc() — hanya transform/opacity, tanpa
 * re-render per frame. Babak:
 *   0 Ceritakan → 1 Penjaga menyusun → 2 Kamu setujui → 3 Dashboard rapi
 */
import { useCallback, useRef, type CSSProperties } from "react";
import { PenjagaCharacter } from "@/components/penjaga/PenjagaCharacter";
import type { PenjagaMood } from "@/lib/penjaga/types";
import { cn } from "@/lib/utils/cn";
import { useScrollStory } from "./motion";

const ACTS: { title: string; body: string; mood: PenjagaMood }[] = [
  { title: "Ceritakan harimu", body: "Tulis seperti chat ke teman — dari web, aplikasi, atau Hermes di Telegram.", mood: "idle" },
  { title: "Penjaga menyusun catatannya", body: "Nominal, rekening, dan kategori dipilah otomatis menjadi draft yang rapi.", mood: "thinking" },
  { title: "Kamu yang menyetujui", body: "Saldo tidak berubah sebelum kamu menekan Simpan. Kunci tetap di tanganmu.", mood: "happy" },
  { title: "Dashboard langsung rapi", body: "Saldo, anggaran, dan grafik ikut diperbarui — tanpa input manual satu per satu.", mood: "happy" },
];

const STORY = "Hari ini sarapan bubur 15rb, makan siang soto 25rb, terus isi bensin 30rb pakai cash.";
const DRAFTS = [
  { note: "Sarapan bubur", meta: "Makan & Minum · Tunai", amount: "Rp 15.000" },
  { note: "Makan siang soto", meta: "Makan & Minum · Tunai", amount: "Rp 25.000" },
  { note: "Isi bensin", meta: "Transportasi · Tunai", amount: "Rp 30.000" },
];
const BUDGETS = [
  { name: "Makan & Minum", value: 58, color: "#2459DE" },
  { name: "Transportasi", value: 36, color: "#159B78" },
  { name: "Belanja", value: 82, color: "#D99418" },
];

/** Progres bertahap item ke-i di dalam babak (0..1), sebagai ekspresi CSS. */
const stagger = (act: number, index: number, step = 0.18, span = 0.42) =>
  `clamp(0, calc((var(--a${act}) - ${index * step}) / ${span}), 1)`;

type Vars = CSSProperties & Record<`--${string}`, string>;

export function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const balanceRef = useRef<HTMLSpanElement>(null);

  const onFrame = useCallback((progress: number) => {
    const local = Math.min(1, Math.max(0, progress * 4 - 3));
    const eased = 1 - Math.pow(1 - local, 3);
    if (balanceRef.current) balanceRef.current.textContent = Math.round(24_849_500 * eased).toLocaleString("id-ID");
  }, []);
  const act = useScrollStory(sectionRef, ACTS.length, onFrame);

  return (
    <section
      ref={sectionRef}
      id="cara-kerja"
      aria-label="Cara kerja Pundi"
      className="relative h-[420svh] bg-[radial-gradient(ellipse_70%_50%_at_70%_40%,rgba(92,143,242,.14),transparent_70%)]"
      style={{ "--p": "0", "--a0": "0", "--a1": "0", "--a2": "0", "--a3": "0" } as Vars}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[80rem] items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8">
          {/* Teks babak */}
          <div className="order-2 lg:order-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-600">Cara kerja</p>
            <ol className="mt-3 space-y-1 lg:mt-6 lg:space-y-3">
              {ACTS.map((item, index) => {
                const active = index === act;
                return (
                  <li
                    key={item.title}
                    className={cn(
                      "transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
                      active ? "opacity-100" : "hidden opacity-35 lg:block",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className={cn(
                        "mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black transition-colors duration-500 lg:grid",
                        active ? "bg-brand-600 text-white" : "bg-surface-high text-ink-muted",
                      )}>{index + 1}</span>
                      <div>
                        <h3 className={cn("font-display font-black tracking-[-0.03em] text-ink transition-all duration-500", active ? "text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.05]" : "text-xl")}>
                          {item.title}
                        </h3>
                        <p className={cn("mt-2 max-w-md text-[15px] leading-7 text-ink-muted transition-all duration-500", active ? "opacity-100" : "hidden")}>{item.body}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {/* Progres */}
            <div className="mt-6 flex gap-1.5 lg:mt-10">
              {ACTS.map((item, index) => (
                <span key={item.title} className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-600/12">
                  <span className="block h-full origin-left rounded-full bg-brand-600" style={{ transform: `scaleX(var(--a${index}))` }} />
                </span>
              ))}
            </div>
          </div>

          {/* Panggung: mockup ponsel */}
          <div className="order-1 mx-auto lg:order-2">
            <div className="relative h-[min(58svh,640px)] aspect-[9/18.5] rounded-[2.6rem] border-[10px] border-[#0F1B3D] bg-paper shadow-[0_40px_90px_rgba(17,39,114,.35)]">
              <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0F1B3D]" />
              <div className="relative h-full overflow-hidden rounded-[1.9rem] bg-paper">
                {/* Kepala aplikasi */}
                <div className="flex items-center gap-2 bg-[linear-gradient(135deg,#112772,#2860E6)] px-4 pb-3 pt-9 text-white">
                  <PenjagaCharacter mood={ACTS[act].mood} size={42} grounded={false} title="" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-brand-200">Penjaga Pundi</p>
                    <p className="truncate text-sm font-black">{act < 3 ? "Hermes" : "Dashboard"}</p>
                  </div>
                </div>

                {/* Babak 0–2: chat & draft */}
                <div
                  className="absolute inset-x-0 bottom-0 top-[5.2rem] space-y-3 p-3 transition-opacity duration-500"
                  style={{ opacity: act < 3 ? 1 : 0 }}
                >
                  <div className="ml-auto max-w-[88%] rounded-[16px] rounded-br-[5px] bg-brand-600 px-3 py-2 text-[12px] leading-snug text-white shadow-card">
                    <span className="block" style={{ clipPath: `inset(0 calc((1 - var(--a0)) * 100%) 0 0)` }}>{STORY}</span>
                  </div>
                  <div className="space-y-2">
                    {DRAFTS.map((draft, index) => (
                      <div
                        key={draft.note}
                        className="flex items-center gap-2.5 rounded-[14px] border border-rule bg-surface-high p-2.5 shadow-card"
                        style={{
                          opacity: stagger(1, index),
                          transform: `translateX(calc((1 - ${stagger(1, index)}) * 28px))`,
                        }}
                      >
                        <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-ember-10 text-[13px] text-ember-ink">
                          ↗
                          <span
                            className="absolute inset-0 grid place-items-center bg-mint text-white"
                            style={{ opacity: stagger(2, index, 0.15, 0.3), transform: `scale(${stagger(2, index, 0.15, 0.3)})` }}
                          >✓</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-bold text-ink">{draft.note}</span>
                          <span className="block truncate text-[10px] text-ink-muted">{draft.meta}</span>
                        </span>
                        <span className="text-[12px] font-bold tabular-nums text-ink">{draft.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="grid h-10 place-items-center rounded-[13px] text-[13px] font-bold text-white shadow-card transition-colors duration-300"
                    style={{
                      opacity: `clamp(0, calc(var(--a1) * 3 - 2), 1)`,
                      background: act >= 2 ? "var(--color-mint)" : "var(--color-brand-600)",
                      transform: `scale(calc(1 - ${stagger(2, 0, 0, 0.25)} * 0.04))`,
                    }}
                  >
                    {act >= 2 ? "✓ 3 transaksi tersimpan" : "Simpan semua"}
                  </div>
                </div>

                {/* Babak 3: dashboard */}
                <div
                  className="absolute inset-x-0 bottom-0 top-[5.2rem] space-y-3 p-3 transition-opacity duration-500"
                  style={{ opacity: act === 3 ? 1 : 0 }}
                  aria-hidden={act !== 3}
                >
                  <div className="rounded-[16px] bg-[linear-gradient(135deg,#1D48B5,#2860E6)] p-3 text-white shadow-card">
                    <p className="text-[10px] font-semibold text-white/70">Total saldo</p>
                    <p className="text-lg font-black tabular-nums">Rp <span ref={balanceRef}>0</span></p>
                    <svg viewBox="0 0 200 50" className="mt-1 h-12 w-full overflow-visible" preserveAspectRatio="none">
                      <path
                        d="M0 42 C30 40 40 26 70 30 S120 42 140 26 S180 8 200 6"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 1"
                        style={{ strokeDashoffset: `calc(1 - var(--a3))` }}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2.5 rounded-[16px] border border-rule bg-surface-high p-3 shadow-card">
                    <p className="text-[12px] font-bold text-ink">Anggaran Oktober</p>
                    {BUDGETS.map((budget, index) => (
                      <div key={budget.name}>
                        <div className="flex justify-between text-[10px] font-semibold text-ink-muted"><span>{budget.name}</span><span>{budget.value}%</span></div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-600/10">
                          <div className="h-full origin-left rounded-full" style={{ width: `${budget.value}%`, background: budget.color, transform: `scaleX(${stagger(3, index, 0.12, 0.5)})` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
