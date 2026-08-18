/**
 * lib/validations/goal.ts
 */
import { z } from "zod";

export const createGoalSchema = z.object({
  name:           z.string().min(1, "Masukkan nama tujuan").max(100),
  targetAmount:   z
    .number()
    .positive("Target harus lebih dari 0"),
  currentAmount:  z.number().min(0).default(0),
  targetDate:     z.coerce.date(),
  linkedAccountId: z.string().optional(),
});

export const updateGoalSchema = createGoalSchema.extend({
  id: z.string().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
