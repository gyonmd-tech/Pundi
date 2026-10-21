"use client";

/**
 * app/page.tsx — Landing page Pundi.
 * Alur: hero dengan video loop latar → storyboard cara kerja yang berjalan
 * mengikuti scroll → Penjaga → fitur → keamanan → FAQ → ajakan → footer.
 * Semua section memakai pola yang sama (SectionHeading + Reveal) agar
 * konsisten; motion hanya transform/opacity dan hormat reduced-motion.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  ChevronDown,
  CircleDollarSign,
  KeyRound,
  Layers3,
  Menu,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { HeroVideoBackdrop } from "@/components/landing/LandingVideo";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { Reveal, SectionHeading } from "@/components/landing/motion";
import { PenjagaCharacter } from "@/components/penjaga/PenjagaCharacter";
import { cn } from "@/lib/utils/cn";

const NAV = [
  ["#cara-kerja", "Cara kerja"],
  ["#penjaga", "Penjaga"],
  ["#fitur", "Fitur"],
  ["#faq", "FAQ"],
] as const;

const features = [
  { title: "Pulihkan saldo saat catatan tertinggal", description: "Masukkan saldo nyata pada tanggal yang kamu ingat. Pundi membuat penyesuaian tanpa mencampurkannya ke grafik pemasukan atau pengeluaran.", icon: Zap, tone: "from-[#2459DE] to-[#5C8FF2]", size: "lg:col-span-7" },
  { title: "Transfer & tarik tunai tercatat dua sisi", description: "Saldo rekening asal dan tujuan diperbarui bersama, termasuk perpindahan uang dari bank ke dompet cash.", icon: WalletCards, tone: "from-[#0B6B54] to-[#159B78]", size: "lg:col-span-5" },
  { title: "Utang & piutang ikut terbaca", description: "Catat siapa, jatuh tempo, cicilan, dan sisa kewajiban agar arus kas tidak terlihat lebih longgar dari kenyataan.", icon: CircleDollarSign, tone: "from-[#B87708] to-[#D99418]", size: "lg:col-span-4" },
  { title: "Anggaran harian, mingguan, bulanan", description: "Batas makan per hari, bensin per minggu, tagihan per bulan — Pundi menghitung sisanya tiap hari.", icon: BellRing, tone: "from-[#5B3FD0] to-[#7B61D1]", size: "lg:col-span-4" },
  { title: "Dashboard jadi ruang kerjamu", description: "Susun kartu dan grafik seperti puzzle; Pundi mengingat tata letaknya di perangkatmu.", icon: Layers3, tone: "from-[#0E7490] to-[#0891B2]", size: "lg:col-span-4" },
];

const PENJAGA_POINTS = [
  { icon: MessagesSquare, title: "Cerita jadi catatan", body: "“Sarapan 15rb, bensin 30rb pakai cash” dipecah per transaksi lengkap dengan rekening dan kategori." },
  { icon: Sparkles, title: "Dari mana saja", body: "Ngobrol di aplikasi Pundi, atau lewat Hermes Agent milikmu di Telegram, WhatsApp, dan CLI." },
  { icon: KeyRound, title: "Kunci tetap di tanganmu", body: "Semua masuk sebagai draft sampai kamu setujui. Riwayat chat tersimpan per akun." },
];

const faqs = [
  { question: "Apakah saya bisa mencoba tanpa membuat akun?", answer: "Bisa. Mode demo berisi data contoh yang berjalan di browser, termasuk Penjaga versi latihan, jadi kamu bisa menjelajahi seluruh alur terlebih dahulu." },
  { question: "Apakah Penjaga bisa mengubah saldo tanpa izin?", answer: "Tidak. Penjaga hanya menyusun draft. Saldo berubah setelah kamu menekan Simpan atau menyetujuinya secara eksplisit di chat." },
  { question: "Bisakah transaksi diekspor?", answer: "Ya. Buku transaksi menyediakan ekspor CSV dan Excel agar data mudah diarsipkan atau dianalisis lebih lanjut." },
  { question: "Apakah nyaman dipakai dari ponsel?", answer: "Ya. Pundi bisa dipasang sebagai aplikasi, memakai navigasi bawah, panel bottom sheet, dan tata letak yang menumpuk rapi di layar kecil." },
];

const trustStrip = ["Tanpa kartu kredit", "Mode demo siap pakai", "Data privat per pengguna"];

const footerColumns = [
  { title: "Produk", links: [["#cara-kerja", "Cara kerja"], ["#penjaga", "Penjaga"], ["/dashboard", "Demo dashboard"]] },
  { title: "Akun", links: [["/login", "Masuk"], ["/signup", "Daftar"]] },
  { title: "Info", links: [["#keamanan", "Penyimpanan data"], ["#faq", "FAQ"]] },
];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const scrolled = useScrolled();
  const solid = scrolled || mobileMenuOpen;

  return (
    <main className="min-h-screen overflow-x-clip bg-paper text-ink">
      {/* ── Header: transparan di atas hero, padat saat scroll ── */}
      <header className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        solid ? "border-b border-rule bg-paper/85 shadow-card backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}>
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Pundi beranda" className="relative block h-8 w-[100px]">
            <Image src="/PUNDI-brand-assets/pundi-logo-white.svg" alt="Pundi" fill priority className={cn("object-contain object-left transition-opacity duration-300", solid ? "opacity-0 [[data-theme=dark]_&]:opacity-100" : "opacity-100")} />
            <Image src="/PUNDI-brand-assets/pundi-logo.svg" alt="" fill priority className={cn("object-contain object-left transition-opacity duration-300", solid ? "opacity-100 [[data-theme=dark]_&]:opacity-0" : "opacity-0")} />
          </Link>

          <nav className={cn("hidden items-center gap-8 text-sm font-semibold md:flex", solid ? "text-ink-muted" : "text-white/80")} aria-label="Navigasi utama">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={cn("transition-colors", solid ? "hover:text-ink" : "hover:text-white")}>{label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className={cn("rounded-full px-4 py-2 text-sm font-bold transition", solid ? "text-ink hover:bg-surface-high" : "text-white hover:bg-white/10")}>Masuk</Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#112772] shadow-card transition hover:-translate-y-px">
              Mulai gratis <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className={cn("grid h-10 w-10 place-items-center rounded-full border transition md:hidden", solid ? "border-rule text-ink" : "border-white/25 text-white")}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="animate-in fade-in slide-in-from-top-1 border-t border-rule bg-paper px-4 pb-5 pt-3 md:hidden">
            <nav className="grid gap-1 text-[15px] font-semibold">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 hover:bg-surface-high">{label}</Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-rule pt-4">
              <Link href="/login" className="grid h-11 place-items-center rounded-full border border-rule text-sm font-bold">Masuk</Link>
              <Link href="/signup" className="grid h-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">Mulai gratis</Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* ── Hero dengan video loop sebagai latar ── */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#112772] text-white md:flex-row md:items-center">
        {/* Ponsel: video di blok bawah (tidak menumpuk teks). Desktop: latar penuh di belakang judul. */}
        <div className="relative order-2 -mt-10 h-[54svh] min-h-[300px] md:absolute md:inset-0 md:order-none md:mt-0 md:h-auto md:-z-20">
          <HeroVideoBackdrop />
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#112772] to-transparent md:hidden" />
        </div>
        {/* Gradasi agar judul selalu terbaca di atas video */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block md:bg-[linear-gradient(90deg,rgba(10,22,70,.92)_0%,rgba(17,39,114,.7)_38%,rgba(17,39,114,0)_70%)]" />

        <div className="relative z-10 order-1 mx-auto w-full max-w-[80rem] px-4 pt-24 sm:px-6 md:pb-0 md:pt-16 lg:px-8">
          <div className="max-w-xl">
            <p className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md duration-700">
              <Sparkles size={13} className="text-[#FFD37A]" /> Baru · Penjaga bertenaga Hermes Agent
            </p>
            <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-5 font-display text-[clamp(2.4rem,6.4vw,4.6rem)] font-black leading-[0.98] tracking-[-0.045em] duration-700 [animation-delay:80ms]">
              Ceritakan harimu.<br />
              <span className="bg-gradient-to-r from-[#FFD37A] to-[#F2B544] bg-clip-text text-transparent">Penjaga yang mencatat.</span>
            </h1>
            <p className="animate-in fade-in slide-in-from-bottom-4 mt-5 max-w-lg text-[15px] leading-7 text-white/80 duration-700 [animation-delay:160ms] sm:text-lg">
              Pundi menyatukan transaksi, transfer, cash, utang, dan anggaran ke satu buku — dijaga AI yang mengubah ceritamu jadi catatan rapi. Manual tetap ada kapan pun kamu mau.
            </p>
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col gap-3 duration-700 [animation-delay:240ms] sm:flex-row">
              <Link href="/signup" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-bold text-[#112772] shadow-[0_14px_34px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5">
                Mulai kelola uang <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/20">
                Jelajahi demo
              </Link>
            </div>
            <ul className="animate-in fade-in mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/75 duration-700 [animation-delay:320ms]">
              {trustStrip.map((item) => (
                <li key={item} className="flex items-center gap-1.5"><Check size={14} className="text-[#6EE7B7]" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <a href="#cara-kerja" aria-label="Lihat cara kerja" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold text-white/70 md:flex">
          Gulir
          <span className="grid h-9 w-6 place-items-start justify-center rounded-full border border-white/40 pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-white" />
          </span>
        </a>
      </section>

      {/* ── Storyboard: cerita berjalan mengikuti scroll ── */}
      <ScrollStory />

      {/* ── Penjaga ── */}
      <section id="penjaga" className="relative scroll-mt-16 py-20 sm:py-28">
        <div className="mx-auto grid max-w-[80rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Penjaga · Hermes Agent"
              title={<>Ruang keuanganmu<br />kini punya penjaga.</>}
              description="Penjaga membaca rekening dan kategorimu, menyusun catatan dari ceritamu, dan menunggu persetujuanmu sebelum menyentuh saldo."
            />
            <ul className="mt-8 grid gap-3">
              {PENJAGA_POINTS.map(({ icon: Icon, title, body }, index) => (
                <Reveal key={title} as="li" delay={index * 90} className="flex items-start gap-4 rounded-[22px] border border-rule bg-surface-high p-5 shadow-card">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#2459DE] to-[#5C8FF2] text-white"><Icon size={19} /></span>
                  <div>
                    <h3 className="font-extrabold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={120} className="relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#112772_0%,#1D48B5_55%,#2860E6_100%)] px-6 py-12 text-white shadow-float">
            <div aria-hidden className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border-[36px] border-white/[.07]" />
            <div aria-hidden className="absolute -bottom-24 left-10 -z-10 h-56 w-56 rounded-full bg-[#5C8FF2]/30 blur-3xl" />
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <p className="rounded-[18px] rounded-bl-[6px] bg-white px-4 py-2.5 text-sm font-semibold text-[#112772] shadow-card">Tersimpan! Saldo sudah kuperbarui.</p>
              <PenjagaCharacter mood="happy" size={230} className="mt-4" title="Penjaga Pundi" />
              <p className="mt-4 text-sm text-white/75">Mode latihan tersedia tanpa akun — coba langsung di demo.</p>
              <Link href="/penjaga" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#112772] transition hover:-translate-y-0.5">
                Coba Penjaga <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section id="fitur" className="relative scroll-mt-16 border-y border-rule bg-surface-soft py-20 sm:py-28">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Fitur"
            title="Satu ruang untuk keputusan yang lebih baik."
            description="Setiap modul saling terhubung, jadi angka harian langsung menjadi gambaran yang berguna."
          />
          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} as="article" delay={(index % 3) * 90} className={cn("group relative overflow-hidden rounded-[24px] border border-rule bg-surface-high p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-float sm:p-7", feature.size)}>
                  <span aria-hidden className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-[.09] transition duration-500 group-hover:scale-125 group-hover:opacity-[.16]", feature.tone)} />
                  <span className={cn("grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br text-white shadow-card", feature.tone)}><Icon size={19} /></span>
                  <h3 className="mt-8 text-xl font-extrabold tracking-[-0.03em] text-ink">{feature.title}</h3>
                  <p className="mt-2.5 max-w-lg text-sm leading-6 text-ink-muted">{feature.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Keamanan ── */}
      <section id="keamanan" className="relative scroll-mt-16 py-20 sm:py-28">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#112772] p-6 text-white sm:p-10 lg:p-14">
            <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full border-[40px] border-white/[.06]" />
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <SectionHeading
                  tone="dark"
                  align="left"
                  eyebrow="Penyimpanan data"
                  title="Coba dengan data demo. Pindah ke cloud saat siap."
                  description="Mode demo berjalan dengan data contoh di browser. Setelah masuk dengan akun, autentikasi dan data dikelola melalui Appwrite — privat per pengguna."
                />
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                {[
                  [WalletCards, "Sesi akun memakai cookie HTTP-only"],
                  [KeyRound, "Token Penjaga bisa dicabut kapan saja"],
                  [ShieldCheck, "Server memeriksa pemilik data di setiap aksi"],
                ].map(([Icon, label], index) => {
                  const ItemIcon = Icon as typeof ShieldCheck;
                  return (
                    <Reveal key={label as string} as="li" delay={index * 90} className="flex items-center gap-3 rounded-[18px] bg-white/[.07] p-4 ring-1 ring-white/10">
                      <ItemIcon size={18} className="shrink-0 text-[#8FBCFF]" />
                      <span className="text-sm font-semibold text-white/85">{label as string}</span>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-16 border-y border-rule bg-surface-soft py-20 sm:py-28">
        <div className="mx-auto grid max-w-[80rem] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <SectionHeading align="left" eyebrow="Pertanyaan umum" title="Sebelum mulai." description="Hal penting tentang mode demo, Penjaga, ekspor, dan pengalaman mobile." />
          </div>
          <div className="space-y-3 lg:col-span-7">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal key={faq.question} as="article" delay={index * 70} className="overflow-hidden rounded-[22px] border border-rule bg-surface-high shadow-card">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left" aria-expanded={isOpen}>
                    <span className="font-bold text-ink">{faq.question}</span>
                    <ChevronDown size={18} className={cn("shrink-0 text-ink-muted transition-transform duration-300", isOpen && "rotate-180")} />
                  </button>
                  <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <p className="overflow-hidden px-5 text-sm leading-7 text-ink-muted">
                      <span className="block border-t border-rule py-5">{faq.answer}</span>
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ajakan ── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
          <Reveal className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#112772_0%,#1D48B5_55%,#2860E6_100%)] px-6 py-14 text-center text-white shadow-float sm:px-12">
            <div aria-hidden className="absolute -left-16 -top-16 -z-10 h-64 w-64 rounded-full border-[32px] border-white/[.07]" />
            <PenjagaCharacter mood="idle" size={110} className="mx-auto" title="" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.9rem,4.5vw,3.25rem)] font-black leading-[1.05] tracking-[-0.04em]">Beri setiap rupiah tempat dan penjaga.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">Mulai dengan mode demo, lalu buat akun saat kamu siap menyimpan data sendiri.</p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-bold text-[#112772] transition hover:-translate-y-0.5">Buat akun gratis <ArrowRight size={16} /></Link>
              <Link href="/dashboard" className="flex h-12 flex-1 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[15px] font-bold text-white transition hover:bg-white/20">Buka demo</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-rule bg-paper">
        <div className="mx-auto max-w-[80rem] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <Image src="/PUNDI-brand-assets/pundi-logo.svg" alt="Pundi" width={110} height={36} className="theme-light-only h-9 w-auto" />
              <Image src="/PUNDI-brand-assets/pundi-logo-white.svg" alt="Pundi" width={110} height={36} className="theme-dark-only h-9 w-auto" />
              <p className="mt-3 max-w-xs text-sm leading-6 text-ink-muted">Dibuat untuk keputusan finansial yang lebih jernih, satu cerita pada satu waktu.</p>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{column.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="text-sm font-medium text-ink transition-colors hover:text-brand-600">{label}</Link></li>
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
