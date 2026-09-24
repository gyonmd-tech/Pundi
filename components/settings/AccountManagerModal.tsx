"use client";

import * as React from "react";
import { Check, Plus, Trash2, WalletCards } from "lucide-react";
import { createAccountAction, deleteAccountAction, updateAccountAction } from "@/actions/accounts";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/context/ToastContext";
import { useApp } from "@/lib/data/store";
import type { Account, AccountType } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

const accountTypes: Array<{ value: AccountType; label: string }> = [
  { value: "bank", label: "Rekening bank" },
  { value: "ewallet", label: "Dompet digital" },
  { value: "cash", label: "Uang tunai" },
  { value: "credit_card", label: "Kartu kredit" },
  { value: "investment", label: "Investasi" },
];

const colors = ["#5B4AEF", "#3E86ED", "#159B78", "#F0A33B", "#E95766", "#9B72E8"];

export function AccountManagerModal({ open, account, onClose }: { open: boolean; account: Account | null; onClose: () => void }) {
  const { dispatch, connection } = useApp();
  const { showToast } = useToast();
  const [name, setName] = React.useState(account?.name ?? "");
  const [type, setType] = React.useState<AccountType>(account?.type ?? "bank");
  const [balance, setBalance] = React.useState(String(account?.balance ?? 0));
  const [colorTag, setColorTag] = React.useState(account?.colorTag ?? colors[0]);
  const [isActive, setIsActive] = React.useState(account?.isActive ?? true);
  const [pending, setPending] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const isEditing = Boolean(account);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const numericBalance = Number(balance || 0);
    if (!name.trim() || !Number.isSafeInteger(numericBalance)) {
      showToast({ type: "error", title: "Data rekening belum valid", message: "Isi nama dan saldo rekening dengan benar." });
      return;
    }

    const payload = { name: name.trim(), type, balance: numericBalance, colorTag, isActive };
    setPending(true);
    const result: { success: boolean; id?: string; error?: string } = account
      ? await updateAccountAction({ ...payload, id: account.id })
      : await createAccountAction(payload);
    setPending(false);

    if (!result.success) {
      showToast({ type: "error", title: "Rekening gagal disimpan", message: result.error ?? "Coba lagi beberapa saat." });
      return;
    }

    const saved: Account = { ...payload, id: account?.id ?? result.id ?? `acc-${Date.now()}` };
    dispatch({ type: account ? "UPDATE_ACCOUNT" : "ADD_ACCOUNT", payload: saved });
    showToast({ type: "success", title: account ? "Rekening diperbarui" : "Rekening ditambahkan", message: `${saved.name} sudah tersimpan ${connection.mode === "cloud" ? "di cloud" : "untuk sesi demo"}.` });
    onClose();
  }

  async function remove() {
    if (!account) return;
    setPending(true);
    const result = await deleteAccountAction(account.id);
    setPending(false);
    if (!result.success) {
      setConfirmDelete(false);
      showToast({ type: "error", title: "Rekening tidak dapat dihapus", message: result.error ?? "Coba lagi beberapa saat." });
      return;
    }
    dispatch({ type: "DELETE_ACCOUNT", payload: account.id });
    showToast({ type: "success", title: "Rekening dihapus", message: `${account.name} sudah dihapus.` });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Kelola rekening" : "Tambah rekening"} description="Perubahan langsung tersinkron dengan data keuangan Anda.">
      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="rounded-[20px] border border-sky/15 bg-[linear-gradient(145deg,rgba(234,243,255,.9),rgba(255,255,255,.95))] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white text-sky shadow-2xs"><WalletCards className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-extrabold text-ink">{name || "Rekening baru"}</p><p className="mt-0.5 text-xs text-ink-muted">{accountTypes.find((item) => item.value === type)?.label}</p></div>
            <span className="ml-auto h-8 w-2 rounded-full" style={{ backgroundColor: colorTag }} />
          </div>
        </div>

        <Field label="Nama rekening" required>
          <Input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Contoh: BCA Tabungan" autoFocus />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis rekening" required>
            <Select value={type} onChange={(event) => setType(event.target.value as AccountType)}>
              {accountTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
          </Field>
          <Field label={isEditing ? "Saldo saat ini" : "Saldo awal"} required>
            <Input inputMode="numeric" value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d-]/g, ""))} placeholder="0" />
          </Field>
        </div>

        <Field label="Warna rekening">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Warna rekening">
            {colors.map((color) => (
              <button key={color} type="button" role="radio" aria-checked={colorTag === color} aria-label={`Pilih warna ${color}`} onClick={() => setColorTag(color)} className={cn("grid h-10 w-10 place-items-center rounded-[13px] border-2 transition hover:-translate-y-0.5", colorTag === color ? "border-ink shadow-sm" : "border-transparent")} style={{ backgroundColor: `${color}20` }}>
                <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>{colorTag === color ? <Check className="h-3.5 w-3.5" /> : null}</span>
              </button>
            ))}
          </div>
        </Field>

        <button type="button" role="switch" aria-checked={isActive} onClick={() => setIsActive((value) => !value)} className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-rule bg-paper/70 px-4 py-3 text-left">
          <span><span className="block text-sm font-extrabold text-ink">Rekening aktif</span><span className="mt-0.5 block text-xs text-ink-muted">Tampilkan pada pilihan transaksi dan ringkasan.</span></span>
          <span className={cn("relative h-7 w-12 rounded-full transition", isActive ? "bg-pine" : "bg-rule")}><span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition", isActive ? "left-6" : "left-1")} /></span>
        </button>

        {confirmDelete ? (
          <div className="rounded-[16px] border border-ember/20 bg-ember-10 p-4">
            <p className="text-sm font-extrabold text-ink">Hapus rekening ini?</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">Rekening hanya dapat dihapus jika saldonya nol dan belum memiliki riwayat transaksi.</p>
            <div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Batal</Button><Button type="button" size="sm" variant="danger" loading={pending} onClick={remove}><Trash2 className="h-4 w-4" />Hapus</Button></div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-rule pt-4 sm:flex-row sm:justify-between">
          <div>{isEditing && !confirmDelete ? <Button type="button" variant="ghost" className="text-ember hover:bg-ember-10 hover:text-ember" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" />Hapus rekening</Button> : null}</div>
          <div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={pending}>{isEditing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{isEditing ? "Simpan perubahan" : "Tambah rekening"}</Button></div>
        </div>
      </form>
    </Modal>
  );
}