"use server";

/**
 * actions/budgets.ts
 * Server Actions untuk pengelolaan alokasi anggaran (Appwrite + Demo Fallback).
 */

import { createSessionServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockBudgets, type Budget } from "@/lib/data/mock";

export async function getBudgetsAction(period?: string): Promise<{ data: Budget[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: period ? mockBudgets.filter(b => b.period === period) : mockBudgets };
  }

  try {
    const { databases } = await createSessionServerClient();
    const queries = [Query.equal("userId", user.id)];
    if (period) queries.push(Query.equal("period", period));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BUDGETS, queries);

    const mapped: Budget[] = response.documents.map((doc: any) => ({
      id: doc.$id,
      categoryId: doc.categoryId,
      period: doc.period,
      limitAmount: doc.limitAmount,
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: mockBudgets, error: err.message };
  }
}

export async function upsertBudgetAction(payload: Budget) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    if (payload.id && !payload.id.startsWith("bud-")) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        payload.id,
        {
          categoryId: payload.categoryId,
          period: payload.period,
          limitAmount: payload.limitAmount,
        }
      );
    } else {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        ID.unique(),
        {
          userId: user.id,
          categoryId: payload.categoryId,
          period: payload.period,
          limitAmount: payload.limitAmount,
        }
      );
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBudgetAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BUDGETS, id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
