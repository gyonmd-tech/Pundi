"use client";

import { useEffect, useState } from "react";
import { KeyRound, MessagesSquare, Sparkles } from "lucide-react";
import { PenjagaCharacter } from "@/components/penjaga/PenjagaCharacter";
import type { PenjagaMood } from "@/lib/penjaga/types";

const CYCLE: { mood: PenjagaMood; line: string }[] = [
  { mood: "idle", line: "Hai! Hari ini habis berapa?" },
  { mood: "thinking", line: "Sebentar, aku pilah ceritamu…" },
  { mood: "talking", line: "Ketemu 3 catatan. Cek dulu ya." },
  { mood: "happy", line: "Tersimpan! Saldo sudah kuperbarui." },
];

const POINTS = [
  {
    icon: MessagesSquare,
    title: "Cerita jadi catatan",
    body: "“Sarapan 15rb, bensin 30rb pakai cash” — Penjaga memecahnya per transaksi lengkap dengan rekening dan kategori.",
  },
  {
    icon: Sparkles,
    title: "Dari mana saja",
    body: "Ngobrol lewat Telegram, WhatsApp, atau CLI Hermes Agent milikmu — atau langsung dari panel Penjaga di aplikasi.",
  },
  {
    icon: KeyRound,
    title: "Kunci tetap di tanganmu",
    body: "Semua masuk sebagai draft sampai kamu setujui. Token akses bisa dicabut kapan saja, dan pencatatan manual tetap tersedia.",
  },
];

export function PenjagaShowcase() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((value) => (value + 1) % CYCLE.length), 2600);
    return () => clearInterval(timer);
  }, []);
  const current = CYCLE[step];

  return (
    <section id="penjaga" className="relative mx-auto max-w-[80rem] scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#112772_0%,#1D48B5_55%,#2860E6_100%)] px-6 pb-8 pt-10 text-white shadow-float lg:col-span-6">
          <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[.07]" />
          <div aria-hidden className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-brand-400/25 blur-3xl" />
          <div className="relative mx-auto flex max-w-sm flex-col items-center">
            <p key={step} className="animate-in fade-in slide-in-from-bottom-2 rounded-[18px] rounded-bl-[6px] bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 shadow-card" aria-live="polite">
              {current.line}
            </p>
            <PenjagaCharacter mood={current.mood} size={220} className="mt-3" />
            <div className="mt-2 flex gap-1.5" aria-hidden>
              {CYCLE.map((item, index) => (
                <span key={item.mood} className={`h-1.5 rounded-full transition-all duration-300 ${index === step ? "w-6 bg-white" : "w-1.5 bg-white/35"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-pine">Penjaga · Hermes Agent</p>
          <h2 className="mt-3 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-tight tracking-[-0.045em]">
            Ruang keuanganmu kini punya penjaga.
          </h2>
          <p className="mt-4 leading-7 text-ink-muted">
            Hubungkan Hermes Agent ke Pundi lewat MCP. Ia membaca rekening dan kategorimu, menyusun catatan dari ceritamu, dan menunggu persetujuanmu sebelum menyentuh saldo.
          </p>
          <div className="mt-8 grid gap-3">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-rule bg-surface-high p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine-10 text-pine"><Icon size={19} /></span>
                <div>
                  <h3 className="font-extrabold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
