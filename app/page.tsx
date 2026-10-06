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
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Pulihkan saldo saat catatan tertinggal",
    description: "Masukkan saldo nyata pada tanggal yang kamu ingat. Pundi membuat penyesuaian tanpa mencampurkannya ke grafik pemasukan atau pengeluaran.",
    icon: Zap,
    tone: "bg-brand-600 text-white",
    size: "lg:col-span-7",
  },
  {
    title: "Transfer dan tarik tunai tercatat dua sisi",
    description: "Saldo rekening asal dan tujuan diperbarui bersama, termasuk perpindahan uang dari bank ke dompet cash.",
    icon: WalletCards,
    tone: "bg-cyan text-white",
    size: "lg:col-span-5",
  },
  {
    title: "Utang dan piutang ikut terbaca",
    description: "Catat siapa, jatuh tempo, cicilan, dan sisa kewajiban agar arus kas tidak terlihat lebih longgar dari kondisi sebenarnya.",
    icon: CircleDollarSign,
    tone: "bg-ember text-white",
    size: "lg:col-span-4",
  },
  {
    title: "Tanggal transaksi dan tanggal catat tetap jelas",
    description: "Koreksi catatan lama tanpa kehilangan konteks kapan transaksi terjadi dan kapan datanya dimasukkan.",
    icon: BellRing,
    tone: "bg-brass text-white",
    size: "lg:col-span-4",
  },
  {
    title: "Dashboard menjadi ruang kerja milikmu",
    description: "Tarik kartu seperti puzzle, susun grafik yang paling sering dilihat, lalu Pundi mengingat tata letaknya di perangkatmu.",
    icon: Layers3,
    tone: "bg-lavender text-white",
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
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,var(--color-brand-100)_0,transparent_34%),radial-gradient(circle_at_92%_20%,var(--color-mint-10)_0,transparent_30%),radial-gradient(circle_at_50%_78%,var(--color-brass-10)_0,transparent_32%)]" />
      </div>

      <header className="sticky top-0 z-50 border-x-0 border-t-0 border-b border-rule bg-surface/95 shadow-clay-soft backdrop-blur-xl">
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
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-ink shadow-clay-soft md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-rule bg-surface px-4 py-4 md:hidden">
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
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand-700 shadow-clay-soft">
            <Sparkles size={14} />
            Keuangan harian, dibuat lebih tenang
          </div>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.7rem,7vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.07em]">
            Catatan keuangan yang tetap <span className="text-brand-600">nyambung dengan saldo nyata.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
            Pundi menyatukan transaksi, transfer, cash, utang, anggaran, dan koreksi saldo ke satu buku yang dapat kamu periksa kembali kapan saja.
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
            <div className="rounded-[1.25rem] border border-rule bg-surface-high p-4 shadow-clay-soft sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Contoh tampilan · {monthLabel}</p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em]">Kondisi finansialmu</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pine text-white shadow-card">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">Data ilustrasi, bukan angka pengguna sungguhan</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-clay-soft sm:col-span-2">
                  <p className="text-xs font-semibold text-white/60">Total saldo (contoh)</p>
                  <p className="mt-2 font-mono text-2xl font-medium tracking-[-0.05em]">Rp24.849.500</p>
                  <span className="mt-4 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80">+8,2% bulan ini</span>
                </div>
                <div className="rounded-2xl border border-rule bg-mint-10 p-4 shadow-clay-soft">
                  <p className="text-xs font-semibold text-ink-muted">Rasio tabungan</p>
                  <p className="mt-2 font-mono text-2xl font-medium text-mint">32,4%</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-high">
                    <div className="h-full w-[64%] rounded-full bg-mint" />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-5">
                <div className="rounded-2xl border border-rule bg-paper p-4 shadow-clay-soft md:col-span-3">
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
                <div className="rounded-2xl border border-rule bg-brass-10 p-4 shadow-clay-soft md:col-span-2">
                  <p className="text-xs font-bold text-ink">Anggaran makan</p>
                  <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-surface-high shadow-clay-soft ring-[10px] ring-brass/35">
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
              <p className="text-[10px] font-bold text-ink-muted">Hemat minggu ini (contoh)</p>
              <p className="font-mono text-small font-medium text-ink">Rp387.500</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="relative border-y border-rule bg-brand-50 py-20 sm:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Semua yang kamu butuhkan</p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-tight tracking-[-0.06em]">
              Satu ruang untuk keputusan yang lebih baik.
            </h2>
            <p className="mt-4 text-ink-muted">Setiap modul saling terhubung, jadi angka harian langsung menjadi gambaran yang berguna.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className={`card min-h-64 ${feature.size}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-card ${feature.tone}`}>
                    <Icon size={21} />
                  </div>
                  <div className="mt-10 max-w-xl">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-ink">{feature.title}</h3>
                    <p className="mt-3 max-w-lg font-medium leading-7 text-ink-muted">{feature.description}</p>
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
              ["01", "Catat kejadian uang", "Pilih keluar, masuk, transfer, tarik tunai, atau kondisi saldo."],
              ["02", "Saldo diperbarui otomatis", "Setiap transaksi mengubah rekening yang tepat dan menjaga riwayatnya."],
              ["03", "Baca pola, lalu bertindak", "Grafik, anggaran, utang, dan insight memakai data yang sama."],
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
        <div className="overflow-hidden rounded-[2rem] bg-brand-950 p-6 text-white sm:p-10 lg:p-14">
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

      <section id="faq" className="surface-soft border-y border-rule py-20 sm:py-28">
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

      <footer className="border-t border-rule bg-surface">
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
