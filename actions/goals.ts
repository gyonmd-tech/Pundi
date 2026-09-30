"use server";

/**
 * actions/goals.ts
 * Server Actions untuk tujuan tabungan (Appwrite + Demo Fallback).
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query, type Models } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockGoals, type Goal } from "@/lib/data/mock";
import { createGoalSchema } from "@/lib/validations/goal";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

interface GoalFields {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  linkedAccountId?: string;
}

export async function getGoalsAction(): Promise<{ data: Goal[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockGoals };
  }

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      [Query.equal("userId", user.id)]
    );

    const mapped: Goal[] = response.documents.map((doc: Models.Document) => {
      const fields = doc as unknown as GoalFields;
      return {
        id: doc.$id,
        name: fields.name,
        targetAmount: fields.targetAmount,
        currentAmount: fields.currentAmount || 0,
        targetDate: new Date(fields.targetDate),
        linkedAccountId: fields.linkedAccountId,
      };
    });

    return { data: mapped };
  } catch (err: unknown) {
    return { data: mockGoals, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createGoalAction(payload: Omit<Goal, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: `goal-${Date.now()}` };
  }

  const parsed = createGoalSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tujuan tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      ID.unique(),
      {
        userId: user.id,
        name: parsed.data.name,
        targetAmount: parsed.data.targetAmount,
        currentAmount: parsed.data.currentAmount,
        targetDate: parsed.data.targetDate.toISOString(),
        linkedAccountId: parsed.data.linkedAccountId,
      },
      [
        Permission.read(Role.user(user.id)),
        Permission.update(Role.user(user.id)),
        Permission.delete(Role.user(user.id)),
      ]
    );

    await recordAuditLog(databases, user.id, {
      entityType: "goal", entityId: doc.$id, action: "create",
      summary: `Membuat tujuan "${parsed.data.name}"`, after: parsed.data,
    });
    return { success: true, id: doc.$id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateGoalAction(payload: Goal) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  const parsed = createGoalSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tujuan tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.GOALS, payload.id, user.id);
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      payload.id,
      {
        name: parsed.data.name,
        targetAmount: parsed.data.targetAmount,
        currentAmount: parsed.data.currentAmount,
        targetDate: parsed.data.targetDate.toISOString(),
        linkedAccountId: parsed.data.linkedAccountId,
      }
    );

    await recordAuditLog(databases, user.id, {
      entityType: "goal", entityId: payload.id, action: "update",
      summary: `Mengubah tujuan "${parsed.data.name}"`, before: previous, after: parsed.data,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteGoalAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.GOALS, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GOALS, id);
    await recordAuditLog(databases, user.id, {
      entityType: "goal", entityId: id, action: "delete",
      summary: `Menghapus tujuan "${(previous as unknown as { name?: string }).name ?? ""}"`, before: previous,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
