/**
 * lib/penjaga/service.ts
 * Operasi data Penjaga yang berjalan atas nama satu userId — dipanggil dari
 * MCP (token Hermes) dan Server Action (sesi cookie). Semua akses lewat
 * admin client, jadi SETIAP fungsi wajib menyaring berdasarkan userId.
 *
 * Alur: Hermes membaca konteks → menyusun draft → pengguna mengonfirmasi
 * (di app, atau dengan persetujuan eksplisit di chat Hermes) → draft
 * menjadi transaksi lewat createTransactionForUser.
 */
import { ID, Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import { documentPermissions, type TransactionInput } from "@/lib/appwrite/transactionHelpers";
import { createTransactionForUser, transactionFromDocument } from "@/lib/appwrite/transactionService";
import type { Account, Category, Transaction, TransactionType } from "@/lib/data/mock";
import { matchByName } from "./matching";
import type { AgentDraft, DraftEdit } from "./types";

type AdminDatabases = Awaited<ReturnType<typeof createAdminServerClient>>["databases"];

export const PENJAGA_TIMEZONE = "Asia/Jakarta";
const MAX_DRAFTS_PER_CALL = 30;

/** "YYYY-MM-DD" hari ini di zona waktu Jakarta. */
export function todayInJakarta(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PENJAGA_TIMEZONE }).format(now);
}

/** Tanggal kalender → pukul 12:00 WIB, supaya tidak bergeser hari di zona mana pun. */
export function parseCalendarDate(value: string | undefined | null) {
  const day = value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : todayInJakarta();
  const date = new Date(`${day}T12:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? new Date(`${todayInJakarta()}T12:00:00+07:00`) : date;
}

function draftFromDocument(document: Models.Document): AgentDraft {
  const fields = document as unknown as Record<string, unknown>;
  return {
    id: document.$id,
    status: fields.status as AgentDraft["status"],
    source: String(fields.source ?? "hermes"),
    type: fields.type as TransactionType,
    amount: Number(fields.amount),
    accountId: (fields.accountId as string) || undefined,
    destinationAccountId: (fields.destinationAccountId as string) || undefined,
    categoryId: (fields.categoryId as string) || undefined,
    date: String(fields.date),
    note: (fields.note as string) || undefined,
    rawText: (fields.rawText as string) || undefined,
    transactionId: (fields.transactionId as string) || undefined,
    createdAt: document.$createdAt,
  };
}

export async function loadLedger(databases: AdminDatabases, userId: string) {
  const [accounts, categories] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.ACCOUNTS, [Query.equal("userId", userId), Query.limit(100)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, [Query.equal("userId", userId), Query.limit(200)]),
  ]);
  return {
    accounts: accounts.documents.map((document) => ({
      id: document.$id,
      name: String(document.name),
      type: document.type,
      balance: Number(document.balance ?? 0),
      colorTag: String(document.colorTag ?? ""),
      isActive: document.isActive !== false,
    })) as Account[],
    categories: categories.documents.map((document) => ({
      id: document.$id,
      name: String(document.name),
      type: document.type,
      icon: String(document.icon ?? "circle"),
      color: String(document.color ?? ""),
    })) as Category[],
  };
}

/* ------------------------------------------------------------------ */
/* Draft                                                               */
/* ------------------------------------------------------------------ */

export interface DraftRequest {
  type: TransactionType;
  amount: number;
  /** ID atau nama rekening. */
  account?: string;
  destinationAccount?: string;
  /** ID atau nama kategori. */
  category?: string;
  /** "YYYY-MM-DD"; kosong = hari ini (WIB). */
  date?: string;
  note?: string;
  rawText?: string;
}

export interface DraftResult {
  draft: AgentDraft;
  /** Hal yang masih perlu dilengkapi pengguna sebelum draft bisa disimpan. */
  missing: string[];
}

export async function createDrafts(userId: string, requests: DraftRequest[], source: string): Promise<DraftResult[]> {
  if (!Array.isArray(requests) || requests.length === 0) throw new Error("Tidak ada transaksi untuk dicatat.");
  if (requests.length > MAX_DRAFTS_PER_CALL) throw new Error(`Maksimal ${MAX_DRAFTS_PER_CALL} transaksi per permintaan.`);

  const { databases } = await createAdminServerClient();
  const { accounts, categories } = await loadLedger(databases, userId);
  const activeAccounts = accounts.filter((account) => account.isActive);
  const results: DraftResult[] = [];

  for (const request of requests) {
    const type = request.type;
    if (!["income", "expense", "transfer"].includes(type)) throw new Error(`Jenis transaksi "${type}" tidak valid.`);
    const amount = Math.round(Number(request.amount));
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error(`Nominal "${request.amount}" tidak valid.`);

    const missing: string[] = [];
    const account = matchByName(activeAccounts, request.account) ?? (activeAccounts.length === 1 ? activeAccounts[0] : undefined);
    if (!account) missing.push("rekening");
    const destination = type === "transfer" ? matchByName(activeAccounts, request.destinationAccount) : undefined;
    if (type === "transfer" && !destination) missing.push("rekening tujuan");
    const category = type === "transfer"
      ? undefined
      : matchByName(categories.filter((item) => item.type === type), request.category);
    if (type !== "transfer" && !category) missing.push("kategori");

    const data: Record<string, unknown> = {
      userId,
      status: "pending",
      source,
      type,
      amount,
      date: parseCalendarDate(request.date).toISOString(),
    };
    if (account) data.accountId = account.id;
    if (destination) data.destinationAccountId = destination.id;
    if (category) data.categoryId = category.id;
    if (request.note) data.note = String(request.note).slice(0, 500);
    if (request.rawText) data.rawText = String(request.rawText).slice(0, 1000);

    const document = await databases.createDocument(
      DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, ID.unique(), data, documentPermissions(userId),
    );
    results.push({ draft: draftFromDocument(document), missing });
  }

  await recordAuditLog(databases, userId, {
    entityType: "agent_draft", action: "create", actor: "agent",
    summary: `Penjaga menyiapkan ${results.length} draft transaksi`,
    after: results.map(({ draft }) => ({ type: draft.type, amount: draft.amount, note: draft.note })),
  });
  return results;
}

export async function listDrafts(userId: string, status: AgentDraft["status"] = "pending", limit = 50) {
  const { databases } = await createAdminServerClient();
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, [
    Query.equal("userId", userId),
    Query.equal("status", status),
    Query.orderDesc("date"),
    Query.limit(Math.min(Math.max(limit, 1), 100)),
  ]);
  return response.documents.map(draftFromDocument);
}

async function getOwnedDraft(databases: AdminDatabases, userId: string, id: string) {
  const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, id);
  if (String(document.userId) !== userId) throw new Error("Draft tidak ditemukan.");
  return draftFromDocument(document);
}

export interface ConfirmOutcome {
  draftId: string;
  ok: boolean;
  error?: string;
  transaction?: Transaction;
}

/**
 * Menyimpan draft menjadi transaksi nyata. `edits` berisi koreksi pengguna
 * (mis. rekening/kategori yang belum terdeteksi). Draft yang bukan
 * "pending" dilewati — konfirmasi ganda tidak membuat transaksi ganda.
 */
export async function confirmDrafts(userId: string, ids: string[], edits: Record<string, DraftEdit> = {}, via: "app" | "hermes" = "app") {
  const { databases } = await createAdminServerClient();
  const outcomes: ConfirmOutcome[] = [];

  for (const id of [...new Set(ids)].slice(0, MAX_DRAFTS_PER_CALL)) {
    try {
      const stored = await getOwnedDraft(databases, userId, id);
      if (stored.status !== "pending") throw new Error("Draft ini sudah diproses.");
      const draft = { ...stored, ...edits[id] };
      if (!draft.accountId) throw new Error("Pilih rekening terlebih dahulu.");

      const payload: TransactionInput = {
        type: draft.type,
        amount: Math.round(Number(draft.amount)),
        accountId: draft.accountId,
        destinationAccountId: draft.type === "transfer" ? draft.destinationAccountId : undefined,
        transferKind: draft.type === "transfer" ? "account" : undefined,
        categoryId: draft.type === "transfer" ? undefined : draft.categoryId,
        date: parseCalendarDate(draft.date),
        note: draft.note,
        tags: ["penjaga"],
        recordKind: "standard",
      };
      const document = await createTransactionForUser(databases, userId, payload, {
        actor: "agent",
        summary: `Penjaga mencatat ${draft.type === "income" ? "pemasukan" : draft.type === "expense" ? "pengeluaran" : "transfer"}${draft.note ? ` "${draft.note}"` : ""} (dikonfirmasi lewat ${via === "app" ? "aplikasi" : "chat Hermes"})`,
      });
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, id, {
        status: "confirmed",
        transactionId: document.$id,
        type: payload.type,
        amount: payload.amount,
        accountId: payload.accountId,
        destinationAccountId: payload.destinationAccountId ?? null,
        categoryId: payload.categoryId ?? null,
        date: payload.date.toISOString(),
        note: payload.note ?? null,
      });
      outcomes.push({ draftId: id, ok: true, transaction: transactionFromDocument(document) });
    } catch (error) {
      outcomes.push({ draftId: id, ok: false, error: error instanceof Error ? error.message : "Draft gagal disimpan." });
    }
  }
  return outcomes;
}

export async function rejectDrafts(userId: string, ids: string[]) {
  const { databases } = await createAdminServerClient();
  let rejected = 0;
  for (const id of [...new Set(ids)].slice(0, MAX_DRAFTS_PER_CALL)) {
    const draft = await getOwnedDraft(databases, userId, id).catch(() => null);
    if (!draft || draft.status !== "pending") continue;
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, id, { status: "rejected" });
    rejected += 1;
  }
  if (rejected) {
    await recordAuditLog(databases, userId, {
      entityType: "agent_draft", action: "delete", summary: `Menolak ${rejected} draft Penjaga`,
    });
  }
  return rejected;
}

/* ------------------------------------------------------------------ */
/* Konteks & ringkasan untuk Hermes                                    */
/* ------------------------------------------------------------------ */

export async function getFinanceContext(userId: string) {
  const { databases } = await createAdminServerClient();
  const { accounts, categories } = await loadLedger(databases, userId);
  const pending = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AGENT_DRAFTS, [
    Query.equal("userId", userId), Query.equal("status", "pending"), Query.limit(1),
  ]);
  return {
    today: todayInJakarta(),
    timezone: PENJAGA_TIMEZONE,
    currency: "IDR",
    accounts: accounts.filter((account) => account.isActive).map(({ id, name, type, balance }) => ({ id, name, type, balance })),
    categories: categories.map(({ id, name, type }) => ({ id, name, type })),
    pendingDrafts: pending.total,
  };
}

export async function listTransactionsBetween(userId: string, from: string, to: string, limit = 100) {
  const { databases } = await createAdminServerClient();
  const start = new Date(`${from}T00:00:00+07:00`);
  const end = new Date(`${to}T23:59:59.999+07:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Format tanggal harus YYYY-MM-DD.");
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
    Query.equal("userId", userId),
    Query.greaterThanEqual("date", start.toISOString()),
    Query.lessThanEqual("date", end.toISOString()),
    Query.orderDesc("date"),
    Query.limit(Math.min(Math.max(limit, 1), 500)),
  ]);
  return response.documents.map(transactionFromDocument);
}

export async function summarizePeriod(userId: string, from: string, to: string) {
  const { databases } = await createAdminServerClient();
  const [{ categories }, transactions] = await Promise.all([
    loadLedger(databases, userId),
    listTransactionsBetween(userId, from, to, 500),
  ]);
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const standard = transactions.filter((transaction) => transaction.recordKind !== "balance_adjustment");
  const income = standard.filter((transaction) => transaction.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = standard.filter((transaction) => transaction.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const byCategory = new Map<string, number>();
  for (const transaction of standard) {
    if (transaction.type !== "expense") continue;
    const name = categoryName.get(transaction.categoryId ?? "") ?? "Tanpa kategori";
    byCategory.set(name, (byCategory.get(name) ?? 0) + transaction.amount);
  }
  return {
    from, to, income, expense, net: income - expense,
    transactionCount: standard.length,
    topExpenseCategories: [...byCategory].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, total]) => ({ name, total })),
  };
}
