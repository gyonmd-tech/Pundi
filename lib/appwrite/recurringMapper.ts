/**
 * lib/appwrite/recurringMapper.ts
 * Konversi dokumen Appwrite recurring_rules ↔ tipe RecurringRule aplikasi.
 * Bukan file "use server" — dipakai oleh actions/recurring.ts dan
 * actions/bootstrap.ts (generasi transaksi berulang).
 */
import type { Models } from "node-appwrite";
import type { RecurringRule } from "@/lib/data/mock";

interface RecurringRuleFields {
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  goalId?: string;
  type: RecurringRule["type"];
  amount: number;
  note?: string;
  frequency: RecurringRule["frequency"];
  startDate: string;
  nextOccurrence: string;
  endDate?: string;
  isActive: boolean;
  lastGeneratedDate?: string;
}

export function recurringRuleFromDocument(document: Models.Document): RecurringRule {
  const f = document as unknown as RecurringRuleFields;
  return {
    id: document.$id,
    accountId: f.accountId,
    destinationAccountId: f.destinationAccountId || undefined,
    categoryId: f.categoryId || undefined,
    goalId: f.goalId || undefined,
    type: f.type,
    amount: Number(f.amount),
    note: f.note || undefined,
    frequency: f.frequency,
    startDate: new Date(f.startDate),
    nextOccurrence: new Date(f.nextOccurrence),
    endDate: f.endDate ? new Date(f.endDate) : undefined,
    isActive: f.isActive !== false,
    lastGeneratedDate: f.lastGeneratedDate ? new Date(f.lastGeneratedDate) : undefined,
  };
}
