"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  BellRing,
  Check,
  ChevronRight,
  Database,
  Download,
  History,
  Info,
  Languages,
  Monitor,
  Moon,
  Palette,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { useAccounts, useApp, useCategories, usePreferences, DEMO_PREFERENCES_STORAGE_KEY } from "@/lib/data/store";
import type { Account, AccentColor, Category, ThemeMode, UserPreferences } from "@/lib/data/mock";
import { formatRupiah } from "@/lib/utils/formatter";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button, IconButton } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { PreferenceToggle } from "@/components/settings/PreferenceToggle";
import { AccountManagerModal } from "@/components/settings/AccountManagerModal";
import { ProfileNameModal } from "@/components/settings/ProfileNameModal";
import { CategoryFormModal } from "@/components/settings/CategoryFormModal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { deleteCategoryAction } from "@/actions/categories";
import { updatePreferencesAction } from "@/actions/preferences";
import { useToast } from "@/lib/context/ToastContext";
import { buildBackupPayload, downloadBackupJson } from "@/lib/utils/backupExport";
import { getAvatarUrl } from "@/lib/appwrite/storage";

const accountTypeLabel: Record<string, string> = {
  bank: "Rekening bank",
  ewallet: "Dompet digital",
  cash: "Uang tunai",
  credit_card: "Kartu kredit",
  investment: "Investasi",
};

type CategoryFilter = "all" | "expense" | "income";

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Ikuti sistem", icon: Monitor },
];

const accentOptions: { value: AccentColor; label: string; swatch: string }[] = [
  { value: "brand", label: "Biru (default)", swatch: "#2459DE" },
  { value: "mint", label: "Hijau", swatch: "#159B78" },
  { value: "ember", label: "Merah", swatch: "#E95766" },
  { value: "lavender", label: "Ungu", swatch: "#7B61D1" },
  { value: "cyan", label: "Cyan", swatch: "#168AA0" },
];

export default function PengaturanPage() {
  const accounts = useAccounts();
  const categories = useCategories();
  const preferences = usePreferences();
  const { state, dispatch, connection } = useApp();
  const { showToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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

  function openNewCategory() {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  }

  function openCategory(category: Category) {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  }

  async function savePreference(partial: Partial<UserPreferences>) {
    const merged = { ...preferences, ...partial };
    dispatch({ type: "UPDATE_PREFERENCES", payload: merged });
    if ((connection.mode === "demo" || connection.mode === "guest") && typeof window !== "undefined") {
      try {
        localStorage.setItem(DEMO_PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // localStorage tidak tersedia — preferensi tetap berlaku untuk sesi ini saja.
      }
      return;
    }
    const result = await updatePreferencesAction(partial);
    if (!result.success) {
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
      showToast({ type: "error", title: "Preferensi gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
    }
  }

  function handleDownloadBackup() {
    const payload = buildBackupPayload({
      accounts: state.accounts,
      categories: state.categories,
      transactions: state.transactions,
      budgets: state.budgets,
      goals: state.goals,
      assets: state.assets,
      insights: state.insights,
      debts: state.debts,
      recurringRules: state.recurringRules,
    });
    downloadBackupJson(payload);
    showToast({ type: "success", title: "Cadangan Diunduh", message: "Seluruh datamu tersimpan dalam satu file JSON." });
  }

  async function handleDeleteCategory(category: Category, event: MouseEvent) {
    event.stopPropagation();
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    const result = await deleteCategoryAction(category.id);
    if (!result.success) {
      showToast({ type: "error", title: "Kategori tidak bisa dihapus", message: result.error || "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_CATEGORY", payload: category.id });
    showToast({ type: "info", title: "Kategori Dihapus", message: `${category.name} telah dihapus.` });
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

      <Card variant="highlight" className="relative overflow-hidden p-5 sm:p-8">
        <div className="absolute -right-12 -top-20 h-44 w-44 rounded-full border-[26px] border-white/10" />
        <div className="absolute -bottom-28 -left-12 h-44 w-44 rounded-full bg-brand-500/35" />
        <div className="relative flex flex-col items-center justify-center text-center sm:flex-row sm:text-left">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[24px] bg-surface-high sm:h-24 sm:w-24 sm:rounded-[28px] text-2xl font-black text-brand-900 shadow-[0_14px_30px_rgba(17,39,114,.24)]">
            {preferences.avatarFileId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getAvatarUrl(preferences.avatarFileId)} alt="" className="h-full w-full object-cover" />
            ) : (
              displayName.split(" ").slice(0, 2).map((name) => name[0]).join("")
            )}
          </div>
          <div className="mt-4 min-w-0 sm:ml-5 sm:mt-0">
            <Badge tone="success"><ShieldCheck className="h-3.5 w-3.5" />Terverifikasi</Badge>
            <h2 className="mt-2 truncate text-2xl font-bold sm:text-3xl tracking-[-0.035em] text-white">{displayName}</h2>
            <p className="mt-0.5 truncate text-sm font-medium text-white/70">{displayEmail}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setProfileOpen(true)}><Pencil className="h-3.5 w-3.5" />Ubah profil</Button>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-2 overflow-hidden rounded-[20px] border border-white/15 bg-brand-900/55 sm:mt-7 xl:grid-cols-4">
          {[["Nama lengkap", displayName], ["Mata uang", "Rupiah Indonesia (IDR)"], ["Format angka", "1.234.567"], ["Bahasa", "Bahasa Indonesia"]].map(([label, value], index) => (
            <button key={label} type="button" disabled={index !== 0} onClick={index === 0 ? () => setProfileOpen(true) : undefined} className="min-w-0 border-b border-r border-white/10 px-3 py-3 text-center disabled:cursor-default sm:px-4 sm:py-3.5 [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(4)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:[&:nth-child(3)]:border-r xl:last:border-r-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">{label}</span>
              <span className="mt-1.5 block break-words text-[13px] font-bold leading-snug text-white sm:truncate sm:text-sm">{value}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-12">

        <SettingsCard title="Preferensi aplikasi" description="Atur pengalaman harian tanpa meninggalkan halaman." icon={Palette} tone="mint" className="lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreferenceToggle label="Notifikasi pengingat" description="Peringatan anggaran dan transaksi penting." icon={BellRing} checked={preferences.notifications} onChange={(checked) => savePreference({ notifications: checked })} tone="pine" />
            <PreferenceToggle label="Insight otomatis" description="Ringkasan pola keuangan yang relevan." icon={Sparkles} checked={preferences.autoInsights} onChange={(checked) => savePreference({ autoInsights: checked })} tone="mint" />
            <PreferenceToggle label="Angka ringkas" description="Tampilkan jutaan sebagai jt pada ringkasan utama." icon={Database} checked={preferences.compactNumbers} onChange={(checked) => savePreference({ compactNumbers: checked })} tone="sky" />
            <div className="flex items-center gap-3 rounded-[18px] bg-brand-50 p-3.5 text-left sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-brand-900 text-white"><Languages className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-ink">Bahasa &amp; wilayah</span><span className="mt-0.5 block text-xs text-ink-muted">Indonesia · Asia/Jakarta</span></span></div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-bold text-ink-muted">Akun default untuk transaksi baru</label>
            <Select value={preferences.defaultAccountId || ""} onChange={(event) => savePreference({ defaultAccountId: event.target.value || undefined })}>
              <option value="">Tidak ditentukan (pakai akun pertama)</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </Select>
          </div>
        </SettingsCard>

        <SettingsCard title="Tampilan" description="Tema dan warna aksen — tersimpan ke akunmu." icon={Palette} tone="violet" className="lg:col-span-6">
          <div>
            <p className="mb-1.5 text-xs font-bold text-ink-muted">Tema</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => savePreference({ theme: value })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-[14px] border px-2 py-3 text-xs font-bold transition",
                    preferences.theme === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-rule text-ink-muted hover:bg-paper",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-bold text-ink-muted">Warna aksen</p>
            <div className="flex flex-wrap gap-2">
              {accentOptions.map(({ value, label, swatch }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => savePreference({ accentColor: value })}
                  aria-label={label}
                  title={label}
                  className="grid h-9 w-9 place-items-center rounded-full transition"
                  style={{ backgroundColor: swatch, boxShadow: preferences.accentColor === value ? `0 0 0 3px var(--color-surface-high), 0 0 0 5px ${swatch}` : "none" }}
                >
                  {preferences.accentColor === value ? <Check size={15} className="text-white" /> : null}
                </button>
              ))}
            </div>
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
            {!accounts.length && connection.status !== "loading" ? <button type="button" onClick={openNewAccount} className="rounded-[18px] border border-dashed border-sky/30 bg-surface-high/60 p-6 text-sm font-bold text-sky">Tambah rekening pertama</button> : null}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Kategori transaksi"
          description="Warna dan ikon dipakai di seluruh grafik."
          icon={Tag}
          tone="amber"
          className="lg:col-span-12"
          action={<Button type="button" size="sm" onClick={openNewCategory}><Plus className="h-3.5 w-3.5" />Tambah</Button>}
        >
          <div className="mb-4 flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] bg-brand-50 p-1">
            {([["all", "Semua"], ["expense", "Keluar"], ["income", "Masuk"]] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setCategoryFilter(id)} className={cn("min-h-8 flex-1 whitespace-nowrap rounded-[10px] px-3 text-xs font-extrabold transition", categoryFilter === id ? "bg-pine text-white shadow-sm" : "text-ink-muted hover:bg-surface-high hover:text-ink")}>{label}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => openCategory(category)}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCategory(category); } }}
                className="group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[15px] border border-brand-600/10 bg-surface-high p-2.5 text-left transition-colors hover:bg-brand-50"
              >
                <CategoryIcon icon={category.icon} color={category.color} size={15} containerSize="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-ink">{category.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
                </div>
                <IconButton
                  variant="ghost"
                  className="h-7 min-h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ember-10 hover:text-ember"
                  aria-label={`Hapus kategori ${category.name}`}
                  onClick={(event) => handleDeleteCategory(category, event)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            ))}
            {!filteredCategories.length ? <p className="col-span-full py-6 text-center text-xs text-ink-muted">Belum ada kategori pada filter ini.</p> : null}
          </div>
        </SettingsCard>

        <SettingsCard title="Backup & Data" description="Unduh salinan seluruh datamu kapan saja." icon={Database} tone="blue" className="lg:col-span-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-ink-muted max-w-lg">
              Berisi semua akun, kategori, transaksi, anggaran, tujuan, aset, utang/piutang, aturan berulang, dan insight dalam satu file JSON — simpan sebagai cadangan pribadi. Fitur impor/pulihkan belum tersedia.
            </p>
            <Button type="button" variant="outline" onClick={handleDownloadBackup}>
              <Download className="h-3.5 w-3.5" /> Unduh cadangan (.json)
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard title="Aktivitas" description="Riwayat lengkap perubahan data, manual maupun otomatis." icon={History} tone="mint" className="lg:col-span-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-ink-muted max-w-lg">
              Setiap perubahan pada rekening, transaksi, anggaran, tujuan, aset, utang, kategori, dan aturan berulang tercatat lengkap dengan nilai sebelum &amp; sesudah.
            </p>
            <Link href="/pengaturan/log-aktivitas">
              <Button type="button" variant="outline"><History className="h-3.5 w-3.5" /> Lihat semua aktivitas</Button>
            </Link>
          </div>
        </SettingsCard>
      </div>

      <CategoryFormModal key={`${editingCategory?.id ?? "new-category"}-${categoryModalOpen}`} open={categoryModalOpen} category={editingCategory} onClose={() => setCategoryModalOpen(false)} />

      <footer className="flex items-center gap-3 rounded-[22px] border border-brand-600/10 bg-surface-high p-4 shadow-card sm:p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-brand-900 text-white shadow-card"><Info className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-ink">Pundi Personal Finance</p><p className="text-xs text-ink-muted">Next.js 16 · Appwrite · Versi 1.0.0</p></div></footer>

      <AccountManagerModal key={editingAccount?.id ?? "new-account"} open={accountModalOpen} account={editingAccount} onClose={() => setAccountModalOpen(false)} />
      <ProfileNameModal
        key={`profile-${displayName}`}
        open={profileOpen}
        currentName={displayName}
        email={displayEmail}
        avatarFileId={preferences.avatarFileId}
        isDemo={connection.mode !== "cloud"}
        onClose={() => setProfileOpen(false)}
        onSaved={setProfileName}
        onAvatarUploaded={(fileId) => dispatch({ type: "UPDATE_PREFERENCES", payload: { ...preferences, avatarFileId: fileId } })}
      />
    </div>
  );
}
