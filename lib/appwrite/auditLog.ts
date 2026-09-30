/**
 * lib/appwrite/auditLog.ts
 * Pencatatan audit log — dipanggil dari dalam setiap Server Action mutasi
 * (actions/*.ts) tepat setelah operasi utamanya berhasil. Mengikuti pola
 * lib/appwrite/insightGenerator.ts: bukan file "use server", menerima
 * `databases` yang sudah dibuat pemanggil, dan TIDAK PERNAH melempar error
 * — logging yang gagal tidak boleh menggagalkan aksi utama yang sudah
 * berhasil disimpan.
 */
import { ID, Permission, Role, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";

export type AuditEntityType =
  | "account" | "transaction" | "budget" | "goal" | "asset"
  | "debt" | "category" | "recurring_rule" | "insight" | "preferences" | "avatar";
export type AuditAction = "create" | "update" | "delete" | "toggle" | "generate" | "payment";
export type AuditActor = "user" | "system";

export interface AuditLogEntry {
  entityType: AuditEntityType;
  entityId?: string;
  action: AuditAction;
  actor?: AuditActor;
  summary: string;
  before?: unknown;
  after?: unknown;
}

function truncateJson(value: unknown): string | undefined {
  if (value == null) return undefined;
  try {
    const json = JSON.stringify(value);
    return json.length > 1900 ? json.slice(0, 1900) : json;
  } catch {
    return undefined;
  }
}

export async function recordAuditLog(
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  userId: string,
  entry: AuditLogEntry,
): Promise<void> {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.AUDIT_LOGS,
      ID.unique(),
      {
        userId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        actor: entry.actor ?? "user",
        summary: entry.summary,
        before: truncateJson(entry.before),
        after: truncateJson(entry.after),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    );
  } catch (error) {
    console.error(`Gagal mencatat audit log (${entry.entityType}:${entry.action}):`, error instanceof Error ? error.message : error);
  }
}

export interface AuditLogDocument extends Models.Document {
  entityType: AuditEntityType;
  entityId?: string;
  action: AuditAction;
  actor: AuditActor;
  summary: string;
  before?: string;
  after?: string;
}
