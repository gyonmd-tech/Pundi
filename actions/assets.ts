"use server";

/**
 * actions/assets.ts
 * Server Actions untuk portofolio aset & investasi (Appwrite + Demo Fallback).
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query, type Models } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockAssets, type Asset, type AssetType } from "@/lib/data/mock";
import { createAssetSchema } from "@/lib/validations/asset";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

interface AssetFields {
  type: AssetType;
  name: string;
  units: number;
  buyPrice: number;
  currentPrice: number;
}

export async function getAssetsAction(): Promise<{ data: Asset[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockAssets };
  }

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
      [Query.equal("userId", user.id)]
    );

    const mapped: Asset[] = response.documents.map((doc: Models.Document) => {
      const fields = doc as unknown as AssetFields;
      return {
        id: doc.$id,
        type: fields.type,
        name: fields.name,
        units: fields.units,
        buyPrice: fields.buyPrice,
        currentPrice: fields.currentPrice,
        updatedAt: new Date(doc.$updatedAt || doc.$createdAt),
      };
    });

    return { data: mapped };
  } catch (err: unknown) {
    return { data: mockAssets, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createAssetAction(payload: Omit<Asset, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: `ast-${Date.now()}` };
  }

  const parsed = createAssetSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data aset tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
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
      entityType: "asset", entityId: doc.$id, action: "create",
      summary: `Menambah aset "${parsed.data.name}"`, after: parsed.data,
    });
    return { success: true, id: doc.$id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateAssetAction(payload: Asset) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  const parsed = createAssetSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data aset tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.ASSETS, payload.id, user.id);
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ASSETS,
      payload.id,
      parsed.data
    );

    await recordAuditLog(databases, user.id, {
      entityType: "asset", entityId: payload.id, action: "update",
      summary: `Mengubah aset "${parsed.data.name}"`, before: previous, after: parsed.data,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteAssetAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.ASSETS, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ASSETS, id);
    await recordAuditLog(databases, user.id, {
      entityType: "asset", entityId: id, action: "delete",
      summary: `Menghapus aset "${(previous as unknown as { name?: string }).name ?? ""}"`, before: previous,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
