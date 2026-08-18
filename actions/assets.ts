"use server";

/**
 * actions/assets.ts
 * Server Actions untuk portofolio aset & investasi (Appwrite + Demo Fallback).
 */

import { createSessionServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockAssets, type Asset } from "@/lib/data/mock";

export async function getAssetsAction(): Promise<{ data: Asset[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockAssets };
  }

  try {
    const { databases } = await createSessionServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
      [Query.equal("userId", user.id)]
    );

    const mapped: Asset[] = response.documents.map((doc: any) => ({
      id: doc.$id,
      type: doc.type,
      name: doc.name,
      units: doc.units,
      buyPrice: doc.buyPrice,
      currentPrice: doc.currentPrice,
      updatedAt: new Date(doc.$updatedAt || doc.$createdAt),
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: mockAssets, error: err.message };
  }
}

export async function createAssetAction(payload: Omit<Asset, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: `ast-${Date.now()}` };
  }

  try {
    const { databases } = await createSessionServerClient();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
      ID.unique(),
      {
        userId: user.id,
        type: payload.type,
        name: payload.name,
        units: payload.units,
        buyPrice: payload.buyPrice,
        currentPrice: payload.currentPrice,
      }
    );

    return { success: true, id: doc.$id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAssetAction(payload: Asset) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
      payload.id,
      {
        type: payload.type,
        name: payload.name,
        units: payload.units,
        buyPrice: payload.buyPrice,
        currentPrice: payload.currentPrice,
      }
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAssetAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ASSETS, id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
