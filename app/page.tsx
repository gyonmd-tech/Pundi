"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  PieChart, 
  Activity, 
  Target, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  CheckCircle2,
  Star,
  LineChart,
  Wallet,
  Menu,
  X,
  Building2,
  CreditCard,
  Lock,
  Globe,
  Plus,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Layers,
  BarChart3,
  Calendar
} from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTabPreview, setActiveTabPreview] = useState<"overview" | "transaksi" | "anggaran">("overview");

  const faqs = [
    { 
      q: "Apakah Pundi dapat digunakan secara gratis?", 
      a: "Ya, Pundi menyediakan versi Gratis selamanya untuk pemantauan keuangan personal. Anda dapat mencatat mutasi, membuat anggaran, dan memantau aset tanpa biaya langganan." 
    },
    { 
      q: "Bagaimana keamanan dan privasi data saya di Pundi?", 
      a: "Keamanan adalah prioritas mutlak kami. Data Anda terlindungi dengan standar enkripsi AES-256 dan protokol HTTPS tingkat perbankan. Kami tidak pernah menjual atau membagikan data finansial Anda kepada pihak ketiga." 
    },
    { 
      q: "Apakah data transaksi dapat diekspor ke Excel atau CSV?", 
      a: "Tentu! Pundi dilengkapi fitur ekspor mutasi langsung ke format Excel (.xlsx) rapi dengan header dan formatting otomatis, serta format standar CSV untuk integrasi lanjutan." 
    },
    { 
      q: "Apakah aplikasi ini nyaman diakses di smartphone?", 
      a: "Sangat nyaman. Pundi dirancang dengan filosofi mobile-first. Tampilan buku transaksi dan portofolio aset secara cerdas beralih ke format kartu responsif di layar ponsel (iPhone SE hingga iPhone Pro Max & Android)." 
    },
    { 
      q: "Apakah Pundi mendukung multi-rekening dan dompet digital?", 
      a: "Ya, Anda dapat mengelola beragam rekening bank (BCA, Mandiri, dll.), dompet digital (GoPay, OVO), hingga rekening kas tunai dan investasi dalam satu portofolio terpadu." 
    }
  ];

  return (
    <main
      className="min-h-screen flex flex-col relative bg-[#F8FAF8] text-[#16201D] selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-8%] left-[-10%] w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full blur-[140px] opacity-25 bg-emerald-400" />
        <div className="absolute top-[20%] right-[-12%] w-[40vw] max-w-[500px] h-[40vw] max-h-[500px] rounded-full blur-[130px] opacity-20 bg-teal-300" />
        <div className="absolute bottom-[20%] left-[-5%] w-[35vw] max-w-[450px] h-[35vw] max-h-[450px] rounded-full blur-[120px] opacity-15 bg-emerald-300" />
      </div>

      {/* ── Sticky Glassmorphic Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-950/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1E4D3A] text-white shadow-xs transition-transform group-hover:scale-105">
              <span className="font-mono font-bold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#16201D]">
              Pundi
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-small font-medium text-[#46534E]">
            <Link href="#fitur" className="hover:text-[#1E4D3A] transition-colors">Fitur Utama</Link>
            <Link href="#keunggulan" className="hover:text-[#1E4D3A] transition-colors">Keunggulan</Link>
            <Link href="#testimoni" className="hover:text-[#1E4D3A] transition-colors">Testimoni</Link>
            <Link href="#faq" className="hover:text-[#1E4D3A] transition-colors">FAQ</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-small font-semibold px-4 py-2 text-[#46534E] hover:text-[#16201D] transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              className="text-small font-semibold px-5 py-2.5 rounded-full bg-[#1E4D3A] text-white shadow-xs hover:bg-[#16382A] hover:shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Coba Gratis</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-card text-[#46534E] hover:text-[#16201D] hover:bg-emerald-50 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-emerald-950/10 bg-white/95 backdrop-blur-2xl px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-body font-medium text-[#46534E]">
              <Link
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#1E4D3A] transition-colors"
              >
                Fitur Utama
              </Link>
              <Link
                href="#keunggulan"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#1E4D3A] transition-colors"
              >
                Keunggulan
              </Link>
              <Link
                href="#testimoni"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#1E4D3A] transition-colors"
              >
                Testimoni
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#1E4D3A] transition-colors"
              >
                FAQ
              </Link>
            </nav>

            <div className="pt-4 border-t border-emerald-950/10 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-card border border-emerald-950/15 text-small font-semibold text-[#16201D] hover:bg-emerald-50 transition-colors"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-card bg-[#1E4D3A] text-white text-small font-semibold shadow-xs hover:bg-[#16382A] active:scale-95 transition-all"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 lg:pt-24 pb-12 lg:pb-20 max-w-7xl mx-auto w-full">
        {/* Release Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E4D3A]/20 bg-white/90 backdrop-blur-md shadow-2xs mb-6 sm:mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#1E4D3A]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E4D3A]"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase text-[#1E4D3A] font-mono">
            Pundi Release v1.0 · Smart Personal Finance
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold mb-5 max-w-4xl mx-auto tracking-tight leading-[1.12] text-[#16201D] font-display">
          Sistem Operasi untuk <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4D3A] via-[#2D6A4F] to-[#40916C]">
            Keuangan & Masa Depan Anda.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm xs:text-base sm:text-lg text-[#46534E] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Tinggalkan spreadsheet yang membingungkan. Pundi menyatukan pencatatan mutasi harian, perencanaan anggaran, analisis arus kas visual, dan valuasi aset dalam satu platform yang elegan.
        </p>

        {/* CTA Buttons (Properly constrained on Desktop, Tablet & Mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 sm:py-3.5 rounded-full text-small sm:text-body font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1E4D3A]/20 gap-2 group bg-[#1E4D3A] text-white shadow-md active:scale-95 text-center"
          >
            <span>Mulai Secara Gratis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 sm:py-3.5 rounded-full text-small sm:text-body font-semibold border border-emerald-950/15 bg-white text-[#16201D] hover:bg-slate-50 transition-all shadow-xs hover:border-[#1E4D3A]/40 text-center"
          >
            Buka Live Demo Dashboard
          </Link>
        </div>
        
        {/* Micro Guarantee */}
        <div className="mt-5 sm:mt-6 text-xs sm:text-small text-[#46534E] flex items-center gap-2 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-[#1E4D3A] font-medium">
            <CheckCircle2 size={15} /> Tanpa kartu kredit
          </span>
          <span className="text-emerald-950/20">·</span>
          <span>In-memory reactive storage</span>
          <span className="text-emerald-950/20">·</span>
          <span>Desain responsif di semua perangkat</span>
        </div>

        {/* ── Interactive Hero Mockup Window ── */}
        <div className="mt-12 sm:mt-16 w-full max-w-5xl mx-auto relative">
          {/* Floating Feature Badges on Desktop (adds SaaS Polish) */}
          <div className="hidden lg:flex absolute -top-5 -right-4 z-20 bg-white border border-emerald-950/10 px-4 py-2.5 rounded-2xl shadow-lg items-center gap-3 text-xs animate-in fade-in zoom-in-95">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E4D3A] flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#16201D]">Pemasukan Gaji</p>
              <p className="font-mono text-[#1E4D3A] font-bold">+Rp 25.500.000</p>
            </div>
          </div>

          <div className="hidden lg:flex absolute -bottom-5 -left-4 z-20 bg-white border border-emerald-950/10 px-4 py-2.5 rounded-2xl shadow-lg items-center gap-3 text-xs animate-in fade-in zoom-in-95">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Target size={16} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#16201D]">Target Dana Darurat</p>
              <p className="font-mono text-amber-700 font-bold">80% Tercapai (Rp 20jt)</p>
            </div>
          </div>

          <div className="w-full rounded-2xl md:rounded-[1.75rem] border border-emerald-950/15 bg-white/95 backdrop-blur-2xl shadow-xl shadow-emerald-950/5 overflow-hidden flex flex-col">
            {/* Fake Browser Window Header */}
            <div className="h-11 sm:h-12 border-b border-emerald-950/10 flex items-center justify-between px-3.5 sm:px-5 bg-[#F2F5F3]/80 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E58B82]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5C382]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#82E5A3]"></div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-4 sm:px-12 py-1 bg-white border border-emerald-950/10 rounded-md text-[11px] font-mono text-[#46534E] truncate max-w-[210px] sm:max-w-none shadow-2xs">
                <Lock size={12} className="text-[#1E4D3A] flex-shrink-0" />
                <span>app.pundi.id/dashboard</span>
              </div>

              <div className="flex items-center gap-1">
                {(["overview", "transaksi", "anggaran"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabPreview(tab)}
                    className={`hidden sm:inline-block px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-all ${
                      activeTabPreview === tab
                        ? "bg-[#1E4D3A] text-white font-semibold shadow-2xs"
                        : "text-[#46534E] hover:text-[#16201D] hover:bg-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* App Preview Body */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 text-left">
              {/* Header inside preview */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base sm:text-heading font-semibold text-[#16201D]" style={{ fontFamily: "var(--font-display)" }}>
                    Ringkasan Finansial · Agustus 2026
                  </h3>
                  <p className="text-xs text-[#46534E] font-ui">
                    Akun Aktif: <strong className="text-[#16201D]">Rekening Utama BCA</strong> + 3 lainnya
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-card bg-[#1E4D3A] text-white text-xs font-semibold hover:bg-[#16382A] transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Catat Mutasi</span>
                </Link>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 sm:p-4 rounded-card border border-emerald-950/10 bg-[#F8FAF8]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#46534E] mb-1 font-ui">Total Saldo Kas</p>
                  <p className="tabular-nums font-mono font-bold text-heading sm:text-display-s text-[#16201D]">Rp 42.750.000</p>
                  <span className="text-[10px] font-mono text-[#1E4D3A] font-semibold">▲ +8.2% bulan ini</span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-card border border-emerald-950/10 bg-[#F8FAF8]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#46534E] mb-1 font-ui">Pengeluaran</p>
                  <p className="tabular-nums font-mono font-bold text-heading sm:text-display-s text-[#B94A3E]">Rp 9.850.000</p>
                  <span className="text-[10px] font-mono text-[#1E4D3A] font-semibold">▼ -3.4% dari budget</span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-card border border-emerald-950/10 bg-[#F8FAF8]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#46534E] mb-1 font-ui">Arus Kas Bersih</p>
                  <p className="tabular-nums font-mono font-bold text-heading sm:text-display-s text-[#1E4D3A]">+Rp 15.650.000</p>
                  <span className="text-[10px] font-mono text-[#1E4D3A] font-semibold">Savings Rate: 61.4%</span>
                </div>
              </div>

              {/* Mini Chart / Recent Transactions Simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left: Mini Trend */}
                <div className="lg:col-span-3 p-4 rounded-card border border-emerald-950/10 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#16201D]">Tren Arus Kas Mingguan</span>
                    <span className="font-mono text-[#46534E]">Ledger Baseline</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-2 pt-4 px-1 border-b border-dashed border-emerald-950/15">
                    {[
                      { label: "M1", inH: "60%", exH: "30%" },
                      { label: "M2", inH: "45%", exH: "40%" },
                      { label: "M3", inH: "85%", exH: "50%" },
                      { label: "M4", inH: "70%", exH: "35%" },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          <div className="w-3 sm:w-4 bg-[#1E4D3A] rounded-t-sm" style={{ height: bar.inH }} title="Pemasukan" />
                          <div className="w-3 sm:w-4 bg-[#B94A3E] rounded-t-sm" style={{ height: bar.exH }} title="Pengeluaran" />
                        </div>
                        <span className="text-[10px] font-mono text-[#46534E]">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Transactions Feed */}
                <div className="lg:col-span-2 p-4 rounded-card border border-emerald-950/10 bg-white space-y-2.5">
                  <span className="text-xs font-semibold text-[#16201D] block">Mutasi Terbaru</span>
                  <div className="space-y-2">
                    {[
                      { title: "Gaji Bulanan", cat: "Pemasukan", amt: "+Rp 25.500.000", isInc: true },
                      { title: "Belanja Bulanan Supermarket", cat: "Kebutuhan", amt: "-Rp 1.450.000", isInc: false },
                      { title: "Tagihan Listrik & Internet", cat: "Utilitas", amt: "-Rp 650.000", isInc: false },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-emerald-950/5 last:border-0">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-[#16201D] truncate">{tx.title}</p>
                          <p className="text-[10px] text-[#46534E]">{tx.cat}</p>
                        </div>
                        <span className={`tabular-nums font-mono font-bold whitespace-nowrap ${tx.isInc ? "text-[#1E4D3A]" : "text-[#16201D]"}`}>
                          {tx.amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof & Trust ── */}
      <section className="py-10 border-y border-emerald-950/10 bg-white/70 backdrop-blur-md z-10 relative">
        <div className="max-w-6xl mx-auto px-4 xs:px-6 text-center">
          <p className="text-xs font-semibold text-[#46534E] uppercase tracking-widest mb-6 font-mono">
            Dirancang untuk Individu Cerdas, Freelancer, & Pemilik Bisnis
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 md:gap-16 opacity-70">
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-[#16201D]"><Building2 className="w-5 h-5 text-[#1E4D3A]"/> TechNova Studio</div>
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-[#16201D]"><Globe className="w-5 h-5 text-[#1E4D3A]"/> Global Net</div>
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-[#16201D]"><Activity className="w-5 h-5 text-[#1E4D3A]"/> Pulse Media</div>
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-[#16201D]"><Target className="w-5 h-5 text-[#1E4D3A]"/> Apex Consulting</div>
            <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg text-[#16201D]"><CreditCard className="w-5 h-5 text-[#1E4D3A]"/> PayFlow Digital</div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights (Bento Grid) ── */}
      <section id="fitur" className="px-4 xs:px-6 py-20 sm:py-28 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-4 font-display text-[#16201D] tracking-tight">
              Satu Aplikasi. <span className="text-[#1E4D3A]">Semua Instrumen Finansial.</span>
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-[#46534E] leading-relaxed">
              Arsitektur terintegrasi yang menyelaraskan setiap mutasi kas, limit anggaran, dan pertumbuhan aset Anda secara otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            {/* Bento 1: Arus Kas Visual (Wide) */}
            <div className="md:col-span-8 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-emerald-950/10 bg-white shadow-2xs relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1E4D3A] text-white flex items-center justify-center mb-5 shadow-xs">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 font-display text-[#16201D]">
                  Visualisasi Arus Kas Berstandar Akuntansi
                </h3>
                <p className="text-small sm:text-body text-[#46534E] mb-6 max-w-xl leading-relaxed">
                  Pantau rasio tabungan (*Savings Rate*) dan margin surplus/defisit bulanan dengan visualisasi batang berpresisi tinggi.
                </p>
              </div>

              {/* Inner Mini Graphic */}
              <div className="bg-[#F8FAF8] rounded-xl border border-emerald-950/10 p-4 sm:p-5">
                <div className="flex justify-between items-center text-xs font-semibold mb-3 text-[#46534E]">
                  <span>Tren Rasio Tabungan (6 Bulan)</span>
                  <span className="text-[#1E4D3A] font-mono">Rata-rata: 42.5%</span>
                </div>
                <div className="h-16 flex items-end gap-2">
                  {[25, 40, 35, 60, 50, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-950/10 hover:bg-[#1E4D3A] rounded-t transition-colors h-full flex items-end">
                      <div className="w-full bg-[#1E4D3A] rounded-t" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento 2: Real-time Budgeting (Dark Accent) */}
            <div className="md:col-span-4 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-emerald-950/20 bg-[#16201D] text-white shadow-md relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-800/60 text-emerald-300 flex items-center justify-center mb-5 border border-emerald-500/20">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 font-display">
                  Budgeting Real-time
                </h3>
                <p className="text-emerald-100/80 text-xs sm:text-small mb-6 leading-relaxed">
                  Tetapkan batas pengeluaran per kategori. Pundi memberi indikator visual saat Anda mendekati batas aman.
                </p>
              </div>

              <div className="space-y-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Makan & Resto</span>
                    <span className="text-emerald-400 font-mono">65% Terpakai</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[65%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Transport & Bensin</span>
                    <span className="text-[#E58B82] font-mono">92% Kritis</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E58B82] w-[92%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 3: Aset & Net Worth */}
            <div className="md:col-span-4 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-emerald-950/10 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1E4D3A]/10 text-[#1E4D3A] flex items-center justify-center mb-4">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display text-[#16201D]">
                  Portofolio & Net Worth
                </h3>
                <p className="text-small text-[#46534E] leading-relaxed mb-4">
                  Kalkulasi nilai bersih portofolio secara otomatis dengan metrik Return P&L dan persentase alokasi kelas instrumen.
                </p>
              </div>
              <div className="p-3 bg-[#F8FAF8] rounded-xl border border-emerald-950/10 flex items-center justify-between text-xs">
                <span className="font-medium text-[#46534E]">Total Net Worth:</span>
                <span className="font-mono font-bold text-[#1E4D3A]">Rp 150.250.000</span>
              </div>
            </div>

            {/* Bento 4: Financial Goals */}
            <div className="md:col-span-4 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-emerald-950/10 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display text-[#16201D]">
                  Tujuan Tabungan Terukur
                </h3>
                <p className="text-small text-[#46534E] leading-relaxed mb-4">
                  Susun target finansial seperti Dana Darurat atau DP Rumah dengan proyeksi pencapaian target bulanan yang jelas.
                </p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-900/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-amber-600 flex items-center justify-center text-xs font-mono font-bold text-amber-900">
                  80%
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#16201D] truncate">Dana Darurat 6 Bulan</p>
                  <p className="text-[10px] text-[#46534E]">Sisa Rp 4.000.000 lagi</p>
                </div>
              </div>
            </div>

            {/* Bento 5: Enterprise-Grade Privacy */}
            <div className="md:col-span-4 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-emerald-950/10 bg-[#EDF4EE] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1E4D3A] text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display text-[#16201D]">
                  Privasi & Keamanan Data
                </h3>
                <p className="text-small text-[#46534E] leading-relaxed">
                  Data Anda tersimpan secara aman dengan standar enkripsi modern. Tanpa pelacak iklan dan tanpa pembagian data pihak ketiga.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#1E4D3A]">
                <Lock size={14} /> 256-bit Secure Architecture
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimoni" className="px-4 xs:px-6 py-20 sm:py-28 bg-[#16201D] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-4 font-display">
              Dipercaya oleh Pengguna Modern
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70 max-w-xl mx-auto">
              Bagaimana Pundi membantu ribuan individu mengatur keuangan dengan tenang dan terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Dewi",
                role: "Product Designer",
                text: "UI/UX Pundi luar biasa rapi. Memisahkan pengeluaran rutin dan tabungan investasi jadi sangat mudah. Desain mobile-nya juga sangat nyaman dipakai saat bepergian.",
                rating: 5,
              },
              {
                name: "Budi Santoso",
                role: "Freelance Engineer",
                text: "Fitur arus kas visual dan Ledger Baseline sangat membantu saya melihat bulan mana saja pemasukan saya surplus atau perlu berhemat. Fitur ekspor Excel-nya sangat rapi.",
                rating: 5,
              },
              {
                name: "Ahmad Rizky",
                role: "Pemilik Bisnis Kuliner",
                text: "Satu-satunya aplikasi keuangan yang tidak terasa murahan atau penuh iklan. Performanya cepat, responsif di HP, dan data aset selalu terupdate otomatis.",
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-small sm:text-body text-emerald-50/90 leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#1E4D3A] flex items-center justify-center font-bold text-small text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-small font-bold text-white">{t.name}</p>
                    <p className="text-xs text-emerald-200/60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Interactive Accordions) ── */}
      <section id="faq" className="px-4 xs:px-6 py-20 sm:py-28 bg-[#F2F5F3] relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl xs:text-4xl font-bold mb-3 font-display text-[#16201D]">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-small sm:text-body text-[#46534E]">
              Segala hal yang perlu Anda ketahui tentang penggunaan dan keamanan Pundi.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-emerald-950/10 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-small sm:text-body text-[#16201D] hover:text-[#1E4D3A] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#46534E] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#1E4D3A]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-small text-[#46534E] leading-relaxed border-t border-emerald-950/5 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center bg-white border-t border-emerald-950/10 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-4 font-display text-[#16201D] tracking-tight">
            Kendalikan Keuangan Anda Hari Ini.
          </h2>
          <p className="text-small sm:text-body text-[#46534E] mb-8 max-w-xl mx-auto leading-relaxed">
            Mulai catat mutasi harian, rencanakan anggaran, dan wujudkan tujuan finansial Anda bersama Pundi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 sm:py-4 rounded-full text-small sm:text-body font-semibold transition-all hover:scale-105 shadow-md shadow-[#1E4D3A]/20 bg-[#1E4D3A] text-white gap-2 active:scale-95 text-center"
            >
              <span>Buat Akun Gratis Sekarang</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 sm:py-4 rounded-full text-small sm:text-body font-semibold border border-emerald-950/15 bg-white text-[#16201D] hover:bg-slate-50 transition-all shadow-xs text-center"
            >
              Eksplorasi Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mega Footer ── */}
      <footer className="px-4 xs:px-6 py-12 sm:py-16 border-t border-emerald-950/10 bg-[#F2F5F3] text-xs text-[#46534E]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="sm:col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E4D3A] text-white flex items-center justify-center font-bold text-xs">P</div>
              <span className="font-display font-bold text-lg text-[#16201D]">Pundi</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Platform dashboard finansial personal modern dengan fokus pada kejelasan data, estetika tampilan, dan perlindungan privasi.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#16201D] mb-3 uppercase tracking-wider text-[11px] font-mono">Modul Produk</p>
            <ul className="space-y-2">
              <li><Link href="/transaksi" className="hover:text-[#1E4D3A]">Buku Transaksi</Link></li>
              <li><Link href="/anggaran" className="hover:text-[#1E4D3A]">Perencanaan Anggaran</Link></li>
              <li><Link href="/arus-kas" className="hover:text-[#1E4D3A]">Analisis Arus Kas</Link></li>
              <li><Link href="/aset" className="hover:text-[#1E4D3A]">Portofolio Aset</Link></li>
              <li><Link href="/tujuan" className="hover:text-[#1E4D3A]">Tujuan Tabungan</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#16201D] mb-3 uppercase tracking-wider text-[11px] font-mono">Teknologi & Keamanan</p>
            <ul className="space-y-2">
              <li><span>Next.js 16 App Router</span></li>
              <li><span>Tailwind CSS Custom Design System</span></li>
              <li><span>Enkripsi Standar AES-256</span></li>
              <li><span>Appwrite Cloud Data Sync</span></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#16201D] mb-3 uppercase tracking-wider text-[11px] font-mono">Akses Cepat</p>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-[#1E4D3A]">Masuk</Link></li>
              <li><Link href="/signup" className="hover:text-[#1E4D3A]">Daftar Akun Baru</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#1E4D3A]">Demo Mode</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} Pundi Personal Finance. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#16201D] cursor-pointer">Privasi</span>
            <span>·</span>
            <span className="hover:text-[#16201D] cursor-pointer">Syarat & Ketentuan</span>
            <span>·</span>
            <span className="hover:text-[#16201D] cursor-pointer">Status Sistem</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
