/**
 * lib/validations/category.ts
 * Zod schemas untuk validasi kategori transaksi.
 *
 * `icon` dan `color` sengaja dibatasi ke daftar tetap, bukan input bebas:
 * - icon harus salah satu kunci yang benar-benar dikenal CategoryIcon
 *   (components/ui/CategoryIcon.tsx `iconMap`) — kalau lolos nilai lain,
 *   ikon akan diam-diam jatuh ke fallback Tag, jadi lebih baik dicegah
 *   dari sisi validasi.
 * - color harus salah satu token semantik brand Pundi (MASTER.md melarang
 *   warna dekoratif bebas), bukan hex bebas.
 */
import { z } from "zod";

export const CATEGORY_ICONS = [
  "utensils", "car", "shopping-bag", "music", "heart", "zap", "book",
  "piggy-bank", "more-horizontal", "briefcase", "laptop", "trending-up",
  "plus-circle", "tag",
] as const;

export const CATEGORY_COLORS = [
  { value: "#2459DE", label: "Biru" },
  { value: "#159B78", label: "Hijau" },
  { value: "#E95766", label: "Merah" },
  { value: "#D99418", label: "Kuning" },
  { value: "#7B61D1", label: "Ungu" },
  { value: "#168AA0", label: "Cyan" },
] as const;

const categoryColorValues = CATEGORY_COLORS.map((c) => c.value) as [string, ...string[]];

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Masukkan nama kategori").max(100, "Nama maksimal 100 karakter"),
  type: z.enum(["income", "expense"]),
  icon: z.enum(CATEGORY_ICONS),
  color: z.enum(categoryColorValues),
});

export const updateCategorySchema = createCategorySchema.and(z.object({ id: z.string().min(1) }));

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
