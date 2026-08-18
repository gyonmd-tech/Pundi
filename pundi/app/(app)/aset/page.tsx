"use client";

/**
 * app/(app)/aset/page.tsx
 * Daftar aset & investasi + tren net worth, live P&L calculation di form modal,
 * toast notification feedback, dan alokasi portofolio.
 */

import React, { useState } from "react";
import { useApp, useAssets } from "@/lib/data/store";
import { NetWorthTrendChart } from "@/components/charts/NetWorthTrendChart";
import { formatRupiah, formatPercent } from "@/lib/utils/formatter";
import { getNetWorthData, getAssetPnL, type AssetType, type Asset } from "@/lib/data/mock";
import { useToast } from "@/lib/context/ToastContext";
import {
  TrendingUp, TrendingDown, Plus, X, Edit2, Trash2,
  PieChart, Sparkles, Building, Coins, CircleDollarSign, Gem, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const assetTypeConfig: Record<AssetType, { label: string; icon: any; color: string }> = {
  stock:       { label: "Saham",       icon: TrendingUp,       color: "var(--color-pine)" },
  mutual_fund: { label: "Reksadana",   icon: CircleDollarSign, color: "var(--color-pine-40)" },
  crypto:      { label: "Kripto",      icon: Coins,            color: "var(--color-ember)" },
  gold:        { label: "Emas",        icon: Gem,              color: "var(--color-brass)" },
  property:    { label: "Properti",    icon: Building,         color: "var(--color-ink-muted)" },
};

export default function AsetPage() {
  const { dispatch }  = useApp();
  const assets        = useAssets();
  const { showToast } = useToast();

  const netWorthData = getNetWorthData();
  const totalValue   = assets.reduce((s, a) => s + a.units * a.currentPrice, 0);
  const totalBuyVal  = assets.reduce((s, a) => s + a.units * a.buyPrice, 0);
  const totalPnL     = totalValue - totalBuyVal;
  const totalPnLPct  = totalBuyVal > 0 ? (totalPnL / totalBuyVal) * 100 : 0;

  const [showForm, setShowForm]     = useState(false);
  const [editAsset, setEditAsset]   = useState<Asset | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const [form, setForm] = useState({
    type:         "stock" as AssetType,
    name:         "",
    units:        "",
    buyPrice:     "",
    currentPrice: "",
  });

  function openAdd() {
    setEditAsset(null);
    setForm({ type: "stock", name: "", units: "", buyPrice: "", currentPrice: "" });
    setShowForm(true);
  }

  function openEdit(a: Asset) {
    setEditAsset(a);
    setForm({
      type:         a.type,
      name:         a.name,
      units:        a.units.toString(),
      buyPrice:     a.buyPrice.toString(),
      currentPrice: a.currentPrice.toString()
    });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      showToast({
        type: "error",
        title: "Nama Aset Kosong",
        message: "Masukkan nama aset atau kode instrumen investasi.",
      });
      return;
    }

    const unitsVal = parseFloat(form.units) || 0;
    const buyVal   = parseInt(form.buyPrice.replace(/\D/g, ""), 10) || 0;
    const currVal  = parseInt(form.currentPrice.replace(/\D/g, ""), 10) || 0;

    const payload: Asset = {
      id:           editAsset?.id ?? `ast-${Date.now()}`,
      type:         form.type,
      name:         form.name.trim(),
      units:        unitsVal,
      buyPrice:     buyVal,
      currentPrice: currVal,
      updatedAt:    new Date(),
    };

    dispatch({ type: editAsset ? "UPDATE_ASSET" : "ADD_ASSET", payload });
    setShowForm(false);

    showToast({
      type: "success",
      title: editAsset ? "Aset Diperbarui" : "Aset Ditambahkan",
      message: `${form.name} berhasil disimpan ke portofolio.`,
    });
  }

  function handleDelete(id: string) {
    const a = assets.find(item => item.id === id);
    dispatch({ type: "DELETE_ASSET", payload: id });
    setDeleteId(null);
    showToast({
      type: "info",
      title: "Aset Dihapus",
      message: `Aset ${a?.name ?? ""} telah dihapus dari portofolio.`,
    });
  }

  // Live P&L in modal
  const modalUnits = parseFloat(form.units) || 0;
  const modalBuy   = parseInt(form.buyPrice.replace(/\D/g, ""), 10) || 0;
  const modalCurr  = parseInt(form.currentPrice.replace(/\D/g, ""), 10) || 0;
  const modalVal   = modalUnits * modalCurr;
  const modalPnL   = modalVal - (modalUnits * modalBuy);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-l font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Portofolio Aset & Investasi
          </h1>
          <p className="text-small text-ink-muted mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
            Pantau pertumbuhan nilai bersih (net worth) dan instrumen investasi
          </p>
        </div>

        <button
          onClick={openAdd}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-card text-small font-semibold shadow-sm",
            "transition-all duration-200 hover:brightness-105 active:scale-95 group"
          )}
          style={{ backgroundColor: "var(--color-pine)", color: "white", fontFamily: "var(--font-ui)" }}
        >
          <Plus size={16} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Tambah Aset</span>
        </button>
      </div>

      {/* Summary Metrics & Net Worth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Summary Metrics */}
        <div className="lg:col-span-2 space-y-3">
          <div className="card p-4 transition-all hover:border-pine/30" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Total Nilai Portofolio
            </p>
            <p className="tabular-nums font-mono font-bold text-display-l text-ink">
              {formatRupiah(totalValue)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Total P&L</p>
              <div className="flex items-center gap-1.5">
                {totalPnL >= 0
                  ? <TrendingUp size={16} style={{ color: "var(--color-pine)" }} />
                  : <TrendingDown size={16} style={{ color: "var(--color-ember)" }} />}
                <p className="tabular-nums font-mono font-bold text-body" style={{ color: totalPnL >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}>
                  {totalPnL >= 0 ? "+" : "−"}{formatRupiah(Math.abs(totalPnL))}
                </p>
              </div>
            </div>

            <div className="card p-3.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Return Portofolio</p>
              <p className="tabular-nums font-mono font-bold text-body" style={{ color: totalPnLPct >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}>
                {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Allocation Progress Breakdown */}
          <div className="card p-4 space-y-2.5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Alokasi Kelas Aset</p>
            {(Object.keys(assetTypeConfig) as AssetType[]).map((t) => {
              const typeAssets = assets.filter(a => a.type === t);
              const typeVal   = typeAssets.reduce((s, a) => s + a.units * a.currentPrice, 0);
              if (typeVal === 0) return null;
              const pct = (typeVal / totalValue) * 100;
              const cfg = assetTypeConfig[t];

              return (
                <div key={t} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.label}
                    </span>
                    <span className="tabular-nums font-mono text-ink-muted">
                      {formatRupiah(typeVal)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-rule shadow-inner">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Net Worth Trend Chart */}
        <div className="lg:col-span-3 card p-4 sm:p-5" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
              Tren Net Worth (6 Bulan)
            </h2>
            <span className="text-xs font-mono text-pine font-semibold px-2 py-0.5 rounded-full bg-pine-10">
              ▲ +12.4% Semester Ini
            </span>
          </div>
          <NetWorthTrendChart data={netWorthData} />
        </div>
      </div>

      {/* Asset Table Card */}
      <div className="card overflow-hidden p-0" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-paper)" }}>
          <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
            Daftar Aset & Valuasi Terkini
          </h2>
          <span className="text-xs font-mono text-ink-muted">
            {assets.length} aset tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ backgroundColor: "var(--color-paper)", borderColor: "var(--color-rule)" }}>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Instrumen / Aset</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Kelas</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Kepemilikan Unit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted hidden md:table-cell">Harga Rerata Beli</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted hidden md:table-cell">Harga Saat Ini</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted text-right">Nilai Portofolio</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted text-right">Keuntungan / Rugi</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {assets.map((asset) => {
                const { currentVal, pnl, pnlPct } = getAssetPnL(asset);
                const typeCfg = assetTypeConfig[asset.type];
                const TypeIcon = typeCfg.icon;

                return (
                  <tr
                    key={asset.id}
                    className="group transition-colors duration-150 hover:bg-paper/80"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-body font-semibold text-ink group-hover:text-pine transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                        {asset.name}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${typeCfg.color}15`,
                          color: typeCfg.color,
                        }}
                      >
                        <TypeIcon size={12} strokeWidth={2} />
                        {typeCfg.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-small text-ink">
                      {asset.units % 1 === 0 ? asset.units.toLocaleString("id-ID") : asset.units.toFixed(4)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-small text-ink-muted hidden md:table-cell">
                      {formatRupiah(asset.buyPrice)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-small text-ink hidden md:table-cell">
                      {formatRupiah(asset.currentPrice)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-body text-ink">
                      {formatRupiah(currentVal)}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span
                          className="tabular-nums font-mono font-bold text-small"
                          style={{ color: pnl >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}
                        >
                          {pnl >= 0 ? "+" : "−"}{formatRupiah(Math.abs(pnl))}
                        </span>
                        <span
                          className="tabular-nums font-mono text-xs font-semibold"
                          style={{ color: pnl >= 0 ? "var(--color-pine)" : "var(--color-ember)" }}
                        >
                          {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-1.5 rounded text-ink-muted hover:text-pine hover:bg-pine-10 transition-colors"
                          title="Edit aset"
                        >
                          <Edit2 size={14} strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => setDeleteId(asset.id)}
                          className="p-1.5 rounded text-ink-muted hover:text-ember hover:bg-ember-10 transition-colors"
                          title="Hapus aset"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Asset Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-card shadow-float overflow-hidden border bg-surface animate-in slide-in-from-bottom-4"
            style={{ borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-rule)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-pine-10 text-pine flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <h2 className="text-heading font-semibold text-ink" style={{ fontFamily: "var(--font-ui)" }}>
                  {editAsset ? "Edit Data Aset" : "Tambah Aset Baru"}
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-ink-muted hover:text-ink p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Asset Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Kelas Aset / Instrumen
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(assetTypeConfig) as AssetType[]).map((t) => {
                    const cfg = assetTypeConfig[t];
                    const Icon = cfg.icon;
                    const isSelected = form.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-card border text-left transition-all",
                          isSelected
                            ? "border-pine bg-pine-10 text-pine font-semibold shadow-xs"
                            : "border-rule bg-paper/60 hover:bg-paper text-ink"
                        )}
                      >
                        <Icon size={16} strokeWidth={2} style={{ color: cfg.color }} />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Asset Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Nama Aset / Ticker Simbol
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="mis. BBCA, Reksadana Schroder, Logam Mulia..."
                  className="w-full px-3.5 py-2.5 rounded-card border bg-paper text-small text-ink focus:border-pine outline-none font-medium"
                  style={{ borderColor: "var(--color-rule)" }}
                />
              </div>

              {/* Number Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.units}
                    onChange={(e) => setForm(f => ({ ...f, units: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-card border bg-paper text-small font-mono text-ink focus:border-pine outline-none"
                    style={{ borderColor: "var(--color-rule)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Harga Beli (Rp)
                  </label>
                  <input
                    type="text"
                    value={form.buyPrice ? parseInt(form.buyPrice, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setForm(f => ({ ...f, buyPrice: e.target.value.replace(/\D/g, "") }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-card border bg-paper text-small font-mono text-ink focus:border-pine outline-none"
                    style={{ borderColor: "var(--color-rule)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                    Harga Kini (Rp)
                  </label>
                  <input
                    type="text"
                    value={form.currentPrice ? parseInt(form.currentPrice, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setForm(f => ({ ...f, currentPrice: e.target.value.replace(/\D/g, "") }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-card border bg-paper text-small font-mono text-ink focus:border-pine outline-none"
                    style={{ borderColor: "var(--color-rule)" }}
                  />
                </div>
              </div>

              {/* Live P&L Preview Box */}
              {modalVal > 0 && (
                <div className="p-3.5 rounded-card border bg-paper/90 flex items-center justify-between" style={{ borderColor: "var(--color-rule)" }}>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">Valuasi Terkalkulasi</p>
                    <p className="text-small font-mono font-bold text-ink">{formatRupiah(modalVal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">Estimasi P&L</p>
                    <p className={cn("text-small font-mono font-bold", modalPnL >= 0 ? "text-pine" : "text-ember")}>
                      {modalPnL >= 0 ? "+" : "−"}{formatRupiah(Math.abs(modalPnL))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-rule bg-paper">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-surface"
                style={{ borderColor: "var(--color-rule)" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-pine hover:brightness-105 active:scale-95 disabled:opacity-40 shadow-sm"
              >
                {editAsset ? "Simpan Perubahan" : "Tambah ke Portofolio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
          style={{ backgroundColor: "rgba(22, 32, 29, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-card p-6 shadow-float border bg-surface"
            style={{ borderColor: "var(--color-rule)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-ember-10 flex items-center justify-center text-ember mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="text-heading font-semibold text-ink mb-1.5" style={{ fontFamily: "var(--font-ui)" }}>
              Hapus Aset?
            </h3>
            <p className="text-small text-ink-muted mb-5 leading-relaxed" style={{ fontFamily: "var(--font-ui)" }}>
              Instrumen aset ini akan dihapus dari perhitungan portofolio dan grafik net worth.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-card text-small font-medium border text-ink-muted hover:bg-paper"
                style={{ borderColor: "var(--color-rule)" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-card text-small font-semibold text-white bg-ember hover:brightness-110 active:scale-95 transition-all"
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
