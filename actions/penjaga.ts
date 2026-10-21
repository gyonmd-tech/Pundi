"use server";

/**
 * actions/penjaga.ts
 * Server Actions halaman Penjaga: status koneksi Hermes, token MCP, dan
 * peninjauan draft. Mode demo/guest tidak menyentuh server — draft demo
 * hidup di state klien (lihat components/penjaga/usePenjaga.ts).
 */
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { generateAgentToken } from "@/lib/penjaga/tokens";
import { getHermesChatAccess, type HermesChatAccess } from "@/lib/penjaga/config";
import { confirmDrafts, listDrafts, rejectDrafts } from "@/lib/penjaga/service";
import type { AgentDraft, AgentTokenInfo, DraftEdit } from "@/lib/penjaga/types";
import type { Transaction } from "@/lib/data/mock";

const MAX_ACTIVE_TOKENS = 5;

export interface PenjagaStatus {
  mode: "guest" | "demo" | "cloud";
  chat: HermesChatAccess | "demo";
}

export async function getPenjagaStatusAction(): Promise<PenjagaStatus> {
  const user = await getAuthUserAction();
  if (!user) return { mode: "guest", chat: "demo" };
  if (user.isDemo) return { mode: "demo", chat: "demo" };
  return { mode: "cloud", chat: getHermesChatAccess(user.email) };
}

export async function getPendingDraftsAction(): Promise<{ data: AgentDraft[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: [] };
  try {
    return { data: await listDrafts(user.id, "pending") };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Draft tidak dapat dimuat." };
  }
}

export interface ConfirmDraftsResult {
  success: boolean;
  error?: string;
  saved: { draftId: string; transaction: Transaction }[];
  failed: { draftId: string; error: string }[];
}

export async function confirmDraftsAction(ids: string[], edits: Record<string, DraftEdit> = {}): Promise<ConfirmDraftsResult> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: false, error: "Mode demo menyimpan draft di perangkat.", saved: [], failed: [] };
  if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: "Pilih draft yang akan disimpan.", saved: [], failed: [] };

  try {
    const outcomes = await confirmDrafts(user.id, ids, edits, "app");
    return {
      success: outcomes.some((outcome) => outcome.ok),
      saved: outcomes.flatMap((outcome) => outcome.ok && outcome.transaction ? [{ draftId: outcome.draftId, transaction: outcome.transaction }] : []),
      failed: outcomes.flatMap((outcome) => outcome.ok ? [] : [{ draftId: outcome.draftId, error: outcome.error ?? "Gagal disimpan." }]),
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Draft gagal disimpan.", saved: [], failed: [] };
  }
}

export async function rejectDraftsAction(ids: string[]) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true, rejected: ids.length };
  try {
    return { success: true, rejected: await rejectDrafts(user.id, ids) };
  } catch (error) {
    return { success: false, rejected: 0, error: error instanceof Error ? error.message : "Draft gagal dibuang." };
  }
}

/* ------------------------------------------------------------------ */
/* Token MCP untuk Hermes                                              */
/* ------------------------------------------------------------------ */

export async function listAgentTokensAction(): Promise<{ data: AgentTokenInfo[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: [] };
  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AGENT_TOKENS, [
      Query.equal("userId", user.id), Query.orderDesc("$createdAt"), Query.limit(20),
    ]);
    return {
      data: response.documents.map((document) => ({
        id: document.$id,
        label: String(document.label),
        prefix: String(document.prefix),
        lastUsedAt: document.lastUsedAt ? String(document.lastUsedAt) : undefined,
        createdAt: document.$createdAt,
        revoked: Boolean(document.revoked),
      })),
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Token tidak dapat dimuat." };
  }
}

/** Token mentah hanya dikembalikan di sini, sekali. */
export async function createAgentTokenAction(label: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: false, error: "Buat akun untuk menghubungkan Hermes Agent." };

  const name = label.trim().slice(0, 80) || "Hermes Agent";
  try {
    const { databases } = await createAdminServerClient();
    const active = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AGENT_TOKENS, [
      Query.equal("userId", user.id), Query.equal("revoked", false), Query.limit(MAX_ACTIVE_TOKENS + 1),
    ]);
    if (active.total >= MAX_ACTIVE_TOKENS) {
      return { success: false, error: `Maksimal ${MAX_ACTIVE_TOKENS} token aktif. Cabut token lama terlebih dahulu.` };
    }

    const { token, hash, prefix } = generateAgentToken();
    const document = await databases.createDocument(
      DATABASE_ID, COLLECTIONS.AGENT_TOKENS, ID.unique(),
      { userId: user.id, label: name, tokenHash: hash, prefix, revoked: false },
      [],
    );
    await recordAuditLog(databases, user.id, {
      entityType: "agent_token", entityId: document.$id, action: "create", summary: `Membuat token Penjaga "${name}"`,
    });
    return { success: true, token };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Token gagal dibuat." };
  }
}

export async function revokeAgentTokenAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: false, error: "Sesi login telah berakhir." };
  try {
    const { databases } = await createAdminServerClient();
    const document = await getOwnedDocument(databases, COLLECTIONS.AGENT_TOKENS, id, user.id);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.AGENT_TOKENS, id, { revoked: true });
    await recordAuditLog(databases, user.id, {
      entityType: "agent_token", entityId: id, action: "delete", summary: `Mencabut token Penjaga "${String(document.label)}"`,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Token gagal dicabut." };
  }
}
