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
import { ConnectHermesCard } from "@/components/penjaga/ConnectHermesCard";
import { PreferenceToggle } from "@/components/settings/PreferenceToggle";
import { deleteCategoryAction } from "@/actions/categories";
import { updatePreferencesAction } from "@/actions/preferences";
import { useToast } from "@/lib/context/ToastContext";
import { buildBackupPayload, downloadBackupJson } from "@/lib/utils/backupExport";
import dynamic from "next/dynamic";

// Modal pengaturan diunduh saat dibuka, bukan bersama halaman.
const AccountManagerModal = dynamic(() => import("@/components/settings/AccountManagerModal").then((m) => m.AccountManagerModal), { ssr: false });
const ProfileNameModal = dynamic(() => import("@/components/settings/ProfileNameModal").then((m) => m.ProfileNameModal), { ssr: false });
const CategoryFormModal = dynamic(() => import("@/components/settings/CategoryFormModal").then((m) => m.CategoryFormModal), { ssr: false });
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
  { value: "brand", label: "Biru (default)", swatch: "#2D4FE6" },
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

      <section className="hero-surface relative overflow-hidden rounded-panel p-5 text-white sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white/95 text-xl font-semibold text-brand-900 ring-4 ring-white/15 sm:h-20 sm:w-20">
            {preferences.avatarFileId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getAvatarUrl(preferences.avatarFileId)} alt="" className="h-full w-full object-cover" />
            ) : (
              displayName.split(" ").slice(0, 2).map((name) => name[0]).join("")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-lime"><ShieldCheck className="h-3.5 w-3.5" />Terverifikasi</p>
            <h2 className="figure-display mt-1 truncate text-[1.6rem] leading-tight text-white sm:text-[2rem]">{displayName}</h2>
            <p className="truncate text-sm text-white/80">{displayEmail}</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="hidden shrink-0 border-white/25 bg-white/10 text-white hover:bg-white/20 sm:inline-flex" onClick={() => setProfileOpen(true)}><Pencil className="h-3.5 w-3.5" />Ubah profil</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/80">
          {["Rupiah (IDR)", "1.234.567", "Bahasa Indonesia"].map((value) => <span key={value} className="rounded-full bg-white/10 px-2.5 py-1">{value}</span>)}
          <Button type="button" variant="outline" size="sm" className="ml-auto border-white/25 bg-white/10 text-white hover:bg-white/20 sm:hidden" onClick={() => setProfileOpen(true)}><Pencil className="h-3.5 w-3.5" />Ubah profil</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-12">

        <div id="penjaga" className="scroll-mt-24 lg:col-span-12">
          <SettingsCard title="Penjaga AI" description="Mesin chat Penjaga dan koneksi Hermes Agent lewat MCP." icon={ShieldCheck} tone="violet">
            <ConnectHermesCard />
          </SettingsCard>
        </div>

        <SettingsCard title="Preferensi aplikasi" description="Atur pengalaman harian tanpa meninggalkan halaman." icon={Palette} tone="mint" className="lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreferenceToggle label="Notifikasi pengingat" description="Peringatan anggaran dan transaksi penting." icon={BellRing} checked={preferences.notifications} onChange={(checked) => savePreference({ notifications: checked })} tone="pine" />
            <PreferenceToggle label="Insight otomatis" description="Ringkasan pola keuangan yang relevan." icon={Sparkles} checked={preferences.autoInsights} onChange={(checked) => savePreference({ autoInsights: checked })} tone="mint" />
            <PreferenceToggle label="Angka ringkas" description="Tampilkan jutaan sebagai jt pada ringkasan utama." icon={Database} checked={preferences.compactNumbers} onChange={(checked) => savePreference({ compactNumbers: checked })} tone="sky" />
            <div className="flex items-center gap-3 rounded-sm border border-rule bg-surface p-3.5 text-left"><Languages className="h-[18px] w-[18px] shrink-0 text-ink" /><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-ink">Bahasa &amp; wilayah</span><span className="mt-0.5 block text-xs text-ink-muted">Indonesia · Asia/Jakarta</span></span></div>
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
                    "flex flex-col items-center gap-1.5 rounded-sm border px-2 py-3 text-xs font-bold transition",
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
              <button key={account.id} type="button" onClick={() => openAccount(account)} className="group flex min-w-0 items-center gap-3 rounded-card border border-brand-600/10 bg-brand-50 p-3.5 text-left transition-colors hover:bg-brand-100">
                <span className="h-10 w-2 shrink-0 rounded-full" style={{ backgroundColor: account.colorTag }} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-ink">{account.name}</span><span className="mt-0.5 block truncate text-[11px] text-ink-muted">{accountTypeLabel[account.type] ?? account.type}</span></span>
                <span className="shrink-0 text-right"><span className="block text-sm font-black tabular-nums text-ink">{formatRupiah(account.balance)}</span><span className={cn("text-[10px] font-bold", account.isActive ? "text-mint" : "text-ink-muted")}>{account.isActive ? "Aktif" : "Nonaktif"}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-pine" />
              </button>
            ))}
            {!accounts.length && connection.status !== "loading" ? <button type="button" onClick={openNewAccount} className="rounded-card border border-dashed border-sky/30 bg-surface-high/60 p-6 text-sm font-bold text-sky">Tambah rekening pertama</button> : null}
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
          <div className="mb-4 flex max-w-full items-center gap-1 overflow-x-auto rounded-sm bg-brand-50 p-1">
            {([["all", "Semua"], ["expense", "Keluar"], ["income", "Masuk"]] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setCategoryFilter(id)} className={cn("min-h-10 sm:min-h-8 flex-1 whitespace-nowrap rounded-xs px-3 text-xs font-extrabold transition", categoryFilter === id ? "bg-pine text-white shadow-sm" : "text-ink-muted hover:bg-surface-high hover:text-ink")}>{label}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group flex min-w-0 items-center gap-1 rounded-sm border border-rule bg-surface-high pr-1 transition-colors hover:bg-brand-50"
              >
                <button type="button" onClick={() => openCategory(category)} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-sm p-2.5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                  <CategoryIcon icon={category.icon} color={category.color} size={15} containerSize="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-ink">{category.name}</span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</span>
                  </span>
                </button>
                <IconButton
                  variant="ghost"
                  className="tap-target h-7 min-h-7 w-7 shrink-0 transition-opacity hover:bg-ember-10 hover:text-ember [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
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

      {categoryModalOpen ? <CategoryFormModal key={`${editingCategory?.id ?? "new-category"}-${categoryModalOpen}`} open={categoryModalOpen} category={editingCategory} onClose={() => setCategoryModalOpen(false)} /> : null}

      <footer className="flex items-center gap-3 rounded-card border border-brand-600/10 bg-surface-high p-4 shadow-card sm:p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-brand-900 text-white shadow-card"><Info className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-ink">Pundi Personal Finance</p><p className="text-xs text-ink-muted">Next.js 16 · Appwrite · Versi 1.0.0</p></div></footer>

      {accountModalOpen ? <AccountManagerModal key={editingAccount?.id ?? "new-account"} open={accountModalOpen} account={editingAccount} onClose={() => setAccountModalOpen(false)} /> : null}
      {profileOpen ? <ProfileNameModal
        key={`profile-${displayName}`}
        open={profileOpen}
        currentName={displayName}
        email={displayEmail}
        avatarFileId={preferences.avatarFileId}
        isDemo={connection.mode !== "cloud"}
        onClose={() => setProfileOpen(false)}
        onSaved={setProfileName}
        onAvatarUploaded={(fileId) => dispatch({ type: "UPDATE_PREFERENCES", payload: { ...preferences, avatarFileId: fileId } })}
      /> : null}
    </div>
  );
}
