"use client";

import { useState } from "react";
import {
  BellRing,
  ChevronRight,
  Database,
  Info,
  Languages,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  Wallet,
} from "lucide-react";
import { useAccounts, useApp, useCategories } from "@/lib/data/store";
import type { Account } from "@/lib/data/mock";
import { formatRupiah } from "@/lib/utils/formatter";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { PreferenceToggle } from "@/components/settings/PreferenceToggle";
import { AccountManagerModal } from "@/components/settings/AccountManagerModal";
import { ProfileNameModal } from "@/components/settings/ProfileNameModal";

const accountTypeLabel: Record<string, string> = {
  bank: "Rekening bank",
  ewallet: "Dompet digital",
  cash: "Uang tunai",
  credit_card: "Kartu kredit",
  investment: "Investasi",
};

type CategoryFilter = "all" | "expense" | "income";

export default function PengaturanPage() {
  const accounts = useAccounts();
  const categories = useCategories();
  const { connection } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [notifications, setNotifications] = useState(true);
  const [autoInsights, setAutoInsights] = useState(true);
  const [compactNumbers, setCompactNumbers] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  const filteredCategories = categories.filter((category) => categoryFilter === "all" || category.type === categoryFilter);
  const displayName = profileName ?? connection.userName ?? (connection.mode === "demo" ? "Sarah Dewi" : "Pengguna Pundi");
  const displayEmail = connection.userEmail ?? (connection.mode === "demo" ? "demo@pundi.id" : "Email akun cloud");
  const connectionLabel = connection.status === "loading"
    ? "Menghubungkan data"
    : connection.status === "error"
      ? "Cloud bermasalah"
      : connection.mode === "cloud"
        ? "Tersinkron ke cloud"
        : "Mode demo lokal";

  function openNewAccount() {
    setEditingAccount(null);
    setAccountModalOpen(true);
  }

  function openAccount(account: Account) {
    setEditingAccount(account);
    setAccountModalOpen(true);
  }

  return (
    <div className="w-full min-w-0 max-w-[90rem] space-y-5 font-ui sm:space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Personalisasi Pundi</p>
          <h1 className="page-title mt-1">Pengaturan &amp; Preferensi</h1>
          <p className="page-subtitle max-w-2xl">Kelola profil, sumber dana, tampilan, dan kategori transaksi dari satu tempat.</p>
        </div>
        <div className={cn("flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold", connection.status === "error" ? "border-ember/20 bg-ember-10 text-ember" : "border-mint/20 bg-mint-10 text-mint")}>
          <span className={cn("h-2 w-2 rounded-full bg-mint", connection.status === "loading" && "animate-pulse bg-brass", connection.status === "error" && "bg-ember")} />
          {connectionLabel}
        </div>
      </header>

      <div className="grid items-stretch gap-5 lg:grid-cols-12">
        <SettingsCard title="Profil pengguna" description="Identitas, keamanan, dan format utama akun Anda." icon={User} tone="violet" className="lg:col-span-7 lg:row-span-2">
          <div className="mb-4 flex flex-col gap-4 rounded-[22px] border border-white/80 bg-white/75 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-[linear-gradient(145deg,#7162ff,#4b3bd1)] text-xl font-black text-white shadow-[0_14px_26px_rgba(91,74,239,.24)]">
              {displayName.split(" ").slice(0, 2).map((name) => name[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="truncate text-xl font-extrabold tracking-[-0.025em] text-ink">{displayName}</p><span className="rounded-full bg-mint-10 px-2.5 py-1 text-[10px] font-extrabold text-mint">Terverifikasi</span></div>
              <p className="mt-1 truncate text-sm text-ink-muted">{displayEmail}</p>
              <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-pine-10"><div className="h-full w-full rounded-full bg-[linear-gradient(90deg,#5B4AEF,#3E86ED)]" /></div><span className="text-xs font-extrabold tabular-nums text-pine">100%</span></div>
              <p className="mt-1.5 text-[11px] font-semibold text-ink-muted">Profil dasar lengkap</p>
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-pine/10 bg-white/65 p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-muted">Status akun</p><p className="mt-2 flex items-center gap-2 text-sm font-extrabold text-ink"><ShieldCheck className="h-4 w-4 text-mint" />Data terlindungi</p></div>
            <div className="rounded-[18px] border border-sky/10 bg-white/65 p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-muted">Penyimpanan</p><p className="mt-2 flex items-center gap-2 text-sm font-extrabold text-ink"><Database className="h-4 w-4 text-sky" />{connectionLabel}</p></div>
          </div>

          <div className="flex flex-1 flex-col divide-y divide-rule/70 rounded-[18px] border border-white/80 bg-white/65 px-3">
            <button type="button" onClick={() => setProfileOpen(true)} className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] px-1 py-3 text-left hover:text-pine">
              <span className="text-xs font-semibold text-ink-muted">Nama lengkap</span><span className="flex min-w-0 items-center gap-1.5 text-right text-xs font-extrabold text-ink group-hover:text-pine sm:text-sm"><span className="truncate">{displayName}</span><ChevronRight className="h-4 w-4 shrink-0" /></span>
            </button>
            {[["Mata uang", "Rupiah Indonesia (IDR)"], ["Format angka", "1.234.567"], ["Bahasa", "Bahasa Indonesia"]].map(([label, value]) => (
              <div key={label} className="flex min-h-12 items-center justify-between gap-3 px-1 py-3"><span className="text-xs font-semibold text-ink-muted">{label}</span><span className="text-right text-xs font-extrabold text-ink sm:text-sm">{value}</span></div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Preferensi aplikasi" description="Atur pengalaman harian tanpa meninggalkan halaman." icon={Palette} tone="mint" className="lg:col-span-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreferenceToggle label="Notifikasi pengingat" description="Peringatan anggaran dan transaksi penting." icon={BellRing} checked={notifications} onChange={setNotifications} tone="pine" />
            <PreferenceToggle label="Insight otomatis" description="Ringkasan pola keuangan yang relevan." icon={Sparkles} checked={autoInsights} onChange={setAutoInsights} tone="mint" />
            <PreferenceToggle label="Angka ringkas" description="Tampilkan jutaan sebagai jt pada ringkasan." icon={Database} checked={compactNumbers} onChange={setCompactNumbers} tone="sky" />
            <div className="flex items-center gap-3 rounded-[18px] border border-white/80 bg-white/70 p-3.5 text-left shadow-2xs sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-sky-10 text-sky"><Languages className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-ink">Bahasa &amp; wilayah</span><span className="mt-0.5 block text-xs text-ink-muted">Indonesia · Asia/Jakarta</span></span></div>
          </div>
        </SettingsCard>

        <SettingsCard title="Akun & dompet" description="Tambah, ubah, nonaktifkan, atau hapus sumber dana." icon={Wallet} tone="blue" className="lg:col-span-5" action={<Button type="button" size="sm" variant="soft" onClick={openNewAccount}><Plus className="h-3.5 w-3.5" />Tambah</Button>}>
          <div className="grid gap-3">
            {accounts.map((account) => (
              <button key={account.id} type="button" onClick={() => openAccount(account)} className="group flex min-w-0 items-center gap-3 rounded-[18px] border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-card" style={{ backgroundColor: `${account.colorTag}0D`, borderColor: `${account.colorTag}2B` }}>
                <span className="h-10 w-2 shrink-0 rounded-full" style={{ backgroundColor: account.colorTag }} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-ink">{account.name}</span><span className="mt-0.5 block truncate text-[11px] text-ink-muted">{accountTypeLabel[account.type] ?? account.type}</span></span>
                <span className="shrink-0 text-right"><span className="block text-sm font-black tabular-nums text-ink">{formatRupiah(account.balance)}</span><span className={cn("text-[10px] font-bold", account.isActive ? "text-mint" : "text-ink-muted")}>{account.isActive ? "Aktif" : "Nonaktif"}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-pine" />
              </button>
            ))}
            {!accounts.length && connection.status !== "loading" ? <button type="button" onClick={openNewAccount} className="rounded-[18px] border border-dashed border-sky/30 bg-white/60 p-6 text-sm font-bold text-sky">Tambah rekening pertama</button> : null}
          </div>
        </SettingsCard>

        <SettingsCard title="Kategori transaksi" description="Warna dan ikon dipakai di seluruh grafik." icon={Tag} tone="amber" className="lg:col-span-12">
          <div className="mb-4 flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] border border-brass/15 bg-white/70 p-1">
            {([["all", "Semua"], ["expense", "Keluar"], ["income", "Masuk"]] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setCategoryFilter(id)} className={cn("min-h-8 flex-1 whitespace-nowrap rounded-[10px] px-3 text-xs font-extrabold transition", categoryFilter === id ? "bg-pine text-white shadow-sm" : "text-ink-muted hover:bg-white hover:text-ink")}>{label}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => <div key={category.id} className="flex min-w-0 items-center gap-2.5 rounded-[15px] border p-2.5" style={{ backgroundColor: `${category.color}0B`, borderColor: `${category.color}24` }}><CategoryIcon icon={category.icon} color={category.color} size={15} containerSize="md" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-ink">{category.name}</p><p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</p></div></div>)}
          </div>
        </SettingsCard>
      </div>

      <footer className="flex flex-col gap-3 rounded-[22px] border border-pine/15 bg-[linear-gradient(110deg,rgba(239,236,255,.92),rgba(234,243,255,.8),rgba(229,248,241,.82))] p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-white text-pine shadow-2xs"><Info className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-ink">Pundi Personal Finance</p><p className="text-xs text-ink-muted">Next.js 16 · Appwrite · Versi 1.0.0</p></div></div><div className="flex items-center gap-2 rounded-full border border-mint/20 bg-white/70 px-3 py-2 text-xs font-bold text-mint"><ShieldCheck className="h-4 w-4" />Data cloud terlindungi</div></footer>

      <AccountManagerModal key={editingAccount?.id ?? "new-account"} open={accountModalOpen} account={editingAccount} onClose={() => setAccountModalOpen(false)} />
      <ProfileNameModal key={`profile-${displayName}`} open={profileOpen} currentName={displayName} email={displayEmail} onClose={() => setProfileOpen(false)} onSaved={setProfileName} />
    </div>
  );
}