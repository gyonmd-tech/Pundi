"use server";

/**
 * actions/insights.ts
 * Server Actions untuk pengelolaan insight dan notifikasi finansial.
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Query, type Models } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockInsights, type Insight } from "@/lib/data/mock";

export async function getInsightsAction(): Promise<{ data: Insight[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockInsights };
  }

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INSIGHTS,
      [Query.equal("userId", user.id), Query.orderDesc("$createdAt")]
    );

    const mapped: Insight[] = response.documents.map((doc: Models.Document) => {
      const fields = doc as unknown as { type: Insight["type"]; message: string; isRead: boolean };
      return {
        id: doc.$id,
        type: fields.type,
        message: fields.message,
        isRead: fields.isRead,
        createdAt: new Date(doc.$createdAt),
      };
    });

    return { data: mapped };
  } catch (err: unknown) {
    return { data: mockInsights, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function markAllInsightsReadAction() {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createAdminServerClient();
    const unread = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INSIGHTS,
      [Query.equal("userId", user.id), Query.equal("isRead", false)]
    );

    for (const doc of unread.documents) {
      await getOwnedDocument(databases, COLLECTIONS.INSIGHTS, doc.$id, user.id);
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.INSIGHTS, doc.$id, {
        isRead: true,
      });
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
