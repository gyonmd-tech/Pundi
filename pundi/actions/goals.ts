"use server";

/**
 * actions/goals.ts
 * Server Actions untuk tujuan tabungan (Appwrite + Demo Fallback).
 */

import { createSessionServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockGoals, type Goal } from "@/lib/data/mock";

export async function getGoalsAction(): Promise<{ data: Goal[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockGoals };
  }

  try {
    const { databases } = await createSessionServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      [Query.equal("userId", user.id)]
    );

    const mapped: Goal[] = response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      targetAmount: doc.targetAmount,
      currentAmount: doc.currentAmount || 0,
      targetDate: new Date(doc.targetDate),
      linkedAccountId: doc.linkedAccountId,
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: mockGoals, error: err.message };
  }
}

export async function createGoalAction(payload: Omit<Goal, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: `goal-${Date.now()}` };
  }

  try {
    const { databases } = await createSessionServerClient();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      ID.unique(),
      {
        userId: user.id,
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: payload.currentAmount || 0,
        targetDate: payload.targetDate.toISOString(),
        linkedAccountId: payload.linkedAccountId,
      }
    );

    return { success: true, id: doc.$id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateGoalAction(payload: Goal) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      payload.id,
      {
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: payload.currentAmount,
        targetDate: payload.targetDate.toISOString(),
        linkedAccountId: payload.linkedAccountId,
      }
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteGoalAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GOALS, id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
