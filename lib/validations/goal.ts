/**
 * lib/validations/goal.ts
 * Zod schemas untuk validasi tujuan tabungan.
 */
import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1, "Masukkan nama tujuan").max(100, "Nama maksimal 100 karakter"),
  targetAmount: z
    .number()
    .int("Target harus berupa bilangan bulat")
    .positive("Target harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
  currentAmount: z
    .number()
    .int("Progres harus berupa bilangan bulat")
    .min(0, "Progres tidak boleh negatif")
    .max(999_999_999_999, "Nominal terlalu besar")
    .default(0),
  targetDate: z.coerce.date(),
  linkedAccountId: z.string().min(1).optional(),
});

export const updateGoalSchema = createGoalSchema.extend({
  id: z.string().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
