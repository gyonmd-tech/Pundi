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

import { CATEGORY_COLORS, CATEGORY_ICONS } from "./categoryOptions";

export { CATEGORY_COLORS, CATEGORY_ICONS };

const categoryColorValues = CATEGORY_COLORS.map((c) => c.value) as [string, ...string[]];

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Masukkan nama kategori").max(100, "Nama maksimal 100 karakter"),
  type: z.enum(["income", "expense"]),
  icon: z.enum(CATEGORY_ICONS),
  color: z.enum(categoryColorValues),
});

export const updateCategorySchema = createCategorySchema.and(z.object({ id: z.string().min(1) }));

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
