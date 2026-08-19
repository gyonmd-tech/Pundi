"use client";

/**
 * app/(app)/pengaturan/page.tsx
 * Pengaturan akun, profil, daftar dompet/wallet, dan katalog kategori
 * dengan CategoryIcon, toast feedback, dan interface terstruktur.
 */

import React, { useState } from "react";
import { useAccounts, useCategories } from "@/lib/data/store";
import { formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import {
  User, Wallet, Tag, Info, ChevronRight, ShieldCheck,
  CheckCircle2, BellRing, Sparkles, ExternalLink, HelpCircle
} from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils/cn";

const accountTypeLabel: Record<string, string> = {
  bank:        "Rekening Bank",
  ewallet:     "Dompet Digital (E-Wallet)",
  cash:        "Uang Tunai (Cash)",
  credit_card: "Kartu Kredit",
  investment:  "Rekening Investasi / Sekuritas",
};

export default function PengaturanPage() {
  const accounts      = useAccounts();
  const categories    = useCategories();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<"all" | "expense" | "income">("all");

  const filteredCategories = categories.filter((c) => {
    if (categoryFilter === "all") return true;
    return c.type === categoryFilter;
  });

  function handleAction(name: string) {
    showToast({
      type: "info",
      title: "Pengaturan Demo",
      message: `Fitur ubah ${name} bersifat statis dalam versi preview ini.`,
    });
  }

  return (
    <div className="space-y-5 max-w-3xl w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-display-l font-semibold tracking-tight leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Pengaturan & Preferensi
        </h1>
        <p className="text-xs sm:text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
          Kelola profil pengguna, sumber dana akun, dan katalog kategori
        </p>
      </div>

      {/* Demo Notice Alert Banner */}
      <div
        className="flex items-start gap-3.5 p-4 rounded-card border shadow-xs"
        style={{
          backgroundColor: "var(--color-pine-10)",
          borderColor: "var(--color-pine)",
          borderLeftWidth: "4px",
        }}
      >
        <div className="w-8 h-8 rounded-full bg-pine/15 flex items-center justify-center flex-shrink-0 text-pine mt-0.5">
          <ShieldCheck size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-small font-semibold text-pine leading-tight" style={{ fontFamily: "var(--font-ui)" }}>
            Mode Portfolio & Preview Aktif
          </p>
          <p className="text-xs text-pine/80 mt-1 leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
            Aplikasi berjalan dengan data sintetis terpusat (in-memory). Semua perubahan transaksi, anggaran, aset, dan tujuan tersimpan langsung secara reaktif di browser Anda.
          </p>
        </div>
      </div>

      {/* Profil Section Card */}
      <div className="card p-4 sm:p-5 space-y-4" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-rule">
          <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
            <User size={16} />
          </div>
          <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
            Profil Pengguna
          </h2>
        </div>

        <ul className="divide-y divide-rule/60">
          {[
            { label: "Nama Lengkap",   value: "Sarah Dewi",         keyName: "nama" },
            { label: "Alamat Email",   value: "sarah.dewi@email.com", keyName: "email" },
            { label: "Mata Uang Utama", value: "Rupiah Indonesia (IDR)", keyName: "mata uang" },
            { label: "Format Angka",    value: "1.234.567 (Standar ID)", keyName: "format" },
          ].map((item) => (
            <li
              key={item.label}
              onClick={() => handleAction(item.keyName)}
              className="flex items-center justify-between py-3 cursor-pointer group hover:bg-paper/60 px-2 rounded-card transition-colors gap-2"
            >
              <span className="text-xs xs:text-small text-ink-muted group-hover:text-ink font-medium flex-shrink-0" style={{ fontFamily: "var(--font-ui)" }}>
                {item.label}
              </span>
              <div className="flex items-center gap-1.5 min-w-0 justify-end">
                <span className="text-xs xs:text-small font-semibold text-ink truncate text-right" style={{ fontFamily: "var(--font-ui)" }}>
                  {item.value}
                </span>
                <ChevronRight size={15} className="text-ink-muted group-hover:text-pine transition-colors flex-shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Accounts & Wallets List Card */}
      <div className="card p-5 space-y-4" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
              Daftar Akun & Dompet
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {accounts.length} terdaftar
          </span>
        </div>

        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3 rounded-card border bg-paper/60 hover:bg-paper transition-all group"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: acc.colorTag }}
                />
                <div className="min-w-0">
                  <p className="text-body font-semibold text-ink truncate group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                    {acc.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {accountTypeLabel[acc.type] ?? acc.type}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="tabular-nums font-mono font-bold text-body text-ink">
                  {formatRupiah(acc.balance)}
                </p>
                <span className="text-[10px] text-pine font-medium">Aktif</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Catalog Card */}
      <div className="card p-5 space-y-4" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between pb-3 border-b border-rule flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
              <Tag size={16} />
            </div>
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
              Katalog Kategori Transaksi
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-paper p-1 rounded-card border border-rule">
            {[
              { id: "all", label: "Semua" },
              { id: "expense", label: "Pengeluaran" },
              { id: "income", label: "Pemasukan" },
            ].map((f) => {
              const isSelected = categoryFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-card text-xs font-semibold transition-all active:scale-95",
                    isSelected ? "shadow-xs" : "hover:text-ink"
                  )}
                  style={{
                    backgroundColor: isSelected ? "var(--color-pine)" : "transparent",
                    color: isSelected ? "#FFFFFF" : "var(--color-ink-muted)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 p-2.5 rounded-card border bg-paper/50 hover:bg-paper transition-all group"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={15} containerSize="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-ink truncate group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                  {cat.name}
                </p>
                <p className="text-[10px] text-ink-muted uppercase font-mono tracking-wider">
                  {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About App Section */}
      <div className="card p-5 space-y-3 text-xs text-ink-muted" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between font-ui">
          <span>Pundi Personal Finance Dashboard</span>
          <span className="font-mono text-ink font-semibold">Versi 1.0.0 (Demo Release)</span>
        </div>
        <div className="flex items-center justify-between border-t border-rule/50 pt-2 font-ui">
          <span>Desain & Arsitektur</span>
          <span className="font-semibold text-ink">Rumah Design · Next.js 16 · Appwrite DB</span>
        </div>
      </div>
    </div>
  );
}
