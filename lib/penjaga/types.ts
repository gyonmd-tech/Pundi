/**
 * lib/penjaga/types.ts
 * Tipe bersama (client + server) untuk Penjaga — Hermes Agent yang menjaga
 * ruang keuangan Pundi. Tidak boleh mengimpor modul server.
 */
import type { TransactionType } from "@/lib/data/mock";

export type DraftStatus = "pending" | "confirmed" | "rejected";
export type DraftSource = "hermes" | "hermes-app" | "demo";

export interface AgentDraft {
  id: string;
  status: DraftStatus;
  source: DraftSource | string;
  type: TransactionType;
  amount: number;
  accountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  /** ISO string. */
  date: string;
  note?: string;
  rawText?: string;
  transactionId?: string;
  createdAt: string;
}

/** Perubahan yang boleh dilakukan pengguna pada draft sebelum disimpan. */
export type DraftEdit = Partial<Pick<AgentDraft, "type" | "amount" | "accountId" | "destinationAccountId" | "categoryId" | "date" | "note">>;

export interface AgentTokenInfo {
  id: string;
  label: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  revoked: boolean;
}

export type PenjagaMood = "idle" | "thinking" | "talking" | "happy" | "alert" | "sleeping";

export interface PenjagaChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Nama tool yang sedang/telah dipanggil Hermes selama balasan ini. */
  tools?: string[];
  error?: boolean;
}
