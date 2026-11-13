/**
 * lib/appwrite/insightGenerator.ts
 * Generator insight berbasis aturan deterministik (bukan AI) — dipanggil
 * dari actions/bootstrap.ts setiap data pengguna dimuat, mengikuti pola
 * generateDueRecurringTransactions di file yang sama (tidak ada cron di
 * repo ini). Setiap insight punya `key` idempoten supaya tidak ditulis
 * ulang tiap kali bootstrap jalan — lihat lib/data/mock.ts Insight.key.
 *
 * Bukan file "use server" — mengikuti pola transactionHelpers.ts/
 * recurringMapper.ts yang sudah ada.
 */
import { Permission, Role, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { createHash } from "node:crypto";
import { getBudgetStatus } from "@/lib/utils/formatter";
import { cycleFor } from "@/lib/utils/budgetCycle";
import { activeBudgetPaces } from "@/lib/utils/budgetPace";
import type { Budget, Category, Goal, Insight, RecurringRule, Transaction } from "@/lib/data/mock";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

export interface InsightGeneratorContext {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurringRules: RecurringRule[];
  /** Tanggal mulai siklus anggaran pengguna (preferensi). */
  cycleDay?: number;
}

const GOAL_MILESTONES = [100, 75, 50, 25];
const UPCOMING_BILL_WINDOW_DAYS = 3;
const TREND_INCREASE_THRESHOLD = 30; // %
const TREND_DECREASE_THRESHOLD = -20; // %

function isSameMonth(date: Date, target: Date) {
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
}

function categorySpend(transactions: Transaction[], categoryId: string, monthDate: Date) {
  return transactions
    .filter((t) =>
      t.type === "expense" &&
      t.recordKind !== "balance_adjustment" &&
      t.categoryId === categoryId &&
      isSameMonth(new Date(t.date), monthDate)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

export function insightDocumentId(userId: string, key: string) {
  return "i" + createHash("sha256").update(`${userId}|${key}`).digest("hex").slice(0, 35);
}

export async function generateInsights(
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  userId: string,
  ctx: InsightGeneratorContext,
  existingInsightDocs: Models.Document[],
): Promise<Insight[]> {
  const existingKeys = new Set(
    existingInsightDocs
      .map((doc) => (doc as unknown as { key?: string }).key)
      .filter((key): key is string => Boolean(key)),
  );

  const now = new Date();
  const period = now.toISOString().slice(0, 7);
  const created: Insight[] = [];

  async function tryCreate(key: string, type: Insight["type"], message: string) {
    if (existingKeys.has(key)) return;
    existingKeys.add(key); // cegah duplikat dalam satu pemanggilan yang sama
    try {
      // ID deterministik per pengguna + key: dua pemuatan bersamaan (dua tab)
      // tidak bisa membuat insight yang sama dua kali — yang kedua kena 409.
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.INSIGHTS,
        insightDocumentId(userId, key),
        { userId, type, message, isRead: false, key },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
      );
      created.push({ id: document.$id, type, message, isRead: false, createdAt: new Date(document.$createdAt), key });
      await recordAuditLog(databases, userId, {
        entityType: "insight", entityId: document.$id, action: "generate", actor: "system",
        summary: message,
      });
    } catch (error) {
      if ((error as { code?: number })?.code === 409) return; // sudah dibuat oleh pemuatan lain
      console.error(`Gagal membuat insight (${key}):`, error instanceof Error ? error.message : error);
    }
  }

  // 1. Anggaran mendekati/lewat limit.
  const cycleKey = cycleFor(now, ctx.cycleDay).key;
  for (const { budget, pace } of activeBudgetPaces(ctx.budgets, ctx.transactions, { now, cycleDay: ctx.cycleDay })) {
    const spent = pace.monthSpent;
    const limit = pace.monthLimit;
    const status = getBudgetStatus(spent, limit);
    if (status === "safe") continue;
    const category = ctx.categories.find((c) => c.id === budget.categoryId);
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const name = category?.name ?? "kategori ini";
    const message = status === "over"
      ? `Pengeluaran ${name} sudah melebihi batas anggaran (${pct}% dari limit). Pertimbangkan menahan pengeluaran non-esensial hingga akhir siklus.`
      : `Pengeluaran ${name} sudah mendekati batas anggaran siklus ini (${pct}% dari limit). Cek lagi rencana belanjamu.`;
    await tryCreate(`budget:${budget.id}:${cycleKey}`, "budget_warning", message);
  }

  // 2. Tren pengeluaran kategori vs rata-rata 3 bulan terakhir.
  const expenseCategories = ctx.categories.filter((c) => c.type === "expense");
  for (const category of expenseCategories) {
    const thisMonth = categorySpend(ctx.transactions, category.id, now);
    const pastMonths = [1, 2, 3].map((monthsAgo) =>
      categorySpend(ctx.transactions, category.id, new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)),
    );
    const avg = pastMonths.reduce((sum, v) => sum + v, 0) / pastMonths.length;
    if (avg <= 0) continue; // tidak ada riwayat, hindari noise di kategori baru
    const changePct = ((thisMonth - avg) / avg) * 100;
    if (changePct >= TREND_INCREASE_THRESHOLD) {
      await tryCreate(
        `trend:${category.id}:${period}:up`,
        "trend",
        `${category.name} bulan ini sudah Rp ${thisMonth.toLocaleString("id-ID")} — naik ${Math.round(changePct)}% dari rata-rata 3 bulan terakhir. Perhatikan kembali pengeluaran di kategori ini.`,
      );
    } else if (changePct <= TREND_DECREASE_THRESHOLD) {
      await tryCreate(
        `trend:${category.id}:${period}:down`,
        "trend",
        `${category.name} bulan ini sudah Rp ${thisMonth.toLocaleString("id-ID")} — ${Math.abs(Math.round(changePct))}% lebih rendah dari rata-rata 3 bulan terakhir. Pertahankan kebiasaan ini!`,
      );
    }
  }

  // 3. Progres tujuan melewati ambang batas.
  for (const goal of ctx.goals) {
    if (goal.targetAmount <= 0) continue;
    const pct = (goal.currentAmount / goal.targetAmount) * 100;
    const milestone = GOAL_MILESTONES.find((m) => pct >= m);
    if (!milestone) continue;
    const message = milestone >= 100
      ? `Selamat! Tujuan "${goal.name}" sudah tercapai 100% (Rp ${goal.currentAmount.toLocaleString("id-ID")}).`
      : `Tujuan "${goal.name}" sudah ${milestone}% tercapai (Rp ${goal.currentAmount.toLocaleString("id-ID")} dari Rp ${goal.targetAmount.toLocaleString("id-ID")}).`;
    await tryCreate(`goal:${goal.id}:${milestone}`, "goal_progress", message);
  }

  // 4. Tagihan berulang akan datang dalam beberapa hari.
  for (const rule of ctx.recurringRules) {
    if (!rule.isActive || rule.type !== "expense") continue;
    const daysUntil = Math.ceil((new Date(rule.nextOccurrence).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0 || daysUntil > UPCOMING_BILL_WINDOW_DAYS) continue;
    const category = ctx.categories.find((c) => c.id === rule.categoryId);
    const label = rule.note || category?.name || "Tagihan berulang";
    const dateKey = new Date(rule.nextOccurrence).toISOString().slice(0, 10);
    const when = daysUntil === 0 ? "hari ini" : daysUntil === 1 ? "besok" : `dalam ${daysUntil} hari`;
    await tryCreate(
      `bill:${rule.id}:${dateKey}`,
      "tip",
      `${label} (Rp ${rule.amount.toLocaleString("id-ID")}) akan jatuh tempo ${when}. Pastikan saldo akunmu cukup.`,
    );
  }

  return created;
}
