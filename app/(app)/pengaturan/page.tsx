"use client";

import { useState } from "react";
import {
  BellRing,
  ChevronRight,
  Database,
  Info,
  Languages,
  Palette,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
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
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
      <header>
        <div>
          <p className="eyebrow">Personalisasi Pundi</p>
          <h1 className="page-title mt-1">Pengaturan &amp; Preferensi</h1>
          <p className="page-subtitle max-w-2xl">Kelola profil, sumber dana, tampilan, dan kategori transaksi dari satu tempat.</p>
        </div>
      </header>

      <Card variant="highlight" className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-12 -top-20 h-44 w-44 rounded-full border-[26px] border-white/10" />
        <div className="absolute -bottom-28 -left-12 h-44 w-44 rounded-full bg-brand-500/35" />
        <div className="relative flex flex-col items-center justify-center text-center sm:flex-row sm:text-left">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-white text-2xl font-black text-brand-900 shadow-[0_14px_30px_rgba(17,39,114,.24)]">
            {displayName.split(" ").slice(0, 2).map((name) => name[0]).join("")}
          </div>
          <div className="mt-4 min-w-0 sm:ml-5 sm:mt-0">
            <Badge tone="success"><ShieldCheck className="h-3.5 w-3.5" />Terverifikasi</Badge>
            <h2 className="mt-2 truncate text-3xl font-bold tracking-[-0.035em] text-white">{displayName}</h2>
            <p className="mt-0.5 truncate text-sm font-medium text-white/70">{displayEmail}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setProfileOpen(true)}><Pencil className="h-3.5 w-3.5" />Ubah profil</Button>
          </div>
        </div>
        <div className="relative mt-7 grid overflow-hidden rounded-[20px] border border-white/15 bg-brand-900/55 sm:grid-cols-2 xl:grid-cols-4">
          {[["Nama lengkap", displayName], ["Mata uang", "Rupiah Indonesia (IDR)"], ["Format angka", "1.234.567"], ["Bahasa", "Bahasa Indonesia"]].map(([label, value], index) => (
            <button key={label} type="button" disabled={index !== 0} onClick={index === 0 ? () => setProfileOpen(true) : undefined} className="min-w-0 border-b border-white/10 px-4 py-3.5 text-center last:border-b-0 disabled:cursor-default sm:border-r sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-child(3)]:border-b-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:[&:nth-child(3)]:border-r xl:last:border-r-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">{label}</span>
              <span className="mt-1.5 block truncate text-sm font-bold text-white">{value}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-12">

        <SettingsCard title="Preferensi aplikasi" description="Atur pengalaman harian tanpa meninggalkan halaman." icon={Palette} tone="mint" className="lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreferenceToggle label="Notifikasi pengingat" description="Peringatan anggaran dan transaksi penting." icon={BellRing} checked={notifications} onChange={setNotifications} tone="pine" />
            <PreferenceToggle label="Insight otomatis" description="Ringkasan pola keuangan yang relevan." icon={Sparkles} checked={autoInsights} onChange={setAutoInsights} tone="mint" />
            <PreferenceToggle label="Angka ringkas" description="Tampilkan jutaan sebagai jt pada ringkasan." icon={Database} checked={compactNumbers} onChange={setCompactNumbers} tone="sky" />
            <div className="flex items-center gap-3 rounded-[18px] bg-brand-50 p-3.5 text-left sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-brand-900 text-white"><Languages className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-ink">Bahasa &amp; wilayah</span><span className="mt-0.5 block text-xs text-ink-muted">Indonesia · Asia/Jakarta</span></span></div>
          </div>
        </SettingsCard>

        <SettingsCard title="Akun & dompet" description="Tambah, ubah, nonaktifkan, atau hapus sumber dana." icon={Wallet} tone="blue" className="lg:col-span-6" action={<Button type="button" size="sm" onClick={openNewAccount}><Plus className="h-3.5 w-3.5" />Tambah</Button>}>
          <div className="grid gap-3">
            {accounts.map((account) => (
              <button key={account.id} type="button" onClick={() => openAccount(account)} className="group flex min-w-0 items-center gap-3 rounded-[18px] border border-brand-600/10 bg-brand-50 p-3.5 text-left transition-colors hover:bg-brand-100">
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
          <div className="mb-4 flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] bg-brand-50 p-1">
            {([["all", "Semua"], ["expense", "Keluar"], ["income", "Masuk"]] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setCategoryFilter(id)} className={cn("min-h-8 flex-1 whitespace-nowrap rounded-[10px] px-3 text-xs font-extrabold transition", categoryFilter === id ? "bg-pine text-white shadow-sm" : "text-ink-muted hover:bg-white hover:text-ink")}>{label}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => <div key={category.id} className="flex min-w-0 items-center gap-2.5 rounded-[15px] border border-brand-600/10 bg-white p-2.5"><CategoryIcon icon={category.icon} color={category.color} size={15} containerSize="md" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-ink">{category.name}</p><p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</p></div></div>)}
          </div>
        </SettingsCard>
      </div>

      <footer className="flex items-center gap-3 rounded-[22px] border border-brand-600/10 bg-white p-4 shadow-card sm:p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-brand-900 text-white shadow-card"><Info className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-ink">Pundi Personal Finance</p><p className="text-xs text-ink-muted">Next.js 16 · Appwrite · Versi 1.0.0</p></div></footer>

      <AccountManagerModal key={editingAccount?.id ?? "new-account"} open={accountModalOpen} account={editingAccount} onClose={() => setAccountModalOpen(false)} />
      <ProfileNameModal key={`profile-${displayName}`} open={profileOpen} currentName={displayName} email={displayEmail} onClose={() => setProfileOpen(false)} onSaved={setProfileName} />
    </div>
  );
}
