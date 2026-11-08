/**
 * lib/appwrite/recurringGenerator.ts
 * Membuat transaksi yang jatuh tempo dari aturan berulang aktif, lalu
 * memajukan nextOccurrence. Dipanggil saat data pengguna dimuat (bootstrap).
 *
 * IDEMPOTEN: setiap kejadian (aturan + tanggal) punya ID dokumen transaksi
 * yang deterministik. Bila dua pemuatan berjalan bersamaan (dua tab, refresh
 * cepat, PWA + browser), hanya satu yang berhasil membuat dokumen; yang lain
 * mendapat konflik 409 dan TIDAK mengubah saldo. Dokumen dibuat lebih dulu,
 * saldo digeser sesudahnya — sehingga saldo tidak pernah tergeser dua kali.
 *
 * Bukan file "use server".
 */
import { createHash } from "node:crypto";
import type { Models } from "node-appwrite";
import type { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import { recurringRuleFromDocument } from "@/lib/appwrite/recurringMapper";
import {
  applyBalanceChanges,
  documentPayload,
  documentPermissions,
  getBalanceChanges,
  type TransactionInput,
} from "@/lib/appwrite/transactionHelpers";
import { getNextOccurrence } from "@/lib/utils/recurrence";

type AdminDatabases = Awaited<ReturnType<typeof createAdminServerClient>>["databases"];

export const MAX_CATCHUP_PER_RULE = 24;

/** ID dokumen Appwrite (≤36 karakter, alfanumerik) yang sama untuk aturan + tanggal yang sama. */
export function occurrenceDocumentId(ruleId: string, occurrence: Date) {
  return "r" + createHash("sha256").update(`${ruleId}|${occurrence.toISOString()}`).digest("hex").slice(0, 35);
}

function isConflict(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 409;
}

export async function generateDueRecurringTransactions(
  databases: AdminDatabases,
  userId: string,
  dueRuleDocs: Models.Document[],
  now = new Date(),
) {
  let createdTotal = 0;

  for (const doc of dueRuleDocs) {
    const rule = recurringRuleFromDocument(doc);
    let occurrence = rule.nextOccurrence;
    let lastGenerated: Date | undefined;
    let processed = 0;
    let created = 0;
    let active = rule.isActive;

    while (occurrence <= now && processed < MAX_CATCHUP_PER_RULE) {
      if (rule.endDate && occurrence > rule.endDate) {
        active = false;
        break;
      }

      const txInput: TransactionInput = {
        accountId: rule.accountId,
        destinationAccountId: rule.destinationAccountId,
        transferKind: rule.type === "transfer" ? "account" : undefined,
        recordKind: "recurring",
        recurringRuleId: rule.id,
        categoryId: rule.categoryId,
        type: rule.type,
        amount: rule.amount,
        date: occurrence,
        note: rule.note,
        tags: [],
      };
      const documentId = occurrenceDocumentId(rule.id, occurrence);

      try {
        let isNew = true;
        try {
          await databases.createDocument(
            DATABASE_ID, COLLECTIONS.TRANSACTIONS, documentId,
            documentPayload(userId, txInput), documentPermissions(userId),
          );
        } catch (error) {
          if (!isConflict(error)) throw error;
          isNew = false; // Sudah dibuat oleh pemuatan lain — jangan geser saldo lagi.
        }

        if (isNew) {
          try {
            await applyBalanceChanges(databases, userId, getBalanceChanges(txInput));
          } catch (error) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRANSACTIONS, documentId).catch(() => undefined);
            throw error;
          }
          created += 1;
        }
      } catch (error) {
        console.error(
          `Gagal membuat transaksi berulang untuk aturan ${rule.id}:`,
          error instanceof Error ? error.message : error,
        );
        break;
      }

      lastGenerated = occurrence;
      processed += 1;
      occurrence = getNextOccurrence(occurrence, rule.frequency);
      if (rule.endDate && occurrence > rule.endDate) {
        active = false;
        break;
      }
    }

    if (processed > 0 || active !== rule.isActive) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, rule.id, {
        nextOccurrence: occurrence.toISOString(),
        ...(lastGenerated ? { lastGeneratedDate: lastGenerated.toISOString() } : {}),
        isActive: active,
      });
    }

    if (created > 0) {
      createdTotal += created;
      await recordAuditLog(databases, userId, {
        entityType: "recurring_rule", entityId: rule.id, action: "generate", actor: "system",
        summary: `Membuat ${created} transaksi otomatis dari aturan "${rule.note || rule.type}"`,
        after: { generated: created, lastGenerated: lastGenerated?.toISOString() },
      });
    }

    // Kontribusi tujuan otomatis — hanya untuk kejadian yang benar-benar baru
    // dibuat di pemanggilan ini, dan ditambahkan secara atomik.
    if (rule.goalId && created > 0) {
      try {
        await getOwnedDocument(databases, COLLECTIONS.GOALS, rule.goalId, userId);
        const contribution = created * rule.amount;
        await databases.incrementDocumentAttribute({
          databaseId: DATABASE_ID, collectionId: COLLECTIONS.GOALS, documentId: rule.goalId,
          attribute: "currentAmount", value: contribution,
        });
        await recordAuditLog(databases, userId, {
          entityType: "goal", entityId: rule.goalId, action: "generate", actor: "system",
          summary: `Kontribusi otomatis Rp ${contribution.toLocaleString("id-ID")} dari aturan berulang`,
          after: { contribution },
        });
      } catch (error) {
        console.error(
          `Gagal memperbarui progres tujuan ${rule.goalId} dari aturan ${rule.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  return { created: createdTotal };
}
