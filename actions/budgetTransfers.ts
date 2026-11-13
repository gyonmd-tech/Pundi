"use server";

/**
 * actions/budgetTransfers.ts
 * Pindahkan jatah antar anggaran dalam satu siklus — hanya batas belanja yang
 * digeser, saldo rekening tidak berubah. Bisa dibatalkan (hapus catatannya).
 */
import { ID, Permission, Role } from "node-appwrite";
import { z } from "zod";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import { getAuthUserAction } from "./auth";

const transferSchema = z.object({
  fromBudgetId: z.string().min(1).max(36),
  toBudgetId: z.string().min(1).max(36),
  amount: z.number().int("Nominal harus bilangan bulat").positive("Nominal harus lebih dari 0").max(999_999_999_999, "Nominal terlalu besar"),
  date: z.coerce.date(),
  note: z.string().trim().max(200).optional(),
}).refine((data) => data.fromBudgetId !== data.toBudgetId, { message: "Pilih dua anggaran yang berbeda." });

const MISSING_COLLECTION = "Fitur pindahkan jatah belum aktif di database. Jalankan `npm run db:setup` sekali.";

function isMissingCollection(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return /collection.*(not found|could not be found)/i.test(message);
}

export async function createBudgetTransferAction(payload: { fromBudgetId: string; toBudgetId: string; amount: number; date?: Date; note?: string }) {
  const parsed = transferSchema.safeParse({ ...payload, date: payload.date ?? new Date() });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Data pemindahan tidak valid." };

  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: true, id: `btr-demo-${Date.now()}` };

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.BUDGETS, parsed.data.fromBudgetId, user.id);
    await getOwnedDocument(databases, COLLECTIONS.BUDGETS, parsed.data.toBudgetId, user.id);
    const created = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGET_TRANSFERS,
      ID.unique(),
      { userId: user.id, ...parsed.data, date: parsed.data.date.toISOString(), note: parsed.data.note || null },
      [Permission.read(Role.user(user.id)), Permission.update(Role.user(user.id)), Permission.delete(Role.user(user.id))],
    );
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: parsed.data.toBudgetId, action: "update",
      summary: `Memindahkan jatah Rp ${parsed.data.amount.toLocaleString("id-ID")} antar anggaran`, after: parsed.data,
    });
    return { success: true, id: created.$id };
  } catch (err: unknown) {
    if (isMissingCollection(err)) return { success: false, error: MISSING_COLLECTION };
    return { success: false, error: err instanceof Error ? err.message : "Jatah gagal dipindahkan." };
  }
}

export async function deleteBudgetTransferAction(id: string) {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo || id.startsWith("btr-demo-")) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.BUDGET_TRANSFERS, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BUDGET_TRANSFERS, id);
    await recordAuditLog(databases, user.id, {
      entityType: "budget", entityId: String(previous.toBudgetId ?? id), action: "delete",
      summary: "Membatalkan pemindahan jatah", before: previous,
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Pemindahan gagal dibatalkan." };
  }
}
