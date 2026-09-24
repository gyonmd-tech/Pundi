"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChevronDown,
  CircleDollarSign,
  Goal,
  Layers3,
  Menu,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Catat dalam hitungan detik",
    description: "Form transaksi cepat, kategori visual, nominal instan, dan pilihan rekening dalam satu alur singkat.",
    icon: Zap,
    tone: "bg-pine text-white",
    size: "lg:col-span-7",
  },
  {
    title: "Anggaran yang mudah dipantau",
    description: "Lihat sisa alokasi dan peringatan sebelum pengeluaran melewati batas.",
    icon: PieChart,
    tone: "bg-brass-10 text-brass",
    size: "lg:col-span-5",
  },
  {
    title: "Grafik arus kas interaktif",
    description: "Bandingkan pemasukan dan pengeluaran enam bulan tanpa membuka spreadsheet.",
    icon: BarChart3,
    tone: "bg-sky-10 text-sky",
    size: "lg:col-span-4",
  },
  {
    title: "Target terasa lebih dekat",
    description: "Pantau progres dana darurat, liburan, atau pembelian besar dalam satu tempat.",
    icon: Goal,
    tone: "bg-mint-10 text-mint",
    size: "lg:col-span-4",
  },
  {
    title: "Satu pandangan untuk semua aset",
    description: "Satukan rekening, dompet digital, investasi, dan tujuan finansial.",
    icon: Layers3,
    tone: "bg-ember-10 text-ember",
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

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-44 -top-40 h-[34rem] w-[34rem] rounded-full bg-pine-20/60 blur-3xl" />
        <div className="absolute -right-44 top-48 h-[32rem] w-[32rem] rounded-full bg-sky-10 blur-3xl" />
      </div>

      <header className="glass-panel sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Pundi beranda">
            <div className="clay flex h-10 w-10 items-center justify-center bg-pine text-white shadow-none">
              <WalletCards size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold leading-none tracking-[-0.04em]">Pundi</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">Finance companion</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-small font-semibold text-ink-muted md:flex" aria-label="Navigasi utama">
            <Link href="#fitur" className="transition-colors hover:text-pine">Fitur</Link>
            <Link href="#cara-kerja" className="transition-colors hover:text-pine">Cara kerja</Link>
            <Link href="#keamanan" className="transition-colors hover:text-pine">Penyimpanan data</Link>
            <Link href="#faq" className="transition-colors hover:text-pine">FAQ</Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="material-button secondary text-small">Masuk</Link>
            <Link href="/signup" className="material-button text-small">
              Mulai gratis <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rule bg-white text-ink md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-rule bg-white/95 px-4 py-4 md:hidden">
            <nav className="grid gap-1 text-small font-semibold">
              {[
                ["#fitur", "Fitur"],
                ["#cara-kerja", "Cara kerja"],
                ["#keamanan", "Penyimpanan data"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 hover:bg-pine-10">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-rule pt-3">
              <Link href="/login" className="material-button secondary text-small">Masuk</Link>
              <Link href="/signup" className="material-button text-small">Mulai gratis</Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative mx-auto grid max-w-[90rem] items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-12 lg:px-8 lg:pb-28">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pine/15 bg-white/75 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-pine shadow-card backdrop-blur">
            <Sparkles size={14} />
            Keuangan harian, dibuat lebih tenang
          </div>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.7rem,7vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.07em]">
            Uangmu lebih mudah <span className="text-pine">dipahami.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
            Catat pengeluaran, atur anggaran, dan lihat arah keuanganmu dari satu dashboard yang terasa ringan setiap hari.
          </p>
          <div className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="material-button flex-1">
              Mulai kelola uang <ArrowRight size={17} />
            </Link>
            <Link href="/dashboard" className="material-button secondary flex-1">
              Jelajahi demo
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-ink-muted">
            {["Tanpa kartu kredit", "Data demo siap pakai", "Responsif di ponsel"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check size={14} className="text-mint" /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="clay relative mx-auto max-w-2xl p-3 sm:p-5">
            <div className="rounded-[1.25rem] border border-white/80 bg-white p-4 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Ringkasan · {monthLabel}</p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em]">Kondisi finansialmu</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pine text-white shadow-card">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-ink p-4 text-white sm:col-span-2">
                  <p className="text-xs font-semibold text-white/60">Total saldo</p>
                  <p className="mt-2 font-mono text-2xl font-medium tracking-[-0.05em]">Rp24.849.500</p>
                  <span className="mt-4 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80">+8,2% bulan ini</span>
                </div>
                <div className="rounded-2xl bg-mint-10 p-4">
                  <p className="text-xs font-semibold text-ink-muted">Rasio tabungan</p>
                  <p className="mt-2 font-mono text-2xl font-medium text-mint">32,4%</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-[64%] rounded-full bg-mint" />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-5">
                <div className="rounded-2xl bg-surface-soft p-4 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">Arus kas</p>
                    <p className="text-[10px] font-bold text-ink-muted">6 bulan</p>
                  </div>
                  <div className="mt-5 flex h-28 items-end gap-2">
                    {[45, 58, 48, 76, 62, 88].map((height, index) => (
                      <div key={height + index} className="flex h-full flex-1 items-end gap-1">
                        <div className="w-1/2 rounded-t-lg bg-pine" style={{ height: `${height}%` }} />
                        <div className="w-1/2 rounded-t-lg bg-ember/65" style={{ height: `${Math.max(25, height - 24)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-brass-10 p-4 md:col-span-2">
                  <p className="text-xs font-bold text-ink">Anggaran makan</p>
                  <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-card ring-[10px] ring-brass/25">
                    <div className="text-center">
                      <p className="font-mono text-xl font-medium">68%</p>
                      <p className="text-[9px] font-bold text-ink-muted">terpakai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="clay absolute -bottom-7 -left-3 hidden items-center gap-3 px-4 py-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-10 text-mint">
              <CircleDollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-muted">Hemat minggu ini</p>
              <p className="font-mono text-small font-medium text-ink">Rp387.500</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="relative border-y border-rule/70 bg-white/55 py-20 backdrop-blur-sm sm:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Semua yang kamu butuhkan</p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-tight tracking-[-0.06em]">
              Satu ruang untuk keputusan yang lebih baik.
            </h2>
            <p className="mt-4 text-ink-muted">Setiap modul saling terhubung, jadi angka harian langsung menjadi gambaran yang berguna.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className={`card min-h-64 ${feature.size} ${index === 0 ? "bg-ink text-white" : ""}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-card ${feature.tone}`}>
                    <Icon size={21} />
                  </div>
                  <div className="mt-10 max-w-xl">
                    <h3 className={`text-2xl font-extrabold tracking-[-0.04em] ${index === 0 ? "text-white" : "text-ink"}`}>{feature.title}</h3>
                    <p className={`mt-3 max-w-lg leading-7 ${index === 0 ? "text-white/65" : "text-ink-muted"}`}>{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow">Ritme sederhana</p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight tracking-[-0.06em]">Tiga langkah, lalu biarkan datanya bekerja.</h2>
            <p className="mt-5 leading-7 text-ink-muted">Pundi dirancang untuk kebiasaan kecil yang bisa dipertahankan, bukan sesi administrasi yang melelahkan.</p>
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {[
              ["01", "Catat transaksi", "Pilih jenis, masukkan nominal, rekening, dan kategori."],
              ["02", "Pantau batas", "Pundi memperbarui arus kas serta progres anggaran."],
              ["03", "Ambil keputusan", "Gunakan tren dan insight untuk mengatur langkah berikutnya."],
            ].map(([number, title, description]) => (
              <div key={number} className="card flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pine-10 font-mono text-small font-medium text-pine">{number}</span>
                <div>
                  <h3 className="font-extrabold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1 text-small leading-6 text-ink-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="keamanan" className="relative mx-auto max-w-[90rem] px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck size={23} />
              </div>
              <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/55">Penyimpanan data yang jelas</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">Coba dengan data demo. Beralih ke cloud saat siap.</h2>
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
                  <div key={label as string} className="flex items-center gap-3 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <ItemIcon size={18} className="text-pine-40" />
                    <span className="text-small font-semibold text-white/80">{label as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-rule/70 bg-white/55 py-20 backdrop-blur-sm sm:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="eyebrow">Pertanyaan umum</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.06em]">Sebelum mulai.</h2>
            <p className="mt-4 max-w-md leading-7 text-ink-muted">Hal penting tentang mode demo, akun riil, ekspor, dan pengalaman mobile.</p>
          </div>
          <div className="space-y-3 lg:col-span-7">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.question} className="card !p-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-ink">{faq.question}</span>
                    <ChevronDown size={18} className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <p className="border-t border-rule px-5 py-5 text-small leading-7 text-ink-muted">{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <div className="clay mx-auto max-w-4xl px-6 py-14 sm:px-12">
          <p className="eyebrow">Siap memulai?</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-[clamp(2rem,5vw,4rem)] font-extrabold leading-tight tracking-[-0.065em]">Beri setiap rupiah tempat dan tujuan.</h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-ink-muted">Mulai dengan mode demo, lalu buat akun saat kamu siap menyimpan data sendiri.</p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="material-button flex-1">Buat akun gratis <ArrowRight size={16} /></Link>
            <Link href="/dashboard" className="material-button secondary flex-1">Buka demo</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-rule bg-white/70">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 px-4 py-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-ink">
            <WalletCards size={16} className="text-pine" /> Pundi
          </div>
          <p>© {new Date().getFullYear()} Pundi. Dibuat untuk keputusan finansial yang lebih jernih.</p>
          <div className="flex gap-4 font-semibold">
            <Link href="/login" className="hover:text-pine">Masuk</Link>
            <Link href="/signup" className="hover:text-pine">Daftar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
