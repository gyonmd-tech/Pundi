/**
 * lib/validations/recurring.ts
 * Zod schemas untuk validasi aturan transaksi berulang.
 */
import { z } from "zod";

export const RecurringFrequencyEnum = z.enum(["weekly", "monthly", "yearly"]);
export const RecurringTypeEnum = z.enum(["income", "expense", "transfer"]);

export const createRecurringRuleSchema = z
  .object({
    accountId: z.string().min(1, "Pilih akun"),
    destinationAccountId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    type: RecurringTypeEnum,
    amount: z
      .number()
      .int("Nominal harus berupa bilangan bulat")
      .positive("Nominal harus lebih dari 0")
      .max(999_999_999_999, "Nominal terlalu besar"),
    note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
    frequency: RecurringFrequencyEnum,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => data.type !== "transfer" || !!data.destinationAccountId, {
    message: "Pilih akun tujuan untuk transfer berulang",
    path: ["destinationAccountId"],
  })
  .refine((data) => !data.endDate || data.endDate > data.startDate, {
    message: "Tanggal berakhir harus setelah tanggal mulai",
    path: ["endDate"],
  });

export const updateRecurringRuleSchema = createRecurringRuleSchema.and(
  z.object({ id: z.string().min(1) }),
);

export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleSchema>;
