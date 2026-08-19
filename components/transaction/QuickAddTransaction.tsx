"use client";

/**
 * components/transaction/QuickAddTransaction.tsx
 * Modal / bottom-sheet interaktif untuk pencatatan transaksi cepat (≤ 3 langkah).
 * Fitur:
 * - Live formatted Rupiah display dengan clear button
 * - Quick amount chips (+50rb, +100rb, +250rb, +500rb, +1jt)
 * - Category picker visual dengan Lucide vector icons
 * - Account preview dengan saldo
 * - Toast notification feedback
 */

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useApp, useAccounts, useCategories } from "@/lib/data/store";
import { formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface Props {
  open:    boolean;
  onClose: () => void;
}

type TxType = "expense" | "income" | "transfer";

const typeConfig = {
  expense:  { label: "Pengeluaran", icon: ArrowDownLeft,  color: "var(--color-ember)",  bgActive: "var(--color-ember-10)", badge: "Keluar" },
  income:   { label: "Pemasukan",   icon: ArrowUpRight,   color: "var(--color-pine)",   bgActive: "var(--color-pine-10)", badge: "Masuk" },
  transfer: { label: "Transfer",    icon: ArrowLeftRight, color: "var(--color-brass)",  bgActive: "var(--color-brass-10)", badge: "Pindah" },
};

const quickAmounts = [50_000, 100_000, 250_000, 500_000, 1_000_000];

export function QuickAddTransaction({ open, onClose }: Props) {
  const { dispatch } = useApp();
  const accounts   = useAccounts();
  const categories = useCategories();
  const { showToast } = useToast();

  const [type, setType]               = useState<TxType>("expense");
  const [amount, setAmount]           = useState("");
  const [accountId, setAccountId]     = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [categoryId, setCategoryId]   = useState("");
  const [note, setNote]               = useState("");
  const [date, setDate]               = useState(() => new Date().toISOString().slice(0, 10));
  const [categorySearch, setCategorySearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Account default sudah di-set via lazy initializer di useState di atas
  // (menghindari pola setState sinkron di dalam useEffect / cascading renders)

  // Focus amount input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredCategories = categories.filter((c) => {
    if (type === "transfer") return false;
    const matchType = c.type === (type === "income" ? "income" : "expense");
    const matchSearch = categorySearch
      ? c.name.toLowerCase().includes(categorySearch.toLowerCase())
      : true;
    return matchType && matchSearch;
  });

  function handleAmountInput(val: string) {
    const digits = val.replace(/\D/g, "");
    setAmount(digits);
  }

  function handleAddQuickAmount(addVal: number) {
    const current = parseInt(amount || "0", 10);
    setAmount(String(current + addVal));
  }

  function handleSetDatePreset(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().slice(0, 10));
  }

  function handleSubmit() {
    const amt = parseInt(amount.replace(/\D/g, ""), 10);
    if (!amt || amt <= 0) {
      showToast({
        type: "error",
        title: "Nominal Belum Diisi",
        message: "Masukkan jumlah nominal transaksi yang valid.",
      });
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);

    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        id:         `tx-${Date.now()}`,
        accountId,
        categoryId: categoryId || undefined,
        type,
        amount:     amt,
        date:       new Date(date),
        note:       note.trim() || undefined,
        tags:       [],
      },
    });

    showToast({
      type: "success",
      title: "Transaksi Berhasil Dicatat",
      message: `${typeConfig[type].label}: ${formatRupiah(amt)} ${selectedCat ? `(${selectedCat.name})` : ""}`,
    });

    // Reset Form
    setAmount("");
    setNote("");
    setCategoryId("");
    setCategorySearch("");
    onClose();
  }

  if (!open) return null;

  const numericAmount = parseInt(amount || "0", 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      style={{
        backgroundColor: "rgba(22, 32, 29, 0.6)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full sm:max-w-lg rounded-t-2xl sm:rounded-card shadow-float overflow-hidden flex flex-col max-h-[92vh]",
          "border border-rule animate-in slide-in-from-bottom-4 duration-200"
        )}
        style={{ backgroundColor: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-rule)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: "var(--color-pine-10)", color: "var(--color-pine)" }}
            >
              <Sparkles size={15} />
            </div>
            <div>
              <h2
                className="text-heading font-semibold leading-tight"
                style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
              >
                Catat Transaksi
              </h2>
              <p className="text-xs text-ink-muted leading-tight">
                Simpan mutasi baru ke buku kasmu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-card text-ink-muted hover:text-ink hover:bg-paper transition-colors"
            aria-label="Tutup"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {/* Transaction Type Segmented Toggle */}
          <div
            className="flex gap-1.5 p-1 rounded-card border"
            style={{ backgroundColor: "var(--color-paper)", borderColor: "var(--color-rule)" }}
          >
            {(Object.keys(typeConfig) as TxType[]).map((t) => {
              const cfg = typeConfig[t];
              const Icon = cfg.icon;
              const isActive = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setCategoryId(""); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-card text-small font-medium transition-all duration-200",
                    isActive ? "shadow-xs font-semibold scale-[1.01]" : "hover:text-ink opacity-75"
                  )}
                  style={{
                    backgroundColor: isActive ? "var(--color-surface)" : "transparent",
                    color: isActive ? cfg.color : "var(--color-ink-muted)",
                    border: isActive ? `1.5px solid ${cfg.color}` : "1.5px solid transparent",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  <Icon size={15} strokeWidth={2.2} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Input with Live Formatting & Clear Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Nominal Transaksi
              </label>
              {numericAmount > 0 && (
                <span className="text-xs font-mono text-pine font-medium">
                  {formatRupiah(numericAmount)}
                </span>
              )}
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 rounded-card border transition-all duration-200",
                "focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/15"
              )}
              style={{
                borderColor: numericAmount > 0 ? "var(--color-pine)" : "var(--color-rule)",
                backgroundColor: "var(--color-paper)",
              }}
            >
              <span
                className="text-body font-mono font-bold select-none"
                style={{ color: typeConfig[type].color }}
              >
                Rp
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount ? parseInt(amount, 10).toLocaleString("id-ID") : ""}
                onChange={(e) => handleAmountInput(e.target.value)}
                className="flex-1 bg-transparent outline-none tabular-nums text-right font-mono font-bold tracking-tight text-2xl"
                style={{
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="text-ink-muted hover:text-ink p-1 rounded-sm"
                  title="Hapus nominal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-ink-muted font-medium mr-1">Cepat:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAddQuickAmount(q)}
                  className="px-2.5 py-1 rounded-card border text-xs font-mono font-medium transition-all hover:border-pine hover:bg-pine-10 hover:text-pine active:scale-95"
                  style={{
                    borderColor: "var(--color-rule)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  +{q >= 1_000_000 ? `${q / 1_000_000}jt` : `${q / 1_000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {type === "transfer" ? "Dari Akun" : "Sumber Akun"}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-card border text-small outline-none font-medium transition-colors focus:border-pine bg-paper text-ink"
                style={{ borderColor: "var(--color-rule)" }}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatRupiah(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" ? (
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Ke Akun Tujuan
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-card border text-small outline-none font-medium transition-colors focus:border-pine bg-paper text-ink"
                  style={{ borderColor: "var(--color-rule)" }}
                >
                  {accounts.filter(a => a.id !== accountId).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRupiah(a.balance)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    Tanggal
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetDatePreset(0)}
                      className="text-[10px] text-pine hover:underline font-medium"
                    >
                      Hari ini
                    </button>
                    <span className="text-[10px] text-ink-muted">·</span>
                    <button
                      type="button"
                      onClick={() => handleSetDatePreset(1)}
                      className="text-[10px] text-ink-muted hover:text-ink font-medium"
                    >
                      Kemarin
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-card border text-small outline-none font-medium bg-paper text-ink transition-colors focus:border-pine"
                  style={{ borderColor: "var(--color-rule)" }}
                />
              </div>
            )}
          </div>

          {/* Category Grid Selection (for Expense & Income) */}
          {type !== "transfer" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Pilih Kategori
                </label>
                <span className="text-xs text-ink-muted font-mono">
                  {filteredCategories.length} opsi
                </span>
              </div>

              {/* Category Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {filteredCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(isSelected ? "" : c.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-card border text-left transition-all duration-150 group",
                        isSelected
                          ? "border-pine bg-pine-10 text-pine font-semibold shadow-xs scale-[1.02]"
                          : "border-rule bg-paper/70 hover:border-pine/50 hover:bg-paper text-ink"
                      )}
                    >
                      <CategoryIcon icon={c.icon} color={c.color} size={14} containerSize="sm" />
                      <span className="text-xs truncate flex-1 font-medium">{c.name}</span>
                      {isSelected && <Check size={13} className="text-pine flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Catatan / Deskripsi (Opsional)
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-card border bg-paper focus-within:border-pine"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <FileText size={15} className="text-ink-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="mis. Makan siang, Beli token PLN, Kopi..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-transparent outline-none text-small text-ink"
                style={{ fontFamily: "var(--font-ui)" }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-t flex-shrink-0"
          style={{
            borderColor: "var(--color-rule)",
            backgroundColor: "var(--color-paper)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-card text-small font-medium border transition-colors hover:bg-surface text-ink-muted"
            style={{
              borderColor: "var(--color-rule)",
              fontFamily: "var(--font-ui)",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amount || numericAmount <= 0}
            className={cn(
              "flex-1 py-2.5 rounded-card text-small font-semibold shadow-sm transition-all duration-200",
              "hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            )}
            style={{
              backgroundColor: "var(--color-pine)",
              color: "white",
              fontFamily: "var(--font-ui)",
            }}
          >
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}
