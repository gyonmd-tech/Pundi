import type { Metadata } from "next";
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
  Plus
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pundi — Financial Dashboard Profesional untuk Individu & Bisnis",
  description:
    "Pundi menyatukan pencatatan transaksi, anggaran, arus kas, dan investasi dalam satu tampilan tingkat enterprise yang rapi dan mudah dibaca.",
};

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Premium Gradient Background Base */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-emerald-400" />
         <div className="absolute top-[10%] right-[-10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-10 bg-slate-400" />
      </div>

      {/* Navigation - Premium Sticky Glassmorphism */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
               <span className="font-bold text-sm">P</span>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-slate-900">
              Pundi
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
             <Link href="#fitur" className="hover:text-slate-900 transition-colors">Fitur Utama</Link>
             <Link href="#integrasi" className="hover:text-slate-900 transition-colors">Integrasi</Link>
             <Link href="#testimoni" className="hover:text-slate-900 transition-colors">Testimoni</Link>
             <Link href="#faq" className="hover:text-slate-900 transition-colors">FAQ</Link>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95"
          >
            Coba Gratis
          </Link>
        </div>
        <button className="md:hidden p-2 text-slate-600">
           <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero Section - SaaS Premium Style */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-600">
            Pundi v1.0 Released
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold mb-6 max-w-5xl tracking-tight leading-[1.1] text-slate-900 font-display">
          Operating System untuk <br className="hidden lg:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
             Keuangan Anda.
          </span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-3xl text-slate-600 leading-relaxed">
          Ucapkan selamat tinggal pada spreadsheet yang rumit. Pundi adalah dashboard finansial tingkat enterprise yang dirancang untuk kejelasan, kecepatan, dan ketenangan pikiran Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 flex items-center justify-center gap-2 group bg-slate-900 text-white"
          >
            Mulai Secara Gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            Lihat Demo Langsung
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
           <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tanpa kartu kredit. Setup dalam 2 menit.
        </p>

        {/* The Massive Hero Mockup (To fix the "Kopong" feel) */}
        <div className="mt-16 w-full max-w-6xl mx-auto px-4 relative perspective-[2000px]">
           <div className="w-full rounded-2xl md:rounded-[2rem] border border-slate-200/60 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-slate-200/50 overflow-hidden transform-gpu rotate-x-12 translate-y-8 scale-95 transition-transform duration-1000 hover:rotate-x-0 hover:translate-y-0 hover:scale-100 flex flex-col" style={{ height: "700px" }}>
              {/* Fake Browser Header */}
              <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                 </div>
                 <div className="mx-auto flex items-center gap-2 px-24 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-xs text-slate-400 font-mono">
                    <Lock className="w-3 h-3" /> app.pundi.id/dashboard
                 </div>
              </div>
              
              {/* Fake App Body */}
              <div className="flex-1 flex overflow-hidden">
                 {/* Sidebar */}
                 <div className="w-64 border-r border-slate-100 bg-slate-50/30 p-4 flex flex-col gap-6 hidden md:flex">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"></div>
                       <div>
                          <p className="text-sm font-semibold text-slate-900 leading-tight">Rumah Design</p>
                          <p className="text-xs text-slate-500">Personal Plan</p>
                       </div>
                    </div>
                    <div className="space-y-1">
                       {['Dashboard', 'Transaksi', 'Arus Kas', 'Anggaran', 'Aset'].map((item, i) => (
                          <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium ${i === 0 ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}>
                             {item}
                          </div>
                       ))}
                    </div>
                 </div>
                 {/* Main Content Area */}
                 <div className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                       <div>
                          <h2 className="text-2xl font-bold text-slate-900 font-display">Overview</h2>
                          <p className="text-sm text-slate-500">Ringkasan finansial Anda bulan ini.</p>
                       </div>
                       <div className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm">
                          + Tambah Transaksi
                       </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                       {[
                          { label: "Total Saldo", val: "Rp 145.250.000", change: "+12.5%", pos: true },
                          { label: "Pengeluaran (Bulan ini)", val: "Rp 8.450.000", change: "-2.4%", pos: true },
                          { label: "Pemasukan (Bulan ini)", val: "Rp 24.500.000", change: "+5.2%", pos: true }
                       ].map((stat, i) => (
                          <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2">
                             <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                             <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">{stat.val}</p>
                             <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${stat.pos ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {stat.change} vs bulan lalu
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Charts & Tables Area */}
                    <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                       <div className="col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
                          <p className="text-sm font-semibold text-slate-900 mb-6">Cash Flow Analytics</p>
                          {/* Faux Line Chart */}
                          <div className="flex-1 relative border-l border-b border-slate-100 flex items-end justify-between px-2 pb-2">
                             {[40, 30, 60, 50, 80, 70, 100].map((h, i) => (
                                <div key={i} className="w-12 flex flex-col items-center gap-2 group">
                                   <div className="w-full bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-400" style={{ height: `${h}%` }}></div>
                                   <span className="text-[10px] text-slate-400">0{i+1}/08</span>
                                </div>
                             ))}
                             {/* Faux Baseline */}
                             <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-200"></div>
                          </div>
                       </div>
                       <div className="col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
                          <p className="text-sm font-semibold text-slate-900 mb-4">Transaksi Terakhir</p>
                          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                             {[
                                { name: "Spotify Premium", cat: "Hiburan", amt: "-Rp 54.900", date: "Hari ini" },
                                { name: "Gaji Bulanan", cat: "Pemasukan", amt: "+Rp 15.000.000", date: "Kemarin", isPos: true },
                                { name: "Kopi Kenangan", cat: "F&B", amt: "-Rp 35.000", date: "Kemarin" },
                                { name: "Tokopedia", cat: "Belanja", amt: "-Rp 450.000", date: "2 Hari lalu" },
                             ].map((tx, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3">
                                   <div>
                                      <p className="text-sm font-medium text-slate-900 leading-none mb-1">{tx.name}</p>
                                      <p className="text-[11px] text-slate-500">{tx.cat} • {tx.date}</p>
                                   </div>
                                   <p className={`text-sm font-mono font-medium ${tx.isPos ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amt}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Decorative Elements around Mockup */}
           <div className="absolute -left-12 top-1/4 w-24 h-24 bg-teal-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
           <div className="absolute -right-12 bottom-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 border-y border-slate-200 bg-white z-10 relative">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Dipercaya oleh ribuan profesional dan UMKM</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Dummy Logos built with Text & Icons */}
               <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><Building2 className="w-6 h-6"/> TechNova</div>
               <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><Globe className="w-6 h-6"/> GlobalNet</div>
               <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><Activity className="w-6 h-6"/> PulseStudio</div>
               <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><Target className="w-6 h-6"/> AimHigh Corp</div>
               <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800"><CreditCard className="w-6 h-6"/> PayFlow</div>
            </div>
         </div>
      </section>

      {/* Feature Highlights (Dense Bento Grid) */}
      <section id="fitur" className="px-6 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-slate-900 tracking-tight">
              Satu alat. <span className="text-emerald-600">Semua fitur.</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-slate-600">
              Setiap alat finansial yang Anda butuhkan, terintegrasi sempurna dalam satu platform yang responsif dan memanjakan mata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Box 1 - Wide */}
            <div className="md:col-span-8 p-10 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white z-0"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
                     <LineChart className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 font-display text-slate-900">Arus Kas Visual yang Presisi</h3>
                  <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                     Jangan menebak-nebak ke mana uang Anda pergi. Algoritma visualisasi kami memetakan setiap rupiah dengan *Ledger Baseline* layaknya buku kas profesional.
                  </p>
                  
                  {/* Detailed Inner UI */}
                  <div className="mt-auto bg-slate-50 rounded-2xl border border-slate-100 p-6 shadow-inner flex items-center justify-between group-hover:shadow-md transition-shadow">
                     <div className="space-y-4 w-full">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                           <span>Trend Pengeluaran (7 Hari)</span>
                           <span className="text-emerald-600">Terjaga</span>
                        </div>
                        <div className="flex gap-2 h-16 items-end w-full">
                           {[30, 45, 20, 80, 55, 35, 60].map((h, i) => (
                              <div key={i} className="flex-1 bg-slate-200 rounded-sm hover:bg-slate-300 transition-colors" style={{ height: `${h}%` }}></div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bento Box 2 - Tall */}
            <div className="md:col-span-4 p-10 rounded-[2.5rem] border border-slate-200 bg-slate-900 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <PieChart className="w-10 h-10 mb-6 text-emerald-400" />
                  <h3 className="text-2xl font-bold mb-4 font-display">Budgeting Real-time</h3>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                     Setel batas pengeluaran per kategori. Sistem akan memberi peringatan dini sebelum Anda melewati batas.
                  </p>
                  <div className="mt-auto space-y-4">
                     <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex justify-between text-sm font-medium mb-2">
                           <span>Makanan</span>
                           <span className="text-emerald-400">Aman</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400 w-[45%]"></div>
                        </div>
                     </div>
                     <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 border-l-4 border-l-red-500">
                        <div className="flex justify-between text-sm font-medium mb-2">
                           <span>Belanja</span>
                           <span className="text-red-400">Kritis</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500 w-[92%]"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bento Box 3 */}
            <div className="md:col-span-4 p-10 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
               <Target className="w-10 h-10 mb-6 text-slate-900" />
               <h3 className="text-2xl font-bold mb-4 font-display text-slate-900">Aset & Goal</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                  Hitung *Net Worth* Anda secara otomatis. Buat tujuan tabungan (seperti DP Rumah atau Liburan) dan pantau persentasenya setiap hari.
               </p>
               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-sm text-slate-900">
                     75%
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-900">Dana Darurat</p>
                     <p className="text-xs text-slate-500">Tersisa Rp 5jt lagi</p>
                  </div>
               </div>
            </div>

            {/* Bento Box 4 */}
            <div className="md:col-span-4 p-10 rounded-[2.5rem] border border-slate-200 bg-emerald-50 shadow-sm border-emerald-100">
               <ShieldCheck className="w-10 h-10 mb-6 text-emerald-600" />
               <h3 className="text-2xl font-bold mb-4 font-display text-slate-900">Privasi Bank-Grade</h3>
               <p className="text-slate-600 leading-relaxed">
                  Kami menggunakan enkripsi AES-256 untuk memastikan data transaksi Anda tidak dapat dibaca oleh siapapun kecuali Anda sendiri.
               </p>
            </div>

            {/* Bento Box 5 */}
            <div className="md:col-span-4 p-10 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm flex flex-col justify-center text-center items-center hover:bg-slate-50 cursor-pointer transition-colors">
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-slate-900" />
               </div>
               <h3 className="text-xl font-bold font-display text-slate-900">Eksplorasi Semua Fitur</h3>
               <p className="text-sm text-slate-500 mt-2">Masih banyak lagi di dalam dashboard.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="px-6 py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">Jangan hanya percaya pada kami.</h2>
               <p className="text-xl text-slate-400">Dengarkan dari ribuan profesional yang telah mengatur keuangan mereka bersama Pundi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  { name: "Budi Santoso", role: "Freelance Designer", text: "Sebelum pakai Pundi, saya selalu bingung memisahkan uang pribadi dan project. Sekarang semua tergambar jelas di satu dashboard. Sangat recommended!" },
                  { name: "Siti Aminah", role: "Owner UMKM", text: "Fitur arus kas visualnya luar biasa. Saya jadi tahu persis bulan apa saja toko saya sepi dan kapan harus menabung lebih banyak." },
                  { name: "Reza Rahadian", role: "Karyawan Swasta", text: "UI/UX-nya sangat bersih dan tidak membingungkan. Jauh lebih baik dibanding aplikasi pencatat keuangan lain yang fiturnya terlalu rumit." }
               ].map((testi, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm">
                     <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-emerald-500 text-emerald-500" />)}
                     </div>
                     <p className="text-lg leading-relaxed text-slate-300 mb-8">"{testi.text}"</p>
                     <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">{testi.name.charAt(0)}</div>
                        <div>
                           <p className="font-bold">{testi.name}</p>
                           <p className="text-sm text-slate-400">{testi.role}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-32 bg-slate-50">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 font-display text-center text-slate-900">Pertanyaan yang Sering Diajukan</h2>
            <div className="space-y-4">
               {[
                  { q: "Apakah Pundi gratis untuk digunakan?", a: "Ya, Pundi menyediakan versi Gratis selamanya untuk penggunaan personal dengan fitur dasar. Kami juga memiliki paket Pro untuk bisnis kecil dengan fitur analisis lanjutan." },
                  { q: "Bagaimana keamanan data saya?", a: "Keamanan adalah prioritas utama kami. Data Anda dienkripsi dengan standar AES-256 dan kami tidak pernah menjual data finansial Anda kepada pihak ketiga." },
                  { q: "Bisakah saya menghubungkan akun bank saya secara otomatis?", a: "Saat ini fitur Auto-Sync bank sedang dalam tahap beta tertutup untuk beberapa bank lokal. Namun, import data via CSV sudah tersedia." },
                  { q: "Apakah aplikasi ini bisa diakses di HP?", a: "Tentu. Pundi adalah platform Web App yang sepenuhnya responsif. Tampilannya akan beradaptasi sempurna di browser HP Anda." }
               ].map((faq, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                     <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                     <p className="text-slate-600">{faq.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Bottom - Mega */}
      <section className="px-6 py-32 text-center border-t border-slate-200 bg-white relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 font-display text-slate-900 tracking-tight">Kendalikan uang Anda hari ini.</h2>
            <p className="text-xl text-slate-600 mb-10">Bergabung dengan ribuan orang yang telah meraih kebebasan finansial dengan alat yang tepat.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link
                  href="/signup"
                  className="px-10 py-5 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-slate-900/10 bg-slate-900 text-white"
                >
                  Buat Akun Gratis Sekarang
                </Link>
            </div>
         </div>
      </section>

      {/* Mega Footer */}
      <footer className="px-6 py-16 lg:py-24 border-t border-slate-200 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">P</div>
                  <span className="font-display font-bold text-2xl text-slate-900">Pundi</span>
               </div>
               <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                  Platform manajemen finansial presisi untuk individu modern dan bisnis kecil. Dibangun dengan fokus pada keindahan desain dan privasi data.
               </p>
               <div className="flex gap-4">
                  {/* Social placeholders */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"></div>
               </div>
            </div>
            
            <div className="col-span-1 lg:col-span-1">
               <h5 className="font-bold mb-6 text-slate-900">Produk</h5>
               <ul className="space-y-4 text-slate-600">
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Fitur</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Harga</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Integrasi</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Changelog</Link></li>
               </ul>
            </div>

            <div className="col-span-1 lg:col-span-1">
               <h5 className="font-bold mb-6 text-slate-900">Perusahaan</h5>
               <ul className="space-y-4 text-slate-600">
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Tentang Kami</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Karir</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-emerald-600 transition-colors">Kontak</Link></li>
               </ul>
            </div>

            <div className="col-span-2 lg:col-span-2">
               <h5 className="font-bold mb-6 text-slate-900">Berlangganan Newsletter</h5>
               <p className="text-slate-500 mb-4">Dapatkan tips keuangan dan update produk terbaru setiap bulannya.</p>
               <div className="flex gap-2">
                  <input type="email" placeholder="Email Anda" className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  <button className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors">Daftar</button>
               </div>
            </div>
         </div>
         
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} Pundi Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-500 font-medium">
             <Link href="#" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Syarat & Ketentuan</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Status Keamanan</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
