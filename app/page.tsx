"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  ChevronDown,
  CircleDollarSign,
  Layers3,
  Menu,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LandingVideo } from "@/components/landing/LandingVideo";
import { PenjagaShowcase } from "@/components/landing/PenjagaShowcase";

const features = [
  {
    title: "Pulihkan saldo saat catatan tertinggal",
    description: "Masukkan saldo nyata pada tanggal yang kamu ingat. Pundi membuat penyesuaian tanpa mencampurkannya ke grafik pemasukan atau pengeluaran.",
    icon: Zap,
    size: "lg:col-span-7",
  },
  {
    title: "Transfer dan tarik tunai tercatat dua sisi",
    description: "Saldo rekening asal dan tujuan diperbarui bersama, termasuk perpindahan uang dari bank ke dompet cash.",
    icon: WalletCards,
    size: "lg:col-span-5",
  },
  {
    title: "Utang dan piutang ikut terbaca",
    description: "Catat siapa, jatuh tempo, cicilan, dan sisa kewajiban agar arus kas tidak terlihat lebih longgar dari kondisi sebenarnya.",
    icon: CircleDollarSign,
    size: "lg:col-span-4",
  },
  {
    title: "Tanggal transaksi dan tanggal catat tetap jelas",
    description: "Koreksi catatan lama tanpa kehilangan konteks kapan transaksi terjadi dan kapan datanya dimasukkan.",
    icon: BellRing,
    size: "lg:col-span-4",
  },
  {
    title: "Dashboard menjadi ruang kerja milikmu",
    description: "Tarik kartu seperti puzzle, susun grafik yang paling sering dilihat, lalu Pundi mengingat tata letaknya di perangkatmu.",
    icon: Layers3,
    size: "lg:col-span-4",
  },
];

const faqs = [
  {
    question: "Apakah saya bisa mencoba tanpa membuat akun?",
    answer: "Bisa. Mode demo berisi data contoh yang berjalan lokal di sesi browser, jadi kamu dapat menjelajahi seluruh alur terlebih dahulu.",
  },
  {
    question: "Apa yang terjadi setelah saya membuat akun?",
    answer: "Akun riil memakai Appwrite untuk autentikasi dan penyimpanan data. Rekening awal dan kategori standar disiapkan otomatis.",
  },
  {
    question: "Bisakah transaksi diekspor?",
    answer: "Ya. Buku transaksi menyediakan ekspor CSV dan Excel agar data mudah diarsipkan atau dianalisis lebih lanjut.",
  },
  {
    question: "Apakah nyaman dipakai dari ponsel?",
    answer: "Ya. Pundi memakai navigasi bawah, modal berbentuk bottom sheet, dan layout bento yang menumpuk rapi pada layar kecil.",
  },
];

const trustStrip = ["Tanpa kartu kredit", "Mode demo siap pakai", "Data privat per pengguna"];

const footerColumns = [
  { title: "Produk", links: [["#fitur", "Fitur"], ["#cara-kerja", "Cara kerja"], ["/dashboard", "Demo dashboard"]] },
  { title: "Akun", links: [["/login", "Masuk"], ["/signup", "Daftar"]] },
  { title: "Info", links: [["#keamanan", "Penyimpanan data"], ["#faq", "FAQ"]] },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 [background-image:radial-gradient(circle,var(--color-rule)_1px,transparent_1px)] [background-size:34px_34px] opacity-50" />
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,var(--color-brand-100),transparent_70%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Pundi beranda">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine text-white">
              <WalletCards size={18} />
            </div>
            <p className="text-[17px] font-extrabold leading-none tracking-[-0.03em]">Pundi</p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-muted md:flex" aria-label="Navigasi utama">
            <Link href="#penjaga" className="transition-colors hover:text-ink">Penjaga</Link>
            <Link href="#fitur" className="transition-colors hover:text-ink">Fitur</Link>
            <Link href="#cara-kerja" className="transition-colors hover:text-ink">Cara kerja</Link>
            <Link href="#keamanan" className="transition-colors hover:text-ink">Penyimpanan data</Link>
            <Link href="#faq" className="transition-colors hover:text-ink">FAQ</Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login"><Button type="button" variant="ghost" size="sm">Masuk</Button></Link>
            <Link href="/signup"><Button type="button" size="sm">Mulai gratis <ArrowRight size={15} /></Button></Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rule text-ink md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-rule bg-paper px-4 py-4 md:hidden">
            <nav className="grid gap-1 text-sm font-semibold">
              {[
                ["#penjaga", "Penjaga"],
                ["#fitur", "Fitur"],
                ["#cara-kerja", "Cara kerja"],
                ["#keamanan", "Penyimpanan data"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 hover:bg-surface-high">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-rule pt-3">
              <Link href="/login"><Button type="button" variant="outline" className="w-full">Masuk</Button></Link>
              <Link href="/signup"><Button type="button" className="w-full">Mulai gratis</Button></Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative mx-auto max-w-[80rem] px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-rule bg-surface-high px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          <Sparkles size={13} className="text-pine" />
          Baru · Penjaga bertenaga Hermes Agent
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
          Ceritakan harimu. <span className="text-brand-600">Penjaga yang mencatat.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          Pundi menyatukan transaksi, transfer, cash, utang, dan anggaran ke satu buku — kini dijaga Hermes Agent yang mengubah ceritamu jadi catatan rapi. Pencatatan manual tetap ada kapan pun kamu mau.
        </p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup" className="flex-1"><Button type="button" size="lg" className="w-full">Mulai kelola uang <ArrowRight size={17} /></Button></Link>
          <Link href="/dashboard" className="flex-1"><Button type="button" variant="outline" size="lg" className="w-full">Jelajahi demo</Button></Link>
        </div>
        <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-ink-muted">
          {trustStrip.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check size={14} className="text-mint" /> {item}
            </span>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl sm:mt-14">
          <div aria-hidden className="absolute -inset-x-10 -bottom-10 top-10 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(36,89,222,.22),transparent_70%)] blur-2xl" />
          <LandingVideo />
        </div>
      </section>

      <PenjagaShowcase />

      <section id="fitur" className="relative mx-auto max-w-[80rem] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-pine">Semua yang kamu butuhkan</p>
          <h2 className="mt-3 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-tight tracking-[-0.045em]">
            Satu ruang untuk keputusan yang lebih baik.
          </h2>
          <p className="mt-4 text-ink-muted">Setiap modul saling terhubung, jadi angka harian langsung menjadi gambaran yang berguna.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className={`min-h-56 rounded-2xl border border-rule bg-surface-high p-6 transition-colors hover:border-brand-300 sm:p-7 ${feature.size}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-10 text-pine">
                  <Icon size={19} />
                </div>
                <div className="mt-8 max-w-xl">
                  <h3 className="text-xl font-extrabold tracking-[-0.03em] text-ink">{feature.title}</h3>
                  <p className="mt-2.5 max-w-lg text-sm leading-6 text-ink-muted">{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="cara-kerja" className="relative border-y border-rule bg-surface-soft py-20 sm:py-28">
        <div className="mx-auto grid max-w-[80rem] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-pine">Ritme sederhana</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-tight tracking-[-0.045em]">Tiga langkah, lalu biarkan datanya bekerja.</h2>
            <p className="mt-4 leading-7 text-ink-muted">Pundi dirancang untuk kebiasaan kecil yang bisa dipertahankan, bukan sesi administrasi yang melelahkan.</p>
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {[
              ["01", "Catat kejadian uang", "Pilih keluar, masuk, transfer, tarik tunai, atau kondisi saldo."],
              ["02", "Saldo diperbarui otomatis", "Setiap transaksi mengubah rekening yang tepat dan menjaga riwayatnya."],
              ["03", "Baca pola, lalu bertindak", "Grafik, anggaran, utang, dan insight memakai data yang sama."],
            ].map(([number, title, description]) => (
              <div key={number} className="flex items-start gap-4 rounded-2xl border border-rule bg-surface-high p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine-10 font-mono text-sm font-bold text-pine">{number}</span>
                <div>
                  <h3 className="font-extrabold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="keamanan" className="relative mx-auto max-w-[80rem] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="overflow-hidden rounded-[1.75rem] bg-brand-900 p-6 text-white sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck size={21} />
              </div>
              <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/55">Penyimpanan data yang jelas</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Coba dengan data demo. Beralih ke cloud saat siap.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/65">
                Mode demo berjalan dengan data contoh di browser. Setelah masuk dengan akun riil, autentikasi dan data aplikasi dikelola melalui Appwrite.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {[
                [WalletCards, "Sesi akun memakai cookie HTTP-only"],
                [BellRing, "Status insight tersimpan per pengguna"],
                [ShieldCheck, "Server memeriksa identitas pada setiap action"],
              ].map(([Icon, label]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return (
                  <div key={label as string} className="flex items-center gap-3 rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
                    <ItemIcon size={17} className="text-pine-40" />
                    <span className="text-sm font-semibold text-white/80">{label as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-rule bg-surface-soft py-20 sm:py-28">
        <div className="mx-auto grid max-w-[80rem] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-pine">Pertanyaan umum</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.045em]">Sebelum mulai.</h2>
            <p className="mt-4 max-w-md leading-7 text-ink-muted">Hal penting tentang mode demo, akun riil, ekspor, dan pengalaman mobile.</p>
          </div>
          <div className="space-y-3 lg:col-span-7">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.question} className="overflow-hidden rounded-2xl border border-rule bg-surface-high">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-ink">{faq.question}</span>
                    <ChevronDown size={18} className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <p className="border-t border-rule px-5 py-5 text-sm leading-7 text-ink-muted">{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[80rem] px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-rule bg-surface-high px-6 py-14 sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-pine">Siap memulai?</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-[clamp(1.9rem,4.5vw,3.25rem)] font-extrabold leading-tight tracking-[-0.045em]">Beri setiap rupiah tempat dan tujuan.</h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-ink-muted">Mulai dengan mode demo, lalu buat akun saat kamu siap menyimpan data sendiri.</p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="flex-1"><Button type="button" size="lg" className="w-full">Buat akun gratis <ArrowRight size={16} /></Button></Link>
            <Link href="/dashboard" className="flex-1"><Button type="button" variant="outline" size="lg" className="w-full">Buka demo</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-rule bg-paper">
        <div className="mx-auto max-w-[80rem] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine text-white">
                  <WalletCards size={16} />
                </div>
                <p className="text-base font-extrabold tracking-[-0.03em]">Pundi</p>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-ink-muted">Dibuat untuk keputusan finansial yang lebih jernih, satu transaksi pada satu waktu.</p>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{column.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="text-sm font-medium text-ink transition-colors hover:text-pine">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Pundi. Semua hak dilindungi.</p>
            <p>Dibuat untuk keuangan harian yang lebih tenang.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
