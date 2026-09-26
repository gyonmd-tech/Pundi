"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Check, HandCoins, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field, Input } from "@/components/ui/Input";
import { useApp, useDebts } from "@/lib/data/store";
import type { Debt, DebtDirection } from "@/lib/data/mock";
import { formatDate, formatRupiah } from "@/lib/utils/formatter";
import { useToast } from "@/lib/context/ToastContext";
import { createDebtAction, deleteDebtAction, recordDebtPaymentAction, updateDebtAction } from "@/actions/debts";
import { cn } from "@/lib/utils/cn";

type FormState = {
  direction: DebtDirection;
  person: string;
  amount: string;
  remainingAmount: string;
  dueDate: string;
  note: string;
};

const emptyForm: FormState = { direction: "payable", person: "", amount: "", remainingAmount: "", dueDate: "", note: "" };

export default function UtangPage() {
  const debts = useDebts();
  const { dispatch, connection } = useApp();
  const { showToast } = useToast();
  const [editing, setEditing] = React.useState<Debt | "new" | null>(null);
  const [paymentDebt, setPaymentDebt] = React.useState<Debt | null>(null);
  const [payment, setPayment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(emptyForm);

  const openItems = debts.filter((item) => item.status === "open" && item.remainingAmount > 0);
  const payable = openItems.filter((item) => item.direction === "payable").reduce((sum, item) => sum + item.remainingAmount, 0);
  const receivable = openItems.filter((item) => item.direction === "receivable").reduce((sum, item) => sum + item.remainingAmount, 0);

  function openForm(item?: Debt) {
    setEditing(item || "new");
    setForm(item ? {
      direction: item.direction,
      person: item.person,
      amount: String(item.amount),
      remainingAmount: String(item.remainingAmount),
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "",
      note: item.note || "",
    } : emptyForm);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount);
    const remainingAmount = form.remainingAmount === "" ? amount : Number(form.remainingAmount);
    const payload = {
      direction: form.direction,
      person: form.person,
      amount,
      remainingAmount,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`) : undefined,
      note: form.note || undefined,
    };
    setSubmitting(true);
    const result = editing !== "new" && editing ? await updateDebtAction(editing.id, payload) : await createDebtAction(payload);
    setSubmitting(false);
    if (!result.success) {
      showToast({ type: "error", title: "Catatan belum tersimpan", message: result.error || "Periksa kembali datanya." });
      return;
    }
    const saved: Debt = {
      id: editing !== "new" && editing ? editing.id : (result as { id: string }).id,
      ...payload,
      status: remainingAmount === 0 ? "paid" : "open",
      createdAt: editing !== "new" && editing ? editing.createdAt : new Date((result as { createdAt: string }).createdAt),
      updatedAt: new Date((result as { updatedAt?: string }).updatedAt || Date.now()),
    };
    dispatch({ type: editing === "new" ? "ADD_DEBT" : "UPDATE_DEBT", payload: saved });
    showToast({ type: "success", title: editing === "new" ? "Catatan utang dibuat" : "Catatan diperbarui", message: `${form.person} · ${formatRupiah(remainingAmount)} tersisa.` });
    setEditing(null);
  }

  async function remove(item: Debt) {
    if (!window.confirm(`Hapus catatan ${item.person}?`)) return;
    const result = await deleteDebtAction(item.id);
    if (!result.success) return showToast({ type: "error", title: "Gagal menghapus", message: result.error || "Coba lagi." });
    dispatch({ type: "DELETE_DEBT", payload: item.id });
    showToast({ type: "success", title: "Catatan dihapus" });
  }

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!paymentDebt) return;
    const amount = Number(payment);
    setSubmitting(true);
    const result = await recordDebtPaymentAction(paymentDebt.id, amount);
    setSubmitting(false);
    if (!result.success) return showToast({ type: "error", title: "Pembayaran gagal", message: result.error || "Coba lagi." });
    const paymentResult = result as { remainingAmount: number; status: "open" | "paid"; updatedAt: string };
    dispatch({ type: "UPDATE_DEBT", payload: { ...paymentDebt, remainingAmount: paymentResult.remainingAmount, status: paymentResult.status, updatedAt: new Date(paymentResult.updatedAt) } });
    showToast({ type: "success", title: "Pembayaran tercatat", message: `Sisa ${formatRupiah(paymentResult.remainingAmount)}.` });
    setPaymentDebt(null);
    setPayment("");
  }

  return (
    <div className="space-y-5 font-ui">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Komitmen keuangan</p><h1 className="page-title mt-1">Utang & Piutang</h1><p className="page-subtitle">Pantau dana yang harus dibayar dan yang masih harus diterima.</p></div>
        <Button onClick={() => openForm()} disabled={connection.status === "loading"}><Plus className="h-4 w-4" /> Catat baru</Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card overflow-hidden border-ember/15 bg-[linear-gradient(145deg,#FFF8F8,#FFECEF)]"><div className="flex items-center justify-between"><div><p className="eyebrow text-ember">Harus dibayar</p><p className="mt-3 text-3xl font-black tracking-tight text-ink">{formatRupiah(payable)}</p><p className="mt-1 text-xs text-ink-muted">{openItems.filter((item) => item.direction === "payable").length} catatan aktif</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-ember-10 text-ember"><ArrowUpRight /></div></div></article>
        <article className="card overflow-hidden border-mint/15 bg-[linear-gradient(145deg,#F7FFFC,#E6F8F2)]"><div className="flex items-center justify-between"><div><p className="eyebrow text-mint">Harus diterima</p><p className="mt-3 text-3xl font-black tracking-tight text-ink">{formatRupiah(receivable)}</p><p className="mt-1 text-xs text-ink-muted">{openItems.filter((item) => item.direction === "receivable").length} catatan aktif</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-10 text-mint"><ArrowDownLeft /></div></div></article>
      </section>

      <section className="card border-pine/10 bg-white/85">
        <div className="flex items-center justify-between border-b border-rule pb-4"><div><p className="eyebrow">Daftar catatan</p><h2 className="mt-1 text-lg font-extrabold text-ink">Semua utang dan piutang</h2></div><span className="rounded-full bg-pine-10 px-3 py-1 text-xs font-bold text-pine">{debts.length} catatan</span></div>
        <div className="mt-2 divide-y divide-rule/80">
          {debts.length ? debts.map((item) => {
            const paid = item.status === "paid" || item.remainingAmount === 0;
            const progress = item.amount ? ((item.amount - item.remainingAmount) / item.amount) * 100 : 0;
            return <article key={item.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase", item.direction === "payable" ? "bg-ember-10 text-ember" : "bg-mint-10 text-mint")}>{item.direction === "payable" ? "Utang" : "Piutang"}</span>{paid ? <span className="rounded-full bg-pine-10 px-2.5 py-1 text-[10px] font-extrabold text-pine">Lunas</span> : null}<h3 className="truncate text-sm font-extrabold text-ink">{item.person}</h3></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-rule"><div className={cn("h-full rounded-full", item.direction === "payable" ? "bg-ember" : "bg-mint")} style={{ width: `${Math.max(3, progress)}%` }} /></div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted"><span>Sisa <strong className="text-ink">{formatRupiah(item.remainingAmount)}</strong> dari {formatRupiah(item.amount)}</span>{item.dueDate ? <span>Jatuh tempo {formatDate(item.dueDate, "short")}</span> : null}{item.note ? <span>{item.note}</span> : null}</div>
              </div>
              <div className="flex items-center gap-2">{!paid ? <Button variant="soft" size="sm" onClick={() => { setPaymentDebt(item); setPayment(""); }}>Bayar / terima</Button> : null}<IconButton variant="ghost" aria-label="Edit" onClick={() => openForm(item)}><Pencil className="h-4 w-4" /></IconButton><IconButton variant="ghost" aria-label="Hapus" onClick={() => remove(item)} className="hover:bg-ember-10 hover:text-ember"><Trash2 className="h-4 w-4" /></IconButton></div>
            </article>;
          }) : <div className="py-16 text-center"><HandCoins className="mx-auto h-8 w-8 text-pine/50" /><p className="mt-3 text-sm font-bold text-ink">Belum ada catatan utang</p><p className="mt-1 text-xs text-ink-muted">Tambahkan utang atau piutang pertama Anda.</p></div>}
        </div>
      </section>

      {editing ? <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form onSubmit={save} className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-white shadow-float sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-[26px] sm:border sm:border-pine/10"><header className="flex items-start justify-between border-b border-rule p-5"><div><p className="eyebrow">{editing === "new" ? "Catatan baru" : "Perbarui catatan"}</p><h2 className="mt-1 text-xl font-black text-ink">{editing === "new" ? "Tambah utang atau piutang" : "Edit utang atau piutang"}</h2></div><IconButton type="button" variant="soft" aria-label="Tutup" onClick={() => setEditing(null)}><X className="h-4 w-4" /></IconButton></header>
        <div className="flex-1 space-y-5 overflow-y-auto p-5"><div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1.5">{(["payable", "receivable"] as DebtDirection[]).map((direction) => <button key={direction} type="button" onClick={() => setForm({ ...form, direction })} className={cn("rounded-xl px-3 py-3 text-xs font-extrabold transition", form.direction === direction ? direction === "payable" ? "bg-ember-10 text-ember ring-1 ring-ember/20" : "bg-mint-10 text-mint ring-1 ring-mint/20" : "text-ink-muted")}>{direction === "payable" ? "Saya berutang" : "Piutang saya"}</button>)}</div>
          <Field label="Nama pihak" required><Input value={form.person} onChange={(event) => setForm({ ...form, person: event.target.value })} placeholder="Nama orang atau lembaga" /></Field>
          <Field label="Nominal awal" required><Input inputMode="numeric" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value.replace(/\D/g, ""), remainingAmount: editing === "new" ? event.target.value.replace(/\D/g, "") : form.remainingAmount })} placeholder="0" /></Field>
          {editing !== "new" ? <Field label="Sisa nominal" required><Input inputMode="numeric" value={form.remainingAmount} onChange={(event) => setForm({ ...form, remainingAmount: event.target.value.replace(/\D/g, "") })} /></Field> : null}
          <Field label="Jatuh tempo" hint="Opsional"><DatePicker value={form.dueDate} onValueChange={(dueDate) => setForm({ ...form, dueDate })} /></Field>
          <Field label="Catatan" hint={`${form.note.length}/500`}><textarea className="min-h-28 w-full rounded-2xl border border-rule p-3 text-sm outline-none focus:border-pine focus:ring-2 focus:ring-pine/15" maxLength={500} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Keterangan kesepakatan atau cicilan" /></Field>
        </div><footer className="grid grid-cols-[auto_1fr] gap-2 border-t border-rule p-4"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Batal</Button><Button type="submit" loading={submitting}><Check className="h-4 w-4" /> Simpan catatan</Button></footer></form></div> : null}

      {paymentDebt ? <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"><form onSubmit={pay} className="w-full max-w-sm rounded-[24px] border border-pine/10 bg-white p-5 shadow-float"><div className="flex items-start justify-between"><div><p className="eyebrow">Kurangi sisa</p><h2 className="mt-1 text-xl font-black text-ink">Catat pembayaran</h2><p className="mt-1 text-xs text-ink-muted">Sisa saat ini {formatRupiah(paymentDebt.remainingAmount)}</p></div><IconButton type="button" variant="soft" aria-label="Tutup" onClick={() => setPaymentDebt(null)}><X className="h-4 w-4" /></IconButton></div><Field label="Nominal pembayaran" required className="mt-5"><Input autoFocus inputMode="numeric" value={payment} onChange={(event) => setPayment(event.target.value.replace(/\D/g, ""))} placeholder="0" /></Field><div className="mt-5 grid grid-cols-[auto_1fr] gap-2"><Button type="button" variant="outline" onClick={() => setPaymentDebt(null)}>Batal</Button><Button type="submit" loading={submitting}>Simpan pembayaran</Button></div></form></div> : null}
    </div>
  );
}
