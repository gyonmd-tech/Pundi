/**
 * app/page.tsx — Landing page Pundi (versi ringan).
 *
 * Sengaja dibuat sebagai Server Component statis: tanpa video, tanpa animasi
 * scroll, tanpa JavaScript di sisi klien. Hanya HTML + CSS + logo SVG kecil,
 * sehingga cepat dimuat di jaringan seluler.
 *
 * Catatan: pengunjung dari perangkat mobile tidak melihat halaman ini —
 * proxy.ts langsung mengarahkan mereka ke /login (atau /dashboard bila sudah
 * punya sesi). Tambahkan `?web=1` untuk tetap membukanya dari ponsel.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Pundi — Keuangan pribadi yang rapi" },
};

const features = [
  { icon: WalletCards, title: "Semua rekening", body: "Bank, e-wallet, dan cash dalam satu saldo. Transfer tercatat di dua sisi." },
  { icon: PiggyBank, title: "Anggaran", body: "Batas harian, mingguan, atau bulanan — sisa aman dihitung otomatis." },
  { icon: CircleDollarSign, title: "Utang & piutang", body: "Jatuh tempo dan sisa cicilan ikut terbaca di arus kas." },
  { icon: Target, title: "Tujuan", body: "Pantau progres tabungan untuk setiap target." },
  { icon: Sparkles, title: "Penjaga", body: "Ceritakan pengeluaranmu, Penjaga menyusun draft transaksinya." },
  { icon: ShieldCheck, title: "Data privat", body: "Data tersimpan per akun. Tidak ada yang berubah tanpa persetujuanmu." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Pundi beranda" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG kecil, tidak perlu optimasi */}
          <img src="/PUNDI-brand-assets/pundi-logo.svg" alt="Pundi" width={104} height={32} className="theme-light-only h-8 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/PUNDI-brand-assets/pundi-logo-white.svg" alt="Pundi" width={104} height={32} className="theme-dark-only h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/login" className="rounded-full px-4 py-2 hover:bg-surface-high">Masuk</Link>
          <Link href="/signup" className="rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Daftar</Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 md:grid-cols-2 md:pt-16">
          <div>
            <p className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">Gratis · Bisa dipasang di ponsel</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Semua arus uangmu, di satu tempat yang rapi.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Catat transaksi, atur anggaran, dan pantau saldo semua rekening tanpa ribet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700">
                Mulai gratis <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center rounded-full border border-rule bg-surface-high px-6 text-sm font-bold hover:border-rule-strong">
                Coba mode demo
              </Link>
            </div>
          </div>

          {/* Pratinjau ringkas — murni HTML/CSS, tanpa gambar */}
          <div aria-hidden className="mx-auto w-full max-w-sm rounded-3xl border border-rule bg-surface-high p-5 shadow-card">
            <div className="rounded-2xl bg-brand-600 p-5 text-white">
              <p className="text-xs font-semibold opacity-80">Total saldo</p>
              <p className="mt-1 font-display text-3xl font-extrabold">Rp12.480.000</p>
              <p className="mt-3 text-xs opacity-80">Aman dibelanjakan hari ini · Rp185.000</p>
            </div>
            <ul className="mt-4 divide-y divide-rule text-sm">
              {[
                ["Gaji bulanan", "+Rp8.500.000", "text-mint-ink"],
                ["Makan siang", "−Rp35.000", "text-ember-ink"],
                ["Bensin", "−Rp30.000", "text-ember-ink"],
              ].map(([label, amount, tone]) => (
                <li key={label} className="flex items-center justify-between py-3">
                  <span className="font-semibold">{label}</span>
                  <span className={`font-bold ${tone}`}>{amount}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <div className="flex justify-between text-xs font-semibold text-ink-muted"><span>Anggaran makan</span><span>62%</span></div>
              <div className="mt-2 h-2 rounded-full bg-brand-100"><div className="h-2 w-[62%] rounded-full bg-brand-600" /></div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Yang kamu dapatkan</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-rule bg-surface-high p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon size={20} aria-hidden /></span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-brand-950 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Siap merapikan keuanganmu?</h2>
              <p className="mt-1 text-sm text-white/80">Daftar dalam satu menit, atau jelajahi dulu lewat mode demo.</p>
            </div>
            <Link href="/signup" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-brand-950">
              Buat akun <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:px-6">
          <span>© {new Date().getFullYear()} Pundi</span>
          <span className="flex gap-4">
            <Link href="/login" className="hover:text-ink">Masuk</Link>
            <Link href="/signup" className="hover:text-ink">Daftar</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
