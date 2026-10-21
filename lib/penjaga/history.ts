/**
 * lib/penjaga/history.ts
 * Riwayat chat Penjaga di Appwrite (ADR-002). Semua fungsi menerima userId
 * dari sesi server dan memverifikasi kepemilikan thread — klien tidak
 * pernah bisa membaca/menulis thread milik akun lain.
 *
 * Bukan file "use server".
 */
import { ID, Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { documentPermissions } from "@/lib/appwrite/transactionHelpers";
import type { ChatThread, PenjagaChatMessage } from "./types";

const MAX_CONTENT = 12000;

type Fields = Record<string, unknown>;

function threadFromDocument(raw: Models.Document): ChatThread {
  const document = raw as Models.Document & Fields;
  return {
    id: document.$id,
    title: String(document.title),
    preview: document.preview ? String(document.preview) : undefined,
    lastMessageAt: String(document.lastMessageAt),
  };
}

function messageFromDocument(raw: Models.Document): PenjagaChatMessage {
  const document = raw as Models.Document & Fields;
  return {
    id: document.$id,
    role: document.role === "assistant" ? "assistant" : "user",
    content: String(document.content ?? ""),
    tools: Array.isArray(document.tools) && document.tools.length ? document.tools.map(String) : undefined,
    error: Boolean(document.error) || undefined,
  };
}

/** Judul dari pesan pertama — tanpa memanggil AI (gratis & instan). */
export function titleFromMessage(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 48) return clean || "Percakapan baru";
  const cut = clean.slice(0, 48);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 32))}…`;
}

async function getOwnedThread(userId: string, threadId: string) {
  const { databases } = await createAdminServerClient();
  const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.CHAT_THREADS, threadId).catch(() => null);
  if (!document || String(document.userId) !== userId) throw new Error("Percakapan tidak ditemukan.");
  return document;
}

export async function listThreads(userId: string, limit = 50) {
  const { databases } = await createAdminServerClient();
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_THREADS, [
    Query.equal("userId", userId),
    Query.orderDesc("lastMessageAt"),
    Query.limit(Math.min(Math.max(limit, 1), 100)),
  ]);
  return response.documents.map(threadFromDocument);
}

export async function createThread(userId: string, firstMessage: string) {
  const { databases } = await createAdminServerClient();
  const document = await databases.createDocument(
    DATABASE_ID, COLLECTIONS.CHAT_THREADS, ID.unique(),
    { userId, title: titleFromMessage(firstMessage), preview: firstMessage.slice(0, 200), lastMessageAt: new Date().toISOString() },
    documentPermissions(userId),
  );
  return threadFromDocument(document);
}

/** Pesan thread urut lama → baru. `limit` mengambil N pesan terakhir. */
export async function getThreadMessages(userId: string, threadId: string, limit = 200) {
  await getOwnedThread(userId, threadId);
  const { databases } = await createAdminServerClient();
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
    Query.equal("threadId", threadId),
    Query.orderDesc("$createdAt"),
    Query.limit(Math.min(Math.max(limit, 1), 500)),
  ]);
  return response.documents.map(messageFromDocument).reverse();
}

export async function appendMessage(
  userId: string,
  threadId: string,
  message: { role: "user" | "assistant"; content: string; tools?: string[]; error?: boolean },
) {
  await getOwnedThread(userId, threadId);
  const { databases } = await createAdminServerClient();
  const content = message.content.slice(0, MAX_CONTENT) || (message.error ? "Terjadi kesalahan." : "…");
  const document = await databases.createDocument(
    DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, ID.unique(),
    {
      userId,
      threadId,
      role: message.role,
      content,
      tools: (message.tools ?? []).slice(0, 12).map((tool) => tool.slice(0, 64)),
      error: Boolean(message.error),
    },
    documentPermissions(userId),
  );
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.CHAT_THREADS, threadId, {
    lastMessageAt: new Date().toISOString(),
    preview: content.replace(/\s+/g, " ").slice(0, 200),
  });
  return messageFromDocument(document);
}

export async function deleteThread(userId: string, threadId: string) {
  await getOwnedThread(userId, threadId);
  const { databases } = await createAdminServerClient();
  // Hapus pesan dalam batch (Appwrite membatasi 100 dokumen per list).
  for (let round = 0; round < 20; round += 1) {
    const page = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
      Query.equal("threadId", threadId), Query.limit(100),
    ]);
    if (!page.documents.length) break;
    await Promise.all(page.documents.map((document) => databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, document.$id)));
  }
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHAT_THREADS, threadId);
}
