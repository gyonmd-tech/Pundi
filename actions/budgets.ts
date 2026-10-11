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
  cadence?: Budget["cadence"] | null;
  cadenceAmount?: number | null;
  rollover?: boolean | null;
}

const CADENCE_KEYS = ["cadence", "cadenceAmount", "rollover"] as const;

/**
 * Database lama (sebelum `npm run db:setup` dijalankan ulang) belum punya
 * atribut cadence/cadenceAmount/rollover. Daripada gagal total, simpan versi
 * bulanan saja dan beri tahu pengguna lewat `warning`.
 */
function isUnknownAttributeError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return /unknown attribute/i.test(message) && CADENCE_KEYS.some((key) => message.includes(key));
}

function withoutCadence<T extends Record<string, unknown>>(data: T) {
  const copy: Record<string, unknown> = { ...data };
  for (const key of CADENCE_KEYS) delete copy[key];
  return copy;
}

const SCHEMA_WARNING =
  "Anggaran tersimpan sebagai bulanan. Jalankan `npm run db:setup` sekali agar jatah harian/mingguan bisa disimpan di database.";

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
        cadence: fields.cadence ?? "monthly",
        cadenceAmount: fields.cadenceAmount ?? undefined,
        rollover: fields.rollover ?? true,
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
    cadence: payload.cadence ?? "monthly",
    cadenceAmount: payload.cadence && payload.cadence !== "monthly" ? payload.cadenceAmount : undefined,
    rollover: payload.rollover ?? true,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    if (payload.id && !payload.id.startsWith("bud-")) {
      const previous = await getOwnedDocument(databases, COLLECTIONS.BUDGETS, payload.id, user.id);
      let warning: string | undefined;
      try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.BUDGETS, payload.id, { ...parsed.data, cadenceAmount: parsed.data.cadenceAmount ?? null });
      } catch (err) {
        if (!isUnknownAttributeError(err)) throw err;
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.BUDGETS, payload.id, withoutCadence(parsed.data));
        warning = SCHEMA_WARNING;
      }
      await recordAuditLog(databases, user.id, {
        entityType: "budget", entityId: payload.id, action: "update",
        summary: `Mengubah anggaran periode ${parsed.data.period}`, before: previous, after: parsed.data,
      });
      return { success: true, id: payload.id, warning };
    }

    const permissions = [
      Permission.read(Role.user(user.id)),
      Permission.update(Role.user(user.id)),
      Permission.delete(Role.user(user.id)),
    ];
    let warning: string | undefined;
    let documentId: string;
    try {
      const created = await databases.createDocument(DATABASE_ID, COLLECTIONS.BUDGETS, ID.unique(), { userId: user.id, ...parsed.data } as Record<string, unknown>, permissions);
      documentId = created.$id;
    } catch (err) {
      if (!isUnknownAttributeError(err)) throw err;
      const created = await databases.createDocument(DATABASE_ID, COLLECTIONS.BUDGETS, ID.unique(), { userId: user.id, ...withoutCadence(parsed.data) }, permissions);
      documentId = created.$id;
      warning = SCHEMA_WARNING;
    }
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: documentId, action: "create",
      summary: `Membuat anggaran periode ${parsed.data.period}`, after: parsed.data,
    });
    return { success: true, id: documentId, warning };
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
