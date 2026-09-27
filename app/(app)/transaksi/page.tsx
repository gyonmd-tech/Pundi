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
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchField } from "@/components/ui/SearchField";

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Pemasukan", amount: totals.income, type: "income", icon: ArrowUpRight, caption: `${filtered.filter((item) => item.type === "income").length} catatan masuk` },
          { label: "Total Pengeluaran", amount: totals.expense, type: "expense", icon: ArrowDownLeft, caption: `${filtered.filter((item) => item.type === "expense").length} catatan keluar` },
          {
            label: "Arus Kas Bersih",
            amount: totals.income - totals.expense,
            type: "net",
            icon: ArrowLeftRight,
            caption: totals.income >= totals.expense ? "Surplus pada hasil filter" : "Defisit pada hasil filter",
          },
        ].map((s) => (
          <Card
            key={s.label}
            variant={s.type === "net" ? "highlight" : "default"}
            className="flex min-h-[132px] items-start justify-between gap-4 p-5"
          >
            <div className="min-w-0 self-stretch">
              <p className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", s.type === "net" ? "text-white/70" : "text-ink-muted")}>{s.label}</p>
              <p className={cn("mt-3 tabular-nums font-ui text-[clamp(1.35rem,2.2vw,1.8rem)] font-bold tracking-[-0.045em]", s.type === "income" ? "text-mint-ink" : s.type === "expense" ? "text-ember-ink" : "text-white")}>
                {s.type === "net" && totals.income < totals.expense ? "−" : ""}{formatRupiah(Math.abs(s.amount))}
              </p>
              <p className={cn("mt-2 text-xs font-medium", s.type === "net" ? "text-white/70" : "text-ink-muted")}>{s.caption}</p>
            </div>
            <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[15px] text-white shadow-card", s.type === "income" ? "bg-mint-ink" : s.type === "expense" ? "bg-ember-ink" : "bg-white/15")}>
              <s.icon className="h-5 w-5" />
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Bar with clear */}
        <SearchField
          value={search}
          onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
          onClear={() => { setSearch(""); setCurrentPage(1); }}
          placeholder="Cari catatan, kategori, atau akun..."
          aria-label="Cari transaksi"
          containerClassName="flex-1"
        />

        {/* Filter Toggle Button */}
        <Button
          onClick={() => setShowFilter(!showFilter)}
          variant={showFilter || activeFilters > 0 ? "primary" : "outline"}
          className="relative"
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
        </Button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilter && (
        <div
          className="card grid grid-cols-1 gap-3.5 border-brand-600/10 bg-white p-4 sm:grid-cols-2 md:grid-cols-4 animate-in fade-in slide-in-from-top-2"
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
      <div className="overflow-hidden rounded-[24px] border border-brand-600/10 bg-white shadow-card">
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
              {pagedTransactions.map((tx) => {
                const acc = accounts.find((a) => a.id === tx.accountId);
                const cat = categories.find((c) => c.id === tx.categoryId);
                const destination = accounts.find((a) => a.id === tx.destinationAccountId);
                const typeCfg = tx.transferKind === "cash_withdrawal" ? cashWithdrawalLabel : typeLabel[tx.type];
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={tx.id}
                    onClick={() => setDetailTransaction(tx)}
                    className="flex items-center justify-between gap-3 border-b border-rule bg-white p-4 transition-colors last:border-b-0 hover:bg-brand-50"
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
                        <Badge tone={tx.transferKind === "cash_withdrawal" ? "primary" : tx.type === "income" ? "success" : tx.type === "expense" ? "danger" : "warning"} className="text-[10px]">
                          <TypeIcon size={10} strokeWidth={2.2} />
                          {typeCfg.label}
                        </Badge>
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
            <div className="hidden overflow-x-auto md:block">
              <Table className="w-full text-left">
                <TableHeader>
                  <TableRow className="border-b-[3px] border-brand-500 bg-brand-950 text-white shadow-[inset_0_1px_rgba(255,255,255,.10)]">
                    <TableHead className="w-[220px] whitespace-nowrap border-r border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Tanggal transaksi / dicatat</TableHead>
                    <TableHead className="min-w-[300px] border-r border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Transaksi & kategori</TableHead>
                    <TableHead className="w-[230px] border-r border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Sumber akun</TableHead>
                    <TableHead className="w-[150px] border-r border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Tipe</TableHead>
                    <TableHead className="w-[170px] border-r border-white/10 px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-white">Nominal</TableHead>
                    <TableHead className="w-[132px] px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-white">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTransactions.map((tx) => {
                    const acc = accounts.find((a) => a.id === tx.accountId);
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const destination = accounts.find((a) => a.id === tx.destinationAccountId);
                    const typeCfg = tx.transferKind === "cash_withdrawal" ? cashWithdrawalLabel : typeLabel[tx.type];
                    const TypeIcon = typeCfg.icon;

                    return (
                      <TableRow
                        key={tx.id}
                        onClick={() => setDetailTransaction(tx)}
                        className="group cursor-pointer border-b border-rule bg-white transition-colors duration-150 last:border-b-0 hover:bg-brand-50"
                      >
                        {/* Tanggal */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span suppressHydrationWarning className="block text-small font-semibold text-ink">{formatDate(tx.date, "short")}</span>
                            <span suppressHydrationWarning className="block text-[10px] text-ink-muted">Dicatat {formatRecordedDate(tx.createdAt || tx.date)}</span>
                          </div>
                        </TableCell>

                        {/* Deskripsi & Kategori */}
                        <TableCell className="max-w-xs px-5 py-4">
                          <div className="flex items-center gap-3">
                            <CategoryIcon icon={cat?.icon} color={cat?.color} size={15} containerSize="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-body font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                                {tx.note || cat?.name || "Transaksi Tanpa Catatan"}
                              </p>
                              <p className="truncate font-ui text-xs text-ink-muted">
                                {tx.recordKind === "balance_adjustment" ? `Kondisi saldo${tx.observedBalance != null ? ` · ${formatRupiah(tx.observedBalance)}` : ""}` : cat?.name ?? (tx.transferKind === "cash_withdrawal" ? "Tarik tunai" : tx.type === "transfer" ? "Transfer Antar Akun" : "Tanpa Kategori")}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Akun */}
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: acc?.colorTag ?? "var(--color-rule)" }}
                            />
                            <span className="max-w-[190px] truncate text-small font-medium text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                              {acc?.name ?? "—"}{destination ? ` → ${destination.name}` : ""}
                            </span>
                          </div>
                        </TableCell>

                        {/* Tipe Badge */}
                        <TableCell className="px-5 py-4">
                          <Badge tone={tx.transferKind === "cash_withdrawal" ? "primary" : tx.type === "income" ? "success" : tx.type === "expense" ? "danger" : "warning"}>
                            <TypeIcon size={12} strokeWidth={2.2} />
                            {typeCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Nominal */}
                        <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                          <span
                            className={cn("tabular-nums font-ui font-bold text-body", tx.type === "income" ? "text-mint-ink" : tx.type === "expense" ? "text-ember-ink" : "text-ink")}
                          >
                            {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}
                            {formatRupiah(tx.amount)}
                          </span>
                        </TableCell>

                        {/* Delete Action with tooltip */}
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <IconButton onClick={(event) => { event.stopPropagation(); setDetailTransaction(tx); }} variant="secondary" className="h-9 min-h-9 w-9" title="Lihat detail" aria-label="Lihat detail transaksi"><Eye size={15} /></IconButton>
                            {tx.recordKind !== "balance_adjustment" ? <IconButton
                              onClick={(event) => { event.stopPropagation(); setEditTransaction(tx); }}
                              variant="outline"
                              className="h-9 min-h-9 w-9"
                              title="Edit transaksi"
                              aria-label="Edit transaksi"
                            >
                              <Pencil size={15} strokeWidth={1.8} />
                            </IconButton> : null}
                            <IconButton
                              onClick={(event) => { event.stopPropagation(); setDeleteId(tx.id); }}
                              variant="danger"
                              className="h-9 min-h-9 w-9"
                              title="Hapus transaksi"
                              aria-label="Hapus transaksi"
                            >
                              <Trash2 size={15} strokeWidth={1.8} />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 px-2 pb-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-ink-muted">Menampilkan <strong className="text-ink">{filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filtered.length)}</strong> dari {filtered.length} transaksi</p>
              <div className="flex items-center gap-2">
                <IconButton type="button" variant="outline" onClick={() => setCurrentPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="h-9 min-h-9 w-9" aria-label="Halaman sebelumnya"><ChevronLeft size={16} /></IconButton>
                <span className="rounded-xl bg-brand-900 px-3 py-2 text-xs font-extrabold text-white shadow-card">{safePage} / {pageCount}</span>
                <IconButton type="button" variant="outline" onClick={() => setCurrentPage(Math.min(pageCount, safePage + 1))} disabled={safePage === pageCount} className="h-9 min-h-9 w-9" aria-label="Halaman berikutnya"><ChevronRight size={16} /></IconButton>
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
        const DetailIcon = cfg.icon;
        return <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/55 backdrop-blur-[3px] sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Detail transaksi" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailTransaction(null); }}>
          <article className="w-full overflow-hidden rounded-t-[28px] border border-brand-600/10 bg-white shadow-float sm:max-w-lg sm:rounded-[28px]">
            <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-5 sm:px-6">
              <div className="min-w-0"><p className="eyebrow">Detail transaksi</p><h2 className="mt-1 truncate text-2xl font-bold text-ink">{detailTransaction.note || category?.name || "Transaksi"}</h2></div>
              <IconButton onClick={() => setDetailTransaction(null)} variant="outline" aria-label="Tutup detail transaksi"><X size={17}/></IconButton>
            </header>
            <div className="p-5 sm:p-6">
              <div className="relative overflow-hidden rounded-[22px] bg-brand-600 p-5 text-white shadow-[0_14px_30px_rgba(36,89,222,.22)]">
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/10" />
                <div className="relative flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold text-white/70">Nominal transaksi</p><p className="mt-2 font-ui text-3xl font-bold tracking-[-0.045em] tabular-nums">{detailTransaction.type === "income" ? "+" : detailTransaction.type === "expense" ? "−" : ""}{formatRupiah(detailTransaction.amount)}</p></div>
                  <div className="grid h-11 w-11 place-items-center rounded-[15px] bg-white/15"><DetailIcon className="h-5 w-5" /></div>
                </div>
                <Badge tone={detailTransaction.transferKind === "cash_withdrawal" ? "primary" : detailTransaction.type === "income" ? "success" : detailTransaction.type === "expense" ? "danger" : "warning"} className="relative mt-4">{cfg.label}</Badge>
              </div>
              <dl className="mt-4 overflow-hidden rounded-[18px] border border-rule bg-white">
              {[
                ["Tanggal transaksi", formatDate(detailTransaction.date, "short")],
                ["Dicatat pada", formatRecordedDate(detailTransaction.createdAt || detailTransaction.date)],
                ["Kategori", category?.name || "Tanpa kategori"],
                ["Sumber dana", `${account?.name || "—"}${destination ? ` → ${destination.name}` : ""}`],
              ].map(([label, value]) => <div key={label} className="grid gap-1 border-b border-rule px-4 py-3.5 last:border-b-0 sm:grid-cols-[150px_1fr] sm:items-center"><dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-muted">{label}</dt><dd className="text-sm font-bold text-ink sm:text-right">{value}</dd></div>)}
              </dl>
            </div>
            <footer className="flex justify-end gap-2 border-t border-rule bg-brand-50 px-5 py-4 sm:px-6">
              <Button onClick={() => setDetailTransaction(null)} variant="outline">Tutup</Button>
              {detailTransaction.recordKind !== "balance_adjustment" && <Button onClick={() => { setDetailTransaction(null); setEditTransaction(detailTransaction); }}><Pencil size={15}/> Edit transaksi</Button>}
            </footer>
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
