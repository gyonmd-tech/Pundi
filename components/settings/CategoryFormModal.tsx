"use client";

/**
 * components/settings/CategoryFormModal.tsx
 * Form tambah/ubah kategori transaksi — ikon & warna dibatasi ke daftar
 * tetap (lihat lib/validations/category.ts) supaya selalu render benar di
 * CategoryIcon dan tetap konsisten dengan token warna semantik Pundi.
 */

import React, { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/validations/category";
import type { Category, CategoryType } from "@/lib/data/mock";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";
import { useToast } from "@/lib/context/ToastContext";
import { useApp } from "@/lib/data/store";

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: CategoryFormModalProps) {
  const { dispatch } = useApp();
  const { showToast } = useToast();
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<CategoryType>(category?.type ?? "expense");
  const [icon, setIcon] = useState<string>(() =>
    category && CATEGORY_ICONS.includes(category.icon as typeof CATEGORY_ICONS[number]) ? category.icon : CATEGORY_ICONS[0],
  );
  const [color, setColor] = useState<string>(() =>
    category && CATEGORY_COLORS.some((c) => c.value === category.color) ? category.color : CATEGORY_COLORS[0].value,
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      showToast({ type: "error", title: "Nama kosong", message: "Masukkan nama kategori." });
      return;
    }

    setSubmitting(true);
    const payload = { name: name.trim(), type, icon, color };
    const result = category
      ? await updateCategoryAction({ ...payload, id: category.id })
      : await createCategoryAction(payload);
    setSubmitting(false);

    if (!result.success) {
      showToast({ type: "error", title: "Kategori gagal disimpan", message: result.error || "Coba lagi beberapa saat." });
      return;
    }

    const generatedId = (result as { id?: string }).id;
    const saved: Category = { id: category?.id || generatedId || "", ...payload };
    dispatch({ type: category ? "UPDATE_CATEGORY" : "ADD_CATEGORY", payload: saved });
    showToast({ type: "success", title: category ? "Kategori Diperbarui" : "Kategori Dibuat", message: `${name} berhasil disimpan.` });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? "Ubah kategori" : "Kategori baru"} description="Ikon dan warna dipakai konsisten di seluruh grafik dan buku transaksi.">
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1.5">
          {(["expense", "income"] as CategoryType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-xl px-3 py-3 text-xs font-extrabold transition",
                type === t
                  ? t === "expense" ? "bg-ember-10 text-ember ring-1 ring-ember/20" : "bg-mint-10 text-mint ring-1 ring-mint/20"
                  : "text-ink-muted",
              )}
            >
              {t === "expense" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>

        <Field label="Nama kategori" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Langganan Digital" maxLength={100} />
        </Field>

        <div>
          <p className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
            Ikon <span className="font-normal text-ink-muted">Pratinjau</span>
          </p>
          <div className="grid grid-cols-7 gap-2">
            {CATEGORY_ICONS.map((iconKey) => (
              <button
                key={iconKey}
                type="button"
                onClick={() => setIcon(iconKey)}
                aria-label={iconKey}
                className={cn("flex items-center justify-center rounded-[12px] p-1 transition", icon === iconKey ? "ring-2 ring-brand-500" : "ring-1 ring-transparent hover:ring-rule")}
              >
                <CategoryIcon icon={iconKey} color={color} size={14} containerSize="sm" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-ink">Warna</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                onClick={() => setColor(swatch.value)}
                aria-label={swatch.label}
                title={swatch.label}
                className="grid h-9 w-9 place-items-center rounded-full transition"
                style={{ backgroundColor: swatch.value, boxShadow: color === swatch.value ? "0 0 0 3px var(--color-surface-high), 0 0 0 5px " + swatch.value : "none" }}
              >
                {color === swatch.value ? <Check size={15} className="text-white" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[14px] border border-rule bg-paper p-3">
          <CategoryIcon icon={icon} color={color} size={16} containerSize="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{name || "Nama kategori"}</p>
            <p className="text-xs text-ink-muted">{type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-rule pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={submitting}>{category ? "Simpan perubahan" : "Buat kategori"}</Button>
        </div>
      </form>
    </Modal>
  );
}
