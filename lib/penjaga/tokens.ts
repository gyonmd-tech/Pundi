/**
 * lib/penjaga/tokens.ts
 * Token akses pribadi untuk Hermes Agent (Penjaga). Token mentah hanya
 * ditampilkan SEKALI saat dibuat; database hanya menyimpan hash SHA-256-nya,
 * jadi kebocoran database tidak membocorkan token yang bisa dipakai.
 */
import { createHash, randomBytes } from "node:crypto";
import { Query } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";

const TOKEN_PREFIX = "pnd_";

export function generateAgentToken() {
  const token = `${TOKEN_PREFIX}${randomBytes(24).toString("base64url")}`;
  return { token, hash: hashAgentToken(token), prefix: token.slice(0, 10) };
}

export function hashAgentToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Mengembalikan userId pemilik token, atau null bila token tidak valid/dicabut. */
export async function resolveAgentToken(token: string | null | undefined): Promise<string | null> {
  if (!token || !token.startsWith(TOKEN_PREFIX) || token.length > 128) return null;
  const { databases } = await createAdminServerClient();
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AGENT_TOKENS, [
    Query.equal("tokenHash", hashAgentToken(token)),
    Query.limit(1),
  ]);
  const document = response.documents[0];
  if (!document || document.revoked) return null;

  // Catat pemakaian terakhir paling banyak sekali per menit — tidak perlu menulis di setiap panggilan tool.
  const lastUsed = document.lastUsedAt ? new Date(String(document.lastUsedAt)).getTime() : 0;
  if (Date.now() - lastUsed > 60_000) {
    databases.updateDocument(DATABASE_ID, COLLECTIONS.AGENT_TOKENS, document.$id, {
      lastUsedAt: new Date().toISOString(),
    }).catch(() => undefined);
  }
  return String(document.userId);
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() ?? null;
}
