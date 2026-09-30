"use client";

import * as React from "react";
import { Camera, Check, UserRound } from "lucide-react";
import { updateProfileNameAction } from "@/actions/auth";
import { uploadAvatarAction } from "@/actions/preferences";
import { getAvatarUrl } from "@/lib/appwrite/storage";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/context/ToastContext";

interface ProfileNameModalProps {
  open: boolean;
  currentName: string;
  email: string;
  avatarFileId?: string;
  isDemo?: boolean;
  onClose: () => void;
  onSaved: (name: string) => void;
  onAvatarUploaded?: (fileId: string) => void;
}

export function ProfileNameModal({ open, currentName, email, avatarFileId, isDemo, onClose, onSaved, onAvatarUploaded }: ProfileNameModalProps) {
  const [name, setName] = React.useState(currentName);
  const [pending, setPending] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const avatarSrc = previewUrl || (avatarFileId ? getAvatarUrl(avatarFileId) : null);

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

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isDemo) {
      showToast({ type: "error", title: "Tidak tersedia di mode demo", message: "Avatar hanya bisa diubah pada akun cloud." });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadAvatarAction(formData);
    setUploadingAvatar(false);

    if (!result.success || !result.avatarFileId) {
      showToast({ type: "error", title: "Avatar gagal diunggah", message: result.error || "Coba lagi beberapa saat." });
      setPreviewUrl(null);
      return;
    }
    onAvatarUploaded?.(result.avatarFileId);
    showToast({ type: "success", title: "Avatar diperbarui", message: "Foto profilmu sudah tersimpan." });
  }

  return (
    <Modal open={open} onClose={onClose} title="Ubah profil" description="Nama dan foto ini ditampilkan pada sidebar dan halaman pengaturan.">
      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-[18px] border border-pine/12 bg-pine-10/55 p-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white text-pine shadow-2xs"
            aria-label="Ubah foto profil"
            title="Ubah foto profil"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-ink">{currentName}</p><p className="mt-0.5 truncate text-xs text-ink-muted">{email}</p></div>
        </div>
        <Field label="Nama lengkap" required><Input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} autoComplete="name" autoFocus /></Field>
        <Field label="Alamat email"><Input value={email} readOnly className="bg-paper text-ink-muted" /></Field>
        <div className="flex justify-end gap-2 border-t border-rule pt-4"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" loading={pending}><Check className="h-4 w-4" />Simpan profil</Button></div>
      </form>
    </Modal>
  );
}
