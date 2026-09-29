"use server";

/**
 * actions/recurring.ts
 * Server Actions untuk aturan transaksi berulang (gaji, langganan, tagihan
 * rutin). Aturan hanya menyimpan jadwal — transaksi nyata dibuat oleh
 * generateDueRecurringTransactions() yang dipanggil dari
 * actions/bootstrap.ts setiap kali data pengguna dimuat (lihat catatan di
 * sana untuk alasan tidak memakai cron/Appwrite Function).
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockRecurringRules, type RecurringRule } from "@/lib/data/mock";
import { createRecurringRuleSchema } from "@/lib/validations/recurring";
import { recurringRuleFromDocument } from "@/lib/appwrite/recurringMapper";

function rulePermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

export async function getRecurringRulesAction(): Promise<{ data: RecurringRule[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: mockRecurringRules };

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RECURRING_RULES, [
      Query.equal("userId", user.id),
      Query.orderAsc("nextOccurrence"),
    ]);
    return { data: response.documents.map(recurringRuleFromDocument) };
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : "Aturan berulang tidak dapat dimuat." };
  }
}

export async function createRecurringRuleAction(payload: Omit<RecurringRule, "id" | "nextOccurrence" | "isActive" | "lastGeneratedDate">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true, id: `rec-demo-${Date.now()}` };

  const parsed = createRecurringRuleSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data aturan berulang tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, parsed.data.accountId, user.id);
    if (parsed.data.destinationAccountId) {
      await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, parsed.data.destinationAccountId, user.id);
    }
    if (parsed.data.categoryId) {
      await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, parsed.data.categoryId, user.id);
    }
    if (parsed.data.goalId) {
      await getOwnedDocument(databases, COLLECTIONS.GOALS, parsed.data.goalId, user.id);
    }

    // Kejadian pertama adalah startDate itu sendiri; loop generasi di
    // actions/bootstrap.ts akan membuat transaksinya begitu startDate <= now.
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RECURRING_RULES,
      ID.unique(),
      {
        userId: user.id,
        accountId: parsed.data.accountId,
        destinationAccountId: parsed.data.destinationAccountId,
        categoryId: parsed.data.categoryId,
        goalId: parsed.data.goalId,
        type: parsed.data.type,
        amount: parsed.data.amount,
        note: parsed.data.note,
        frequency: parsed.data.frequency,
        startDate: parsed.data.startDate.toISOString(),
        nextOccurrence: parsed.data.startDate.toISOString(),
        endDate: parsed.data.endDate?.toISOString(),
        isActive: true,
      },
      rulePermissions(user.id),
    );
    return { success: true, id: document.$id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Aturan berulang gagal disimpan." };
  }
}

export async function updateRecurringRuleAction(payload: Omit<RecurringRule, "nextOccurrence" | "lastGeneratedDate">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  const parsed = createRecurringRuleSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data aturan berulang tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.RECURRING_RULES, payload.id, user.id);
    if (parsed.data.goalId) {
      await getOwnedDocument(databases, COLLECTIONS.GOALS, parsed.data.goalId, user.id);
    }
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, payload.id, {
      accountId: parsed.data.accountId,
      destinationAccountId: parsed.data.destinationAccountId ?? null,
      categoryId: parsed.data.categoryId ?? null,
      goalId: parsed.data.goalId ?? null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
      frequency: parsed.data.frequency,
      startDate: parsed.data.startDate.toISOString(),
      nextOccurrence: parsed.data.startDate.toISOString(),
      endDate: parsed.data.endDate?.toISOString() ?? null,
      isActive: payload.isActive,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Aturan berulang gagal diperbarui." };
  }
}

export async function toggleRecurringRuleAction(id: string, isActive: boolean) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.RECURRING_RULES, id, user.id);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, id, { isActive });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Status aturan gagal diperbarui." };
  }
}

export async function deleteRecurringRuleAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.RECURRING_RULES, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Aturan berulang gagal dihapus." };
  }
}
