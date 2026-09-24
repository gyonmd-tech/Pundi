"use client";

import * as React from "react";
import { Check, UserRound } from "lucide-react";
import { updateProfileNameAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/context/ToastContext";

export function ProfileNameModal({ open, currentName, email, onClose, onSaved }: { open: boolean; currentName: string; email: string; onClose: () => void; onSaved: (name: string) => void }) {
  const [name, setName] = React.useState(currentName);
  const [pending, setPending] = React.useState(false);
  const { showToast } = useToast();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await updateProfileNameAction(name);
    setPending(false);
    if (!result.success || !result.name) {
      showToast({ type: "error", title: "Profil gagal diperbarui", message: result.error ?? "Coba lagi beberapa saat." });
      return;
    }
    onSaved(result.name);
    showToast({ type: "success", title: "Profil diperbarui", message: "Nama Anda sudah tersimpan di akun cloud." });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Ubah profil" description="Nama ini ditampilkan pada sidebar dan halaman pengaturan.">
      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-[18px] border border-pine/12 bg-pine-10/55 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white text-pine shadow-2xs"><UserRound className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-ink">{currentName}</p><p className="mt-0.5 truncate text-xs text-ink-muted">{email}</p></div>
        </div>
        <Field label="Nama lengkap" required><Input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} autoComplete="name" autoFocus /></Field>
        <Field label="Alamat email"><Input value={email} readOnly className="bg-paper text-ink-muted" /></Field>
        <div className="flex justify-end gap-2 border-t border-rule pt-4"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={pending}><Check className="h-4 w-4" />Simpan profil</Button></div>
      </form>
    </Modal>
  );
}