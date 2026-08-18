"use server";

/**
 * actions/insights.ts
 * Server Actions untuk pengelolaan insight dan notifikasi finansial.
 */

import { createSessionServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockInsights, type Insight } from "@/lib/data/mock";

export async function getInsightsAction(): Promise<{ data: Insight[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockInsights };
  }

  try {
    const { databases } = await createSessionServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INSIGHTS,
      [Query.equal("userId", user.id), Query.orderDesc("$createdAt")]
    );

    const mapped: Insight[] = response.documents.map((doc: any) => ({
      id: doc.$id,
      type: doc.type,
      message: doc.message,
      isRead: doc.isRead,
      createdAt: new Date(doc.$createdAt),
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: mockInsights, error: err.message };
  }
}

export async function markAllInsightsReadAction() {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    const unread = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INSIGHTS,
      [Query.equal("userId", user.id), Query.equal("isRead", false)]
    );

    for (const doc of unread.documents) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.INSIGHTS, doc.$id, {
        isRead: true,
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
