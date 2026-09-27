"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
/**
 * app/(app)/transaksi/page.tsx
 * Daftar transaksi lengkap dengan search bar, filter panel multi-kriteria,
 * CategoryIcon visual, toast feedback, dan konfirmasi hapus modal.
 */

import React, { useState, useMemo } from "react";
import { useApp, useTransactions, useAccounts, useCategories } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { downloadExcel } from "@/lib/utils/excelExport";
import { useToast } from "@/lib/context/ToastContext";
import {
  Search, Filter, Plus, Trash2, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, FileSpreadsheet, Pencil, Banknote, Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Transaction, TransactionType } from "@/lib/data/mock";
import { useQuickAdd } from "@/lib/context/QuickAddContext";
import { deleteTransactionAction } from "@/actions/transactions";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { QuickAddPanel } from "@/components/transaction/QuickAddPanel";

const typeLabel: Record<TransactionType, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  income:   { label: "Pemasukan",   icon: ArrowUpRight,   color: "var(--color-pine)",   bg: "var(--color-pine-10)" },
  expense:  { label: "Pengeluaran", icon: ArrowDownLeft,  color: "var(--color-ember)",  bg: "var(--color-ember-10)" },
  transfer: { label: "Transfer",    icon: ArrowLeftRight, color: "var(--color-brass)",  bg: "var(--color-brass-10)" },
};

const cashWithdrawalLabel = { label: "Tarik tunai", icon: Banknote, color: "#2563EB", bg: "#EFF6FF" };

function formatRecordedDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

export default function TransaksiPage() {
  const { dispatch }  = useApp();
  const transactions  = useTransactions();
  const accounts      = useAccounts();
  const categories    = useCategories();
  const { showToast } = useToast();
  const { openQuickAdd } = useQuickAdd();

  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState<TransactionType | "all">("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFrom, setFilterFrom]       = useState("");
  const [filterTo, setFilterTo]           = useState("");
  const [showFilter, setShowFilter]       = useState(false);
  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterAccount !== "all" && tx.accountId !== filterAccount && tx.destinationAccountId !== filterAccount) return false;
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
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pagedTransactions = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function handleDelete(id: string) {
    const tx = transactions.find(t => t.id === id);
    const result = await deleteTransactionAction(id);
    if (!result.success) {
      showToast({
        type: "error",
        title: "Transaksi gagal dihapus",
        message: result.error || "Koneksi penyimpanan sedang bermasalah.",
      });
      return;
    }
    const balanceChanges = new Map<string, number>();
    if (tx?.type === "income") balanceChanges.set(tx.accountId, -tx.amount);
    if (tx?.type === "expense") balanceChanges.set(tx.accountId, tx.amount);
    if (tx?.type === "transfer" && tx.destinationAccountId) {
      balanceChanges.set(tx.accountId, tx.amount);
      balanceChanges.set(tx.destinationAccountId, -tx.amount);
    }
    for (const [accountId, delta] of balanceChanges) {
      const account = accounts.find((item) => item.id === accountId);
      if (account) dispatch({ type: "UPDATE_ACCOUNT", payload: { ...account, balance: account.balance + delta } });
    }
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
    setCurrentPage(1);
    showToast({
      type: "info",
      title: "Filter Direset",
      message: "Menampilkan semua transaksi tanpa filter.",
    });
  }

  async function handleExportExcel() {
    if (filtered.length === 0) {
      showToast({
        type: "info",
        title: "Tidak Ada Data",
        message: "Tidak ada transaksi untuk diekspor. Sesuaikan filter terlebih dahulu.",
      });
      return;
    }

    // Periode dari filter tanggal
    let period = "Semua Periode";
    if (filterFrom && filterTo) {
      period = `${filterFrom} s/d ${filterTo}`;
    } else if (filterFrom) {
      period = `Mulai ${filterFrom}`;
    } else if (filterTo) {
      period = `Hingga ${filterTo}`;
    }

    // Rangkum filter aktif
    const filterParts: string[] = [];
    if (filterType !== "all") filterParts.push(`Jenis: ${typeLabel[filterType as TransactionType]?.label ?? filterType}`);
    if (filterAccount !== "all") {
      const acc = accounts.find(a => a.id === filterAccount);
      if (acc) filterParts.push(`Akun: ${acc.name}`);
    }
    if (filterCategory !== "all") {
      const cat = categories.find(c => c.id === filterCategory);
      if (cat) filterParts.push(`Kategori: ${cat.name}`);
    }
    if (search) filterParts.push(`Cari: "${search}"`);

    const exportDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date());

    const totalIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netFlow      = totalIncome - totalExpense;

    const transactions = filtered.map(tx => {
      const acc = accounts.find(a => a.id === tx.accountId);
      const cat = categories.find(c => c.id === tx.categoryId);
      const typeIndo =
        tx.type === "income"  ? "Pemasukan"  :
        tx.type === "expense" ? "Pengeluaran" : "Transfer";
      const signedAmount =
        tx.type === "income"  ?  tx.amount :
        tx.type === "expense" ? -tx.amount : tx.amount;

      return {
        date:        new Date(tx.date).toISOString().slice(0, 10),
        type:        tx.type,
        typeLabel:   typeIndo,
        amount:      signedAmount,
        accountName: acc?.name ?? "-",
        category:    cat?.name ?? (tx.type === "transfer" ? "Transfer" : "-"),
        note:        tx.note ?? "-",
        tags:        tx.tags?.join(" | ") ?? "-",
        id:          tx.id,
      } as const;
    });

    try {
      await downloadExcel({
        reportTitle:   "Laporan Mutasi Transaksi",
        period,
        exportDate,
        activeFilters: filterParts.length > 0 ? filterParts.join("  |  ") : "Tanpa filter tambahan",
        transactions,
        totals: { income: totalIncome, expense: totalExpense, netFlow, count: filtered.length },
      });

      showToast({
        type: "success",
        title: "Unduhan Berhasil",
        message: `${filtered.length} transaksi berhasil diunduh sebagai file Excel (.xlsx)`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Gagal Mengunduh",
        message: "Terjadi kesalahan saat membuat file Excel. Silakan coba lagi.",
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Buku Transaksi
          </h1>
          <p className="text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Menampilkan <strong className="text-ink font-semibold">{filtered.length}</strong> dari {transactions.length} transaksi tercatat
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Unduh Excel Button */}
          <button
            onClick={handleExportExcel}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-card text-small font-semibold border shadow-2xs",
              "transition-all duration-200 hover:border-pine hover:bg-pine-10 hover:text-pine active:scale-95",
              "text-ink-muted bg-surface"
            )}
            style={{ borderColor: "var(--color-rule)", fontFamily: "var(--font-ui)" }}
            title="Unduh mutasi sebagai file Excel (.xlsx) — sudah berformat rapih"
          >
            <FileSpreadsheet size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Unduh Excel</span>
          </button>

          {/* Add Transaction CTA */}
          <button
            onClick={openQuickAdd}
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
            className={cn("card p-4 transition-all duration-200", s.type === "income" ? "!bg-[#B7E1D2]" : s.type === "expense" ? "!bg-[#F0BFC7]" : "!bg-[#C8C0EB]")}
            style={{ background: s.type === "income" ? "#B7E1D2" : s.type === "expense" ? "#F0BFC7" : "#C8C0EB" }}
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
        <div className="flex flex-1 items-center gap-2.5 border-b-2 border-[#7565C7] px-1 py-2 transition-all duration-200 focus-within:border-[#372B86]">
          <Search size={16} strokeWidth={1.8} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari catatan, kategori, atau akun..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-small font-bold text-ink outline-none placeholder:font-medium placeholder:text-[#655E78]"
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
              : "border-[#AFA4CF] bg-[#D8D1EA] text-[#514A67] shadow-clay-soft hover:text-ink hover:border-pine/50"
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
          className="card grid grid-cols-1 gap-3.5 bg-[#CFC7E8] p-4 sm:grid-cols-2 md:grid-cols-4 animate-in fade-in slide-in-from-top-2"
        >
          {/* Filter Tipe */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Jenis Mutasi
            </label>
            <Select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as TransactionType | "all"); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Jenis</option>
              <option value="income">Pemasukan (Masuk)</option>
              <option value="expense">Pengeluaran (Keluar)</option>
              <option value="transfer">Transfer Antar Akun</option>
            </Select>
          </div>

          {/* Filter Akun */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Akun / Dompet
            </label>
            <Select
              value={filterAccount}
              onChange={(e) => { setFilterAccount(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Akun</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Kategori
            </label>
            <Select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-card border text-small outline-none bg-paper text-ink font-medium focus:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === "income" ? "Masuk" : "Keluar"})</option>
              ))}
            </Select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Rentang Tanggal
            </label>
            <div className="grid grid-cols-1 gap-2">
              <DatePicker value={filterFrom} onValueChange={(value) => { setFilterFrom(value); setCurrentPage(1); }} ariaLabel="Tanggal mulai" />
              <DatePicker value={filterTo} onValueChange={(value) => { setFilterTo(value); setCurrentPage(1); }} min={filterFrom || undefined} ariaLabel="Tanggal akhir" />
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

      {/* Transaction Records Card / Table */}
      <div className="overflow-hidden rounded-[25px] bg-[#BBB1DF] p-2 shadow-clay">
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
          <>
            {/* ── Mobile Card List View (<768px) ── */}
            <div className="space-y-2 md:hidden">
              {pagedTransactions.map((tx, rowIndex) => {
                const acc = accounts.find((a) => a.id === tx.accountId);
                const cat = categories.find((c) => c.id === tx.categoryId);
                const destination = accounts.find((a) => a.id === tx.destinationAccountId);
                const typeCfg = tx.transferKind === "cash_withdrawal" ? cashWithdrawalLabel : typeLabel[tx.type];
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={tx.id}
                    onClick={() => setDetailTransaction(tx)}
                    className={cn("flex items-center justify-between gap-3 rounded-[18px] p-3.5 shadow-clay-soft transition sm:p-4", rowIndex % 2 ? "bg-[#B7DDE1]" : "bg-[#D6CDF1]", "hover:-translate-y-0.5 hover:bg-[#AFA2DA]")}
                  >
                    {/* Left: Category Icon + Description & Metadata */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <CategoryIcon icon={cat?.icon} color={cat?.color} size={16} containerSize="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-small sm:text-body font-semibold text-ink leading-snug break-words" style={{ fontFamily: "var(--font-ui)" }}>
                          {tx.note || cat?.name || "Transaksi Tanpa Catatan"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-1 flex-wrap font-ui">
                          <span className="font-medium text-ink/80">{tx.recordKind === "balance_adjustment" ? "Catatan kondisi saldo" : cat?.name ?? (tx.transferKind === "cash_withdrawal" ? "Tarik tunai" : tx.type === "transfer" ? "Transfer" : "Lainnya")}</span>
                          <span className="text-rule">·</span>
                          <span suppressHydrationWarning className="font-mono text-[11px]">Transaksi {formatDate(tx.date, "short")}</span>
                          <span className="text-rule">·</span>
                          <span suppressHydrationWarning className="text-[10px]">Dicatat {formatRecordedDate(tx.createdAt || tx.date)}</span>
                          <span className="text-rule">·</span>
                          <div className="inline-flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: acc?.colorTag ?? "var(--color-rule)" }}
                            />
                            <span className="text-[11px] truncate max-w-[150px]">{acc?.name ?? "—"}{destination ? ` → ${destination.name}` : ""}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Nominal Amount + Type Badge + Action */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className="tabular-nums font-mono font-bold text-small sm:text-body"
                        style={{
                          color: tx.type === "income" ? "var(--color-pine)" : tx.type === "transfer" ? "var(--color-ink-muted)" : "var(--color-ink)",
                        }}
                      >
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}{formatRupiah(tx.amount)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}
                        >
                          <TypeIcon size={10} strokeWidth={2.2} />
                          {typeCfg.label}
                        </span>
                        {tx.recordKind !== "balance_adjustment" ? <button
                          onClick={(event) => { event.stopPropagation(); setEditTransaction(tx); }}
                          className="p-1 rounded-card text-ink-muted hover:text-pine hover:bg-pine-10 transition-colors"
                          title="Edit transaksi"
                          aria-label="Edit transaksi"
                        >
                          <Pencil size={13} strokeWidth={1.8} />
                        </button> : null}
                        <button
                          onClick={(event) => { event.stopPropagation(); setDeleteId(tx.id); }}
                          className="p-1 rounded-card text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                          title="Hapus transaksi"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 size={13} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop Data Table (≥768px) ── */}
            <div className="hidden overflow-x-auto rounded-[19px] md:block">
              <Table className="w-full border-separate border-spacing-y-1 text-left">
                <TableHeader>
                  <TableRow className="bg-[#40366F] text-white">
                    <TableHead className="rounded-l-[14px] px-4 py-4 text-xs font-extrabold uppercase tracking-wider text-white">Tanggal transaksi / dicatat</TableHead>
                    <TableHead className="px-4 py-4 text-xs font-extrabold uppercase tracking-wider text-white">Transaksi & Kategori</TableHead>
                    <TableHead className="px-4 py-4 text-xs font-extrabold uppercase tracking-wider text-white">Sumber Akun</TableHead>
                    <TableHead className="px-4 py-4 text-xs font-extrabold uppercase tracking-wider text-white">Tipe</TableHead>
                    <TableHead className="px-4 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-white">Nominal</TableHead>
                    <TableHead className="w-24 rounded-r-[14px] px-4 py-4 text-xs font-extrabold uppercase tracking-wider text-white">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTransactions.map((tx, rowIndex) => {
                    const acc = accounts.find((a) => a.id === tx.accountId);
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const destination = accounts.find((a) => a.id === tx.destinationAccountId);
                    const typeCfg = tx.transferKind === "cash_withdrawal" ? cashWithdrawalLabel : typeLabel[tx.type];
                    const TypeIcon = typeCfg.icon;

                    return (
                      <TableRow
                        key={tx.id}
                        onClick={() => setDetailTransaction(tx)}
                        className={cn("group cursor-pointer shadow-clay-soft transition-all duration-150", rowIndex % 2 ? "bg-[#B8DCE4]" : "bg-[#D6CDF0]", "hover:relative hover:z-10 hover:-translate-y-0.5 hover:bg-[#A99DD5] hover:shadow-clay")}
                      >
                        {/* Tanggal */}
                        <TableCell className="px-4 py-3.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <span suppressHydrationWarning className="block text-small font-mono text-ink">{formatDate(tx.date, "short")}</span>
                            <span suppressHydrationWarning className="block text-[10px] text-ink-muted">Dicatat {formatRecordedDate(tx.createdAt || tx.date)}</span>
                          </div>
                        </TableCell>

                        {/* Deskripsi & Kategori */}
                        <TableCell className="px-4 py-3.5 max-w-xs">
                          <div className="flex items-center gap-3">
                            <CategoryIcon icon={cat?.icon} color={cat?.color} size={15} containerSize="sm" />
                            <div className="min-w-0">
                              <p className="text-body font-semibold text-ink truncate group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                                {tx.note || cat?.name || "Transaksi Tanpa Catatan"}
                              </p>
                              <p className="text-xs text-ink-muted truncate font-ui">
                                {tx.recordKind === "balance_adjustment" ? `Kondisi saldo${tx.observedBalance != null ? ` · ${formatRupiah(tx.observedBalance)}` : ""}` : cat?.name ?? (tx.transferKind === "cash_withdrawal" ? "Tarik tunai" : tx.type === "transfer" ? "Transfer Antar Akun" : "Tanpa Kategori")}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Akun */}
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: acc?.colorTag ?? "var(--color-rule)" }}
                            />
                            <span className="text-small font-medium text-ink truncate max-w-[190px]" style={{ fontFamily: "var(--font-ui)" }}>
                              {acc?.name ?? "—"}{destination ? ` → ${destination.name}` : ""}
                            </span>
                          </div>
                        </TableCell>

                        {/* Tipe Badge */}
                        <TableCell className="px-4 py-3.5">
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
                        </TableCell>

                        {/* Nominal */}
                        <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span
                            className="tabular-nums font-mono font-bold text-body"
                            style={{
                              color: tx.type === "income" ? "var(--color-pine)" : tx.type === "transfer" ? "var(--color-ink-muted)" : "var(--color-ink)",
                            }}
                          >
                            {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}
                            {formatRupiah(tx.amount)}
                          </span>
                        </TableCell>

                        {/* Delete Action with tooltip */}
                        <TableCell className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <button onClick={(event) => { event.stopPropagation(); setDetailTransaction(tx); }} className="rounded-xl bg-[#40366F] p-2 text-white transition hover:bg-[#261F4A]" title="Lihat detail" aria-label="Lihat detail transaksi"><Eye size={15} /></button>
                            {tx.recordKind !== "balance_adjustment" ? <button
                              onClick={(event) => { event.stopPropagation(); setEditTransaction(tx); }}
                              className="p-1.5 rounded-card text-ink-muted hover:text-pine hover:bg-pine-10 transition-all duration-150"
                              title="Edit transaksi"
                              aria-label="Edit transaksi"
                            >
                              <Pencil size={15} strokeWidth={1.8} />
                            </button> : null}
                            <button
                              onClick={(event) => { event.stopPropagation(); setDeleteId(tx.id); }}
                              className="p-1.5 rounded-card text-ink-muted hover:text-ember hover:bg-ember-10 transition-all duration-150"
                              title="Hapus transaksi"
                              aria-label="Hapus transaksi"
                            >
                              <Trash2 size={15} strokeWidth={1.8} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 px-2 pb-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-[#40366F]">Menampilkan {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filtered.length)} dari {filtered.length} transaksi</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="grid h-9 w-9 place-items-center rounded-xl bg-[#E2DCF4] text-[#40366F] shadow-clay-soft transition hover:bg-[#CFC4EC] disabled:opacity-40" aria-label="Halaman sebelumnya"><ChevronLeft size={16} /></button>
                <span className="rounded-xl bg-[#40366F] px-3 py-2 text-xs font-extrabold text-white">{safePage} / {pageCount}</span>
                <button type="button" onClick={() => setCurrentPage(Math.min(pageCount, safePage + 1))} disabled={safePage === pageCount} className="grid h-9 w-9 place-items-center rounded-xl bg-[#E2DCF4] text-[#40366F] shadow-clay-soft transition hover:bg-[#CFC4EC] disabled:opacity-40" aria-label="Halaman berikutnya"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {detailTransaction && (() => {
        const account = accounts.find((item) => item.id === detailTransaction.accountId);
        const destination = accounts.find((item) => item.id === detailTransaction.destinationAccountId);
        const category = categories.find((item) => item.id === detailTransaction.categoryId);
        const cfg = detailTransaction.transferKind === "cash_withdrawal" ? cashWithdrawalLabel : typeLabel[detailTransaction.type];
        return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(35,28,68,.56)] p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="Detail transaksi" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailTransaction(null); }}>
          <article className="w-full max-w-lg rounded-[28px] bg-[#C9C1E8] p-5 shadow-float sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Detail transaksi</p><h2 className="mt-1 text-2xl font-black text-ink">{detailTransaction.note || category?.name || "Transaksi"}</h2></div><button onClick={() => setDetailTransaction(null)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#40366F] text-white"><X size={17}/></button></div>
            <div className="mt-6 rounded-[22px] bg-[#40366F] p-5 text-white shadow-clay-soft"><p className="text-xs font-bold text-white/70">Nominal</p><p className="mt-1 text-3xl font-black tabular-nums">{formatRupiah(detailTransaction.amount)}</p><span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{cfg.label}</span></div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["Tanggal transaksi", formatDate(detailTransaction.date, "short")],
                ["Dicatat pada", formatRecordedDate(detailTransaction.createdAt || detailTransaction.date)],
                ["Kategori", category?.name || "Tanpa kategori"],
                ["Sumber dana", `${account?.name || "—"}${destination ? ` → ${destination.name}` : ""}`],
              ].map(([label, value]) => <div key={label} className="rounded-[16px] bg-[#E1DCF1] p-4"><dt className="text-[10px] font-extrabold uppercase tracking-wider text-[#625A79]">{label}</dt><dd className="mt-1 text-sm font-extrabold text-ink">{value}</dd></div>)}
            </dl>
            <div className="mt-5 flex justify-end gap-2">{detailTransaction.recordKind !== "balance_adjustment" && <button onClick={() => { setDetailTransaction(null); setEditTransaction(detailTransaction); }} className="material-button secondary"><Pencil size={15}/> Edit</button>}<button onClick={() => setDetailTransaction(null)} className="material-button">Tutup</button></div>
          </article>
        </div>;
      })()}

      {editTransaction && (
        <div className="fixed inset-0 z-50 bg-[rgba(28,24,47,0.42)] backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="Edit transaksi" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditTransaction(null); }}>
          <aside className="absolute inset-y-0 right-0 w-full overflow-hidden bg-white shadow-float sm:bottom-3 sm:right-3 sm:top-3 sm:max-w-[440px] sm:rounded-[26px] sm:border sm:border-pine/10">
            <QuickAddPanel key={editTransaction.id} transaction={editTransaction} onClose={() => setEditTransaction(null)} />
          </aside>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "var(--color-scrim)", backdropFilter: "blur(4px)" }}
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
    </div>
  );
}
