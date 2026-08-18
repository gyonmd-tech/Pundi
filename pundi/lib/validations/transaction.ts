/**
 * lib/validations/transaction.ts
 * Zod schemas untuk validasi transaksi.
 */
import { z } from "zod";

export const TransactionTypeEnum = z.enum(["income", "expense", "transfer", "INCOME", "EXPENSE", "TRANSFER"]);

export const createTransactionSchema = z.object({
  accountId:  z.string().min(1, "Pilih akun"),
  categoryId: z.string().optional(),
  type:       TransactionTypeEnum,
  amount:     z
    .number()
    .positive("Nominal harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
  date:  z.coerce.date(),
  note:  z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  tags:  z.array(z.string()).default([]),
  toAccountId: z.string().optional(),
}).refine(
  (data) => {
    const t = data.type.toLowerCase();
    return t !== "transfer" || !!data.toAccountId;
  },
  { message: "Pilih akun tujuan untuk transfer", path: ["toAccountId"] }
);

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1),
});

export const deleteTransactionSchema = z.object({
  id: z.string().min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
