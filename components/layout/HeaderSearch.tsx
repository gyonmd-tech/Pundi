"use client";

import * as React from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccounts, useCategories, useTransactions } from "@/lib/data/store";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";

const pages = [
  { label: "Dashboard", description: "Ringkasan keuangan", href: "/dashboard" },
  { label: "Transaksi", description: "Daftar pemasukan dan pengeluaran", href: "/transaksi" },
  { label: "Anggaran", description: "Batas pengeluaran", href: "/anggaran" },
  { label: "Arus Kas", description: "Analisis pergerakan uang", href: "/arus-kas" },
  { label: "Aset", description: "Portofolio dan kekayaan", href: "/aset" },
  { label: "Tujuan", description: "Target keuangan", href: "/tujuan" },
];

export function HeaderSearch() {
  const router = useRouter();
  const transactions = useTransactions();
  const accounts = useAccounts();
  const categories = useCategories();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const normalized = query.trim().toLowerCase();

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    function handleOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", handleShortcut);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  const transactionResults = normalized
    ? transactions.filter((transaction) => {
        const category = categories.find((item) => item.id === transaction.categoryId)?.name ?? "";
        const account = accounts.find((item) => item.id === transaction.accountId)?.name ?? "";
        return `${transaction.note ?? ""} ${category} ${account} ${transaction.amount}`.toLowerCase().includes(normalized);
      }).slice(0, 5)
    : [];

  const pageResults = normalized
    ? pages.filter((page) => `${page.label} ${page.description}`.toLowerCase().includes(normalized)).slice(0, 3)
    : [];

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-[640px]">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (transactionResults[0]) navigate(`/transaksi?focus=${transactionResults[0].id}`);
          else if (pageResults[0]) navigate(pageResults[0].href);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pine" />
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          placeholder="Cari transaksi, rekening, atau halaman…"
          className="h-11 w-full rounded-[16px] border border-pine/12 bg-paper/80 pl-11 pr-20 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/75 focus:border-pine/35 focus:bg-white focus:shadow-[0_0_0_4px_rgba(91,74,239,0.08)]"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[9px] text-ink-muted transition hover:bg-pine-10 hover:text-pine">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[8px] border border-rule bg-white px-2 py-1 text-[10px] font-semibold text-ink-muted shadow-2xs">Ctrl K</kbd>
        )}
      </form>

      {open && normalized ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[20px] border border-pine/10 bg-white p-2 shadow-float">
          {transactionResults.length ? (
            <div>
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Transaksi</p>
              {transactionResults.map((transaction) => {
                const category = categories.find((item) => item.id === transaction.categoryId)?.name ?? "Transfer";
                return (
                  <button key={transaction.id} type="button" onClick={() => navigate(`/transaksi?focus=${transaction.id}`)} className="flex min-h-12 w-full items-center gap-3 rounded-[13px] px-3 text-left transition hover:bg-pine-10">
                    <span className={`h-8 w-1 rounded-full ${transaction.type === "income" ? "bg-mint" : transaction.type === "expense" ? "bg-ember" : "bg-brass"}`} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-ink">{transaction.note || category}</span><span className="mt-0.5 block text-[10px] text-ink-muted">{category} · {formatDate(transaction.date, "short")}</span></span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-ink">{formatRupiah(transaction.amount)}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {pageResults.length ? (
            <div className={transactionResults.length ? "mt-2 border-t border-rule pt-2" : ""}>
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Halaman</p>
              {pageResults.map((page) => (
                <button key={page.href} type="button" onClick={() => navigate(page.href)} className="flex min-h-11 w-full items-center justify-between rounded-[13px] px-3 text-left transition hover:bg-paper">
                  <span><span className="block text-xs font-bold text-ink">{page.label}</span><span className="text-[10px] text-ink-muted">{page.description}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 text-pine" />
                </button>
              ))}
            </div>
          ) : null}

          {!transactionResults.length && !pageResults.length ? (
            <div className="px-4 py-8 text-center"><Search className="mx-auto h-5 w-5 text-ink-soft" /><p className="mt-2 text-xs font-bold text-ink">Tidak ada hasil</p><p className="mt-1 text-[11px] text-ink-muted">Coba nama transaksi atau halaman lain.</p></div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}