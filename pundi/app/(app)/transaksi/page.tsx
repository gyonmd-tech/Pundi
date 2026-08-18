"use client";

/**
 * app/(app)/transaksi/page.tsx
 * Daftar transaksi lengkap dengan search bar, filter panel multi-kriteria,
 * CategoryIcon visual, toast feedback, dan konfirmasi hapus modal.
 */

import React, { useState, useMemo } from "react";
import { useApp, useTransactions, useAccounts, useCategories } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import {
  Search, Filter, Plus, Trash2, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, ChevronDown, ChevronUp, X, Sparkles, Tag, Download,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TransactionType } from "@/lib/data/mock";
import { QuickAddTransaction } from "@/components/transaction/QuickAddTransaction";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const typeLabel: Record<TransactionType, { label: string; icon: any; color: string; bg: string }> = {
  income:   { label: "Pemasukan",   icon: ArrowUpRight,   color: "var(--color-pine)",   bg: "var(--color-pine-10)" },
  expense:  { label: "Pengeluaran", icon: ArrowDownLeft,  color: "var(--color-ember)",  bg: "var(--color-ember-10)" },
  transfer: { label: "Transfer",    icon: ArrowLeftRight, color: "var(--color-brass)",  bg: "var(--color-brass-10)" },
};

export default function TransaksiPage() {
  const { dispatch }  = useApp();
  const transactions  = useTransactions();
  const accounts      = useAccounts();
  const categories    = useCategories();
  const { showToast } = useToast();

  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState<TransactionType | "all">("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFrom, setFilterFrom]       = useState("");
  const [filterTo, setFilterTo]           = useState("");
  const [showFilter, setShowFilter]       = useState(false);
  const [addOpen, setAddOpen]             = useState(false);
  const [deleteId, setDeleteId]           = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterAccount !== "all" && tx.accountId !== filterAccount) return false;
      if (filterCategory !== "all" && tx.categoryId !== filterCategory) return false;
      if (filterFrom && new Date(tx.date) < new Date(filterFrom)) return false;
      if (filterTo   && new Date(tx.date) > new Date(filterTo + "T23:59:59")) return false;
      if (search) {
        const q = search.toLowerCase();
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        const match = [tx.note, cat?.name, acc?.name, ...tx.tags]
          .filter(Boolean).join(" ").toLowerCase();
        if (!match.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterAccount, filterCategory, filterFrom, filterTo, search, accounts, categories]);

  // Totals dari filtered list
  const totals = useMemo(() => ({
    income:   filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expense:  filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    transfer: filtered.filter(t => t.type === "transfer").reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  const activeFilters = [filterType !== "all", filterAccount !== "all", filterCategory !== "all", !!filterFrom, !!filterTo].filter(Boolean).length;

  function handleDelete(id: string) {
    const tx = transactions.find(t => t.id === id);
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    setDeleteId(null);
    showToast({
      type: "info",
      title: "Transaksi Dihapus",
      message: tx?.note ? `Transaksi "${tx.note}" telah dihapus.` : "Transaksi telah dihapus.",
    });
  }

  function resetFilters() {
    setFilterType("all");
    setFilterAccount("all");
    setFilterCategory("all");
    setFilterFrom("");
    setFilterTo("");
    setSearch("");
    showToast({
      type: "info",
      title: "Filter Direset",
      message: "Menampilkan semua transaksi tanpa filter.",
    });
  }

  function handleExportCSV() {
    const headers = ["ID", "Tanggal", "Tipe", "Nominal (IDR)", "Akun", "Kategori", "Catatan"];
    const rows = filtered.map((tx) => {
      const acc = accounts.find(a => a.id === tx.accountId);
      const cat = categories.find(c => c.id === tx.categoryId);
      return [
        `"${tx.id}"`,
        `"${new Date(tx.date).toISOString().slice(0, 10)}"`,
        `"${tx.type.toUpperCase()}"`,
        tx.amount,
        `"${(acc?.name || tx.accountId).replace(/"/g, '""')}"`,
        `"${(cat?.name || tx.categoryId || '').replace(/"/g, '""')}"`,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pundi-mutasi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: "success",
      title: "Ekspor Berhasil",
      message: `${filtered.length} data transaksi berhasil diunduh dalam file CSV.`,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-display-l font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Buku Transaksi
          </h1>
          <p className="text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Menampilkan <strong className="text-ink font-semibold">{filtered.length}</strong> dari {transactions.length} transaksi tercatat
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-card text-small font-semibold border shadow-2xs",
              "transition-all duration-200 hover:border-pine hover:bg-pine-10 hover:text-pine active:scale-95",
              "text-ink-muted bg-surface"
            )}
            style={{ borderColor: "var(--color-rule)", fontFamily: "var(--font-ui)" }}
            title="Download mutasi dalam format CSV"
          >
            <Download size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          {/* Add Transaction CTA */}
          <button
            onClick={() => setAddOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-card text-small font-semibold shadow-sm",
              "transition-all duration-200 hover:brightness-105 active:scale-95 group"
            )}
            style={{ backgroundColor: "var(--color-pine)", color: "white", fontFamily: "var(--font-ui)" }}
          >
            <Plus size={16} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* Summary 3-Strip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Pemasukan",   amount: totals.income,  color: "var(--color-pine)",  type: "income" },
          { label: "Total Pengeluaran",  amount: totals.expense, color: "var(--color-ember)", type: "expense" },
          {
            label: "Arus Kas Bersih",
            amount: totals.income - totals.expense,
            color: totals.income >= totals.expense ? "var(--color-pine)" : "var(--color-ember)",
            type: "net"
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-4 transition-all duration-200 hover:border-pine/30"
            style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1" style={{ fontFamily: "var(--font-ui)" }}>
              {s.label}
            </p>
            <p className="tabular-nums font-mono font-bold text-heading" style={{ color: s.color }}>
              {s.type === "net" && totals.income < totals.expense ? "−" : ""}
              {formatRupiah(Math.abs(s.amount))}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Bar with clear */}
        <div
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-card border transition-all duration-200 focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/15"
          style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
        >
          <Search size={16} strokeWidth={1.8} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari berdasarkan catatan, kategori, akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-small text-ink"
            style={{ fontFamily: "var(--font-ui)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-ink-muted hover:text-ink p-1 rounded-sm transition-colors"
              title="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-card border text-small font-medium relative transition-all duration-200",
            showFilter || activeFilters > 0
              ? "border-pine bg-pine-10 text-pine font-semibold"
              : "border-rule bg-surface text-ink-muted hover:text-ink hover:border-pine/50"
          )}
        >
          <Filter size={16} strokeWidth={1.8} />
          <span>Filter</span>
          {activeFilters > 0 && (
            <span
              className="w-5 h-5 rounded-full text-white text-[10px] font-mono font-bold flex items-center justify-center bg-pine"
            >
              {activeFilters}
            </span>
          )}
          {showFilter ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilter && (
        <div
          className="card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 animate-in fade-in slide-in-from-top-2"
          style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
        >
          {/* Filter Tipe */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Jenis Mutasi
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Jenis</option>
              <option value="income">Pemasukan (Masuk)</option>
              <option value="expense">Pengeluaran (Keluar)</option>
              <option value="transfer">Transfer Antar Akun</option>
            </select>
          </div>

          {/* Filter Akun */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Akun / Dompet
            </label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Akun</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === "income" ? "Masuk" : "Keluar"})</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Rentang Tanggal
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-1/2 px-2 py-1.5 rounded-card border text-xs outline-none bg-paper text-ink font-mono focus:border-pine"
                style={{ borderColor: "var(--color-rule)" }}
              />
              <span className="text-xs text-ink-muted">-</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-1/2 px-2 py-1.5 rounded-card border text-xs outline-none bg-paper text-ink font-mono focus:border-pine"
                style={{ borderColor: "var(--color-rule)" }}
              />
            </div>
          </div>

          {/* Reset Filters CTA */}
          {activeFilters > 0 && (
            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end pt-1 border-t border-rule/50">
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-ember hover:underline flex items-center gap-1.5 py-1"
              >
                <X size={14} /> Reset Filter ({activeFilters} aktif)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transaction Table Card */}
      <div className="card overflow-hidden p-0" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mb-3 text-ink-muted">
              <Search size={24} strokeWidth={1.5} />
            </div>
            <p className="text-body font-semibold text-ink mb-1" style={{ fontFamily: "var(--font-ui)" }}>
              Tidak ada transaksi yang cocok
            </p>
            <p className="text-small text-ink-muted max-w-sm" style={{ fontFamily: "var(--font-ui)" }}>
              Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat mutasi lainnya.
            </p>
            {activeFilters > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-card text-small font-medium border text-pine border-pine hover:bg-pine-10 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "var(--color-paper)", borderColor: "var(--color-rule)" }}>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Transaksi & Kategori</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted hidden md:table-cell">Sumber Akun</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted hidden sm:table-cell">Tipe</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted text-right">Nominal</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filtered.map((tx) => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const typeCfg = typeLabel[tx.type];
                  const TypeIcon = typeCfg.icon;

                  return (
                    <tr
                      key={tx.id}
                      className="group transition-colors duration-150 hover:bg-paper/80"
                    >
                      {/* Tanggal */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span suppressHydrationWarning className="text-small font-mono text-ink-muted">
                          {formatDate(tx.date, "short")}
                        </span>
                      </td>

                      {/* Deskripsi & Kategori */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-3">
                          <CategoryIcon icon={cat?.icon} color={cat?.color} size={15} containerSize="sm" />
                          <div className="min-w-0">
                            <p className="text-body font-semibold text-ink truncate group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                              {tx.note || cat?.name || "Transaksi Tanpa Catatan"}
                            </p>
                            <p className="text-xs text-ink-muted truncate font-ui">
                              {cat?.name ?? (tx.type === "transfer" ? "Transfer Antar Akun" : "Tanpa Kategori")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Akun */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: acc?.colorTag ?? "var(--color-rule)" }}
                          />
                          <span className="text-small font-medium text-ink truncate max-w-[130px]" style={{ fontFamily: "var(--font-ui)" }}>
                            {acc?.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Tipe Badge */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: typeCfg.bg,
                            color: typeCfg.color,
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          <TypeIcon size={12} strokeWidth={2.2} />
                          {typeCfg.label}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span
                          className="tabular-nums font-mono font-bold text-body"
                          style={{
                            color: tx.type === "income" ? "var(--color-pine)" : tx.type === "transfer" ? "var(--color-ink-muted)" : "var(--color-ink)",
                          }}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Delete Action with tooltip */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-card text-ink-muted hover:text-ember hover:bg-ember-10 transition-all duration-150"
                          title="Hapus transaksi"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 size={15} strokeWidth={1.8} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-card p-6 shadow-float border animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-ember-10 flex items-center justify-center text-ember mb-3">
              <Trash2 size={20} />
            </div>

            <h3 className="text-heading font-semibold text-ink mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Hapus Transaksi Ini?
            </h3>
            <p className="text-small text-ink-muted mb-5 leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
              Catatan transaksi ini akan dihapus dari buku kas. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-paper transition-colors"
                style={{ borderColor: "var(--color-rule)", fontFamily: "var(--font-ui)" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-ember hover:brightness-110 active:scale-95 transition-all shadow-sm"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddTransaction open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
