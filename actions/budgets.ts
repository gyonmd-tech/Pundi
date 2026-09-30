"use server";

/**
 * actions/budgets.ts
 * Server Actions untuk pengelolaan alokasi anggaran (Appwrite + Demo Fallback).
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query, type Models } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockBudgets, type Budget } from "@/lib/data/mock";
import { createBudgetSchema } from "@/lib/validations/budget";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

interface BudgetFields {
  categoryId: string;
  period: string;
  limitAmount: number;
}

export async function getBudgetsAction(period?: string): Promise<{ data: Budget[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: period ? mockBudgets.filter(b => b.period === period) : mockBudgets };
  }

  try {
    const { databases } = await createAdminServerClient();
    const queries = [Query.equal("userId", user.id)];
    if (period) queries.push(Query.equal("period", period));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BUDGETS, queries);

    const mapped: Budget[] = response.documents.map((doc: Models.Document) => {
      const fields = doc as unknown as BudgetFields;
      return {
        id: doc.$id,
        categoryId: fields.categoryId,
        period: fields.period,
        limitAmount: fields.limitAmount,
      };
    });

    return { data: mapped };
  } catch (err: unknown) {
    return { data: mockBudgets, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function upsertBudgetAction(payload: Budget) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: payload.id || `bud-demo-${Date.now()}` };
  }

  const parsed = createBudgetSchema.safeParse({
    categoryId: payload.categoryId,
    period: payload.period,
    limitAmount: payload.limitAmount,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    if (payload.id && !payload.id.startsWith("bud-")) {
      const previous = await getOwnedDocument(databases, COLLECTIONS.BUDGETS, payload.id, user.id);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        payload.id,
        parsed.data
      );
      await recordAuditLog(databases, user.id, {
        entityType: "budget", entityId: payload.id, action: "update",
        summary: `Mengubah anggaran periode ${parsed.data.period}`, before: previous, after: parsed.data,
      });
      return { success: true, id: payload.id };
    }

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      ID.unique(),
      {
        userId: user.id,
        ...parsed.data,
      },
      [
        Permission.read(Role.user(user.id)),
        Permission.update(Role.user(user.id)),
        Permission.delete(Role.user(user.id)),
      ]
    );
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: document.$id, action: "create",
      summary: `Membuat anggaran periode ${parsed.data.period}`, after: parsed.data,
    });
    return { success: true, id: document.$id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteBudgetAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.BUDGETS, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BUDGETS, id);
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: id, action: "delete",
      summary: "Menghapus anggaran", before: previous,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
