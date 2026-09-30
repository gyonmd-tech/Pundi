"use server";

/**
 * actions/activityLog.ts
 * Pembacaan audit log dengan filter & paginasi cursor. Sengaja TIDAK ikut
 * getAppBootstrapAction (lib/appwrite/auditLog.ts) — datanya bisa besar dan
 * hanya dibutuhkan saat pengguna membuka halaman Log Aktivitas, jadi
 * di-fetch on-demand dari sini.
 */

import { Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getAuthUserAction } from "./auth";
import type { AuditAction, AuditActor, AuditEntityType } from "@/lib/appwrite/auditLog";

export interface AuditLogItem {
  id: string;
  entityType: AuditEntityType;
  entityId?: string;
  action: AuditAction;
  actor: AuditActor;
  summary: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export interface GetAuditLogsParams {
  entityType?: AuditEntityType;
  action?: AuditAction;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

interface AuditLogFields {
  entityType: AuditEntityType;
  entityId?: string;
  action: AuditAction;
  actor: AuditActor;
  summary: string;
  before?: string;
  after?: string;
}

function parseJson(value?: string): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function fromDocument(doc: Models.Document): AuditLogItem {
  const fields = doc as unknown as AuditLogFields;
  return {
    id: doc.$id,
    entityType: fields.entityType,
    entityId: fields.entityId || undefined,
    action: fields.action,
    actor: fields.actor,
    summary: fields.summary,
    before: parseJson(fields.before),
    after: parseJson(fields.after),
    createdAt: doc.$createdAt,
  };
}

export async function getAuditLogsAction(params: GetAuditLogsParams = {}): Promise<{
  data: AuditLogItem[];
  nextCursor?: string;
  error?: string;
}> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: [] };

  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);

  try {
    const { databases } = await createAdminServerClient();
    const queries = [
      Query.equal("userId", user.id),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];
    if (params.entityType) queries.push(Query.equal("entityType", params.entityType));
    if (params.action) queries.push(Query.equal("action", params.action));
    if (params.from) queries.push(Query.greaterThanEqual("$createdAt", params.from));
    if (params.to) queries.push(Query.lessThanEqual("$createdAt", params.to));
    if (params.cursor) queries.push(Query.cursorAfter(params.cursor));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AUDIT_LOGS, queries);
    const data = response.documents.map(fromDocument);
    const nextCursor = data.length === limit ? response.documents[response.documents.length - 1].$id : undefined;

    return { data, nextCursor };
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : "Log aktivitas tidak dapat dimuat." };
  }
}
