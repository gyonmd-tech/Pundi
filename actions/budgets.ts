"use server";

/**
 * actions/budgets.ts
 * Server Actions untuk pengelolaan alokasi anggaran (Appwrite + Demo Fallback).
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockBudgets, type Budget } from "@/lib/data/mock";
import { createBudgetSchema } from "@/lib/validations/budget";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import { budgetFromDocument } from "@/lib/appwrite/budgetMapper";

/**
 * Atribut opsional yang mungkin belum ada di database lama (sebelum
 * `npm run db:setup` dijalankan ulang). Daripada gagal total, simpan tanpa
 * kelompok atribut yang ditolak dan beri tahu pengguna lewat `warning`.
 */
const OPTIONAL_GROUPS = [
  { keys: ["leftoverGoalId"], warning: "Sisa jatah ke tujuan belum tersimpan. Jalankan `npm run db:setup` sekali untuk menambah kolomnya." },
  { keys: ["startDate", "repeat", "accountIds"], warning: "Tanggal mulai, pengulangan, dan sumber dana belum tersimpan. Jalankan `npm run db:setup` sekali untuk menambah kolomnya." },
  { keys: ["cadence", "cadenceAmount", "rollover"], warning: "Anggaran tersimpan sebagai per siklus. Jalankan `npm run db:setup` sekali agar jatah harian/mingguan bisa disimpan." },
] as const;

function rejectedGroup(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (!/unknown attribute/i.test(message)) return null;
  return OPTIONAL_GROUPS.find((group) => group.keys.some((key) => message.includes(key))) ?? null;
}

function without(data: Record<string, unknown>, keys: readonly string[]) {
  const copy = { ...data };
  for (const key of keys) delete copy[key];
  return copy;
}

/** Tulis dokumen; bila atribut belum ada di database, ulangi tanpa kelompok itu (maks. 2 kali). */
async function writeWithFallback(write: (data: Record<string, unknown>) => Promise<string>, data: Record<string, unknown>) {
  let current = data;
  const warnings: string[] = [];
  for (let attempt = 0; attempt <= OPTIONAL_GROUPS.length; attempt++) {
    try {
      return { id: await write(current), warning: warnings.join(" ") || undefined };
    } catch (err) {
      const group = rejectedGroup(err);
      if (!group || warnings.includes(group.warning)) throw err;
      warnings.push(group.warning);
      current = without(current, group.keys);
    }
  }
  throw new Error("Anggaran gagal disimpan.");
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

    return { data: response.documents.map(budgetFromDocument) };
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
    startDate: payload.startDate,
    repeat: payload.repeat ?? true,
    accountIds: payload.accountIds ?? [],
    leftoverGoalId: payload.leftoverGoalId || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, parsed.data.categoryId, user.id);
    // Sumber dana hanya boleh rekening milik pengguna sendiri.
    for (const accountId of parsed.data.accountIds) {
      await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, accountId, user.id);
    }
    if (parsed.data.leftoverGoalId) await getOwnedDocument(databases, COLLECTIONS.GOALS, parsed.data.leftoverGoalId, user.id);
    const data: Record<string, unknown> = {
      ...parsed.data,
      cadenceAmount: parsed.data.cadenceAmount ?? null,
      startDate: parsed.data.startDate ? parsed.data.startDate.toISOString() : null,
      leftoverGoalId: parsed.data.leftoverGoalId ?? null,
    };

    if (payload.id && !payload.id.startsWith("bud-")) {
      const previous = await getOwnedDocument(databases, COLLECTIONS.BUDGETS, payload.id, user.id);
      const { warning } = await writeWithFallback(async (body) => {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.BUDGETS, payload.id, body);
        return payload.id;
      }, data);
      await recordAuditLog(databases, user.id, {
        entityType: "budget", entityId: payload.id, action: "update",
        summary: `Mengubah anggaran mulai ${parsed.data.period}`, before: previous, after: parsed.data,
      });
      return { success: true, id: payload.id, warning };
    }

    const permissions = [
      Permission.read(Role.user(user.id)),
      Permission.update(Role.user(user.id)),
      Permission.delete(Role.user(user.id)),
    ];
    const { id: documentId, warning } = await writeWithFallback(async (body) => {
      const created = await databases.createDocument(DATABASE_ID, COLLECTIONS.BUDGETS, ID.unique(), { userId: user.id, ...body }, permissions);
      return created.$id;
    }, data);
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: documentId, action: "create",
      summary: `Membuat anggaran mulai ${parsed.data.period}`, after: parsed.data,
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
