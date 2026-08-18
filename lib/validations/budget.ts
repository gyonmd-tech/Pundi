/**
 * lib/validations/budget.ts
 * Zod schemas untuk validasi anggaran.
 */
import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId:  z.string().min(1, "Pilih kategori"),
  period:      z.string().regex(/^\d{4}-\d{2}$/, "Format periode: YYYY-MM"),
  limitAmount: z
    .number()
    .positive("Batas anggaran harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
});

export const updateBudgetSchema = createBudgetSchema.extend({
  id: z.string().min(1),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
