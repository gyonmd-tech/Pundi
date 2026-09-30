"use server";

import { ID, Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { getAuthUserAction } from "./auth";
import {
  applyBalanceChanges,
  documentPayload,
  documentPermissions,
  getBalanceChanges,
  type TransactionInput,
} from "@/lib/appwrite/transactionHelpers";
import { recurringRuleFromDocument } from "@/lib/appwrite/recurringMapper";
import { getNextOccurrence } from "@/lib/utils/recurrence";
import { generateInsights } from "@/lib/appwrite/insightGenerator";
import { getPreferencesAction } from "./preferences";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import {
  mockAccounts,
  mockAssets,
  mockBudgets,
  mockCategories,
  mockGoals,
  mockInsights,
  mockTransactions,
  mockDebts,
  mockRecurringRules,
  DEFAULT_PREFERENCES,
  type Account,
  type Asset,
  type Budget,
  type Category,
  type Goal,
  type Insight,
  type Transaction,
  type Debt,
  type RecurringRule,
  type UserPreferences,
} from "@/lib/data/mock";

export interface AppBootstrapData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  assets: Asset[];
  insights: Insight[];
  debts: Debt[];
  recurringRules: RecurringRule[];
  preferences: UserPreferences;
}

const MAX_CATCHUP_PER_RULE = 24;

/**
 * Buat transaksi yang jatuh tempo untuk aturan berulang aktif, lalu majukan
 * nextOccurrence. Dipanggil dari getAppBootstrapAction setiap data pengguna
 * dimuat — tidak ada cron/Appwrite Function, jadi transaksi baru terbentuk
 * "saat aplikasi dibuka berikutnya", bukan persis tengah malam. Dibatasi
 * MAX_CATCHUP_PER_RULE per aturan agar pengguna yang lama tidak membuka app
 * tidak memicu ratusan transaksi sekaligus.
 */
async function generateDueRecurringTransactions(
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  userId: string,
  dueRuleDocs: Models.Document[],
) {
  const now = new Date();

  for (const doc of dueRuleDocs) {
    const rule = recurringRuleFromDocument(doc);
    let occurrence = rule.nextOccurrence;
    let lastGenerated: Date | undefined;
    let generated = 0;
    let active = rule.isActive;

    while (occurrence <= now && generated < MAX_CATCHUP_PER_RULE) {
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

      try {
        const rollback = await applyBalanceChanges(databases, userId, getBalanceChanges(txInput));
        try {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TRANSACTIONS,
            ID.unique(),
            documentPayload(userId, txInput),
            documentPermissions(userId),
          );
        } catch (error) {
          await rollback();
          throw error;
        }
      } catch (error) {
        console.error(
          `Gagal membuat transaksi berulang untuk aturan ${rule.id}:`,
          error instanceof Error ? error.message : error,
        );
        break;
      }

      lastGenerated = occurrence;
      generated += 1;
      occurrence = getNextOccurrence(occurrence, rule.frequency);
      if (rule.endDate && occurrence > rule.endDate) {
        active = false;
        break;
      }
    }

    if (generated > 0 || active !== rule.isActive) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, rule.id, {
        nextOccurrence: occurrence.toISOString(),
        ...(lastGenerated ? { lastGeneratedDate: lastGenerated.toISOString() } : {}),
        isActive: active,
      });
    }

    if (generated > 0) {
      await recordAuditLog(databases, userId, {
        entityType: "recurring_rule", entityId: rule.id, action: "generate", actor: "system",
        summary: `Membuat ${generated} transaksi otomatis dari aturan "${rule.note || rule.type}"`,
        after: { generated, lastGenerated: lastGenerated?.toISOString() },
      });
    }

    // Kontribusi tujuan otomatis: naikkan currentAmount goal sekali per
    // rule per pemanggilan (bukan per-occurrence) sebesar total yang
    // berhasil digenerate barusan.
    if (rule.goalId && generated > 0) {
      try {
        const goalDoc = await getOwnedDocument(databases, COLLECTIONS.GOALS, rule.goalId, userId);
        const currentAmount = Number(goalDoc.currentAmount ?? 0);
        const contribution = generated * rule.amount;
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.GOALS, rule.goalId, {
          currentAmount: currentAmount + contribution,
        });
        await recordAuditLog(databases, userId, {
          entityType: "goal", entityId: rule.goalId, action: "generate", actor: "system",
          summary: `Kontribusi otomatis Rp ${contribution.toLocaleString("id-ID")} dari aturan berulang`,
          before: { currentAmount }, after: { currentAmount: currentAmount + contribution },
        });
      } catch (error) {
        console.error(
          `Gagal memperbarui progres tujuan ${rule.goalId} dari aturan ${rule.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }
}

function fields<T>(doc: Models.Document): T {
  return doc as unknown as T;
}

interface AccountFields {
  name: string;
  type: Account["type"];
  balance: number;
  colorTag?: string;
  isActive: boolean;
}
interface CategoryFields {
  name: string;
  type: Category["type"];
  icon?: string;
  color?: string;
  parentId?: string;
}
interface TransactionFields {
  accountId: string;
  destinationAccountId?: string;
  transferKind?: Transaction["transferKind"];
  recordKind?: Transaction["recordKind"];
  recurringRuleId?: string;
  debtId?: string;
  observedBalance?: number;
  categoryId?: string;
  type: Transaction["type"];
  amount: number;
  date: string;
  note?: string;
  tags?: string[];
}
interface BudgetFields {
  categoryId: string;
  period: string;
  limitAmount: number;
}
interface GoalFields {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  linkedAccountId?: string;
}
interface AssetFields {
  type: Asset["type"];
  name: string;
  units: number;
  buyPrice: number;
  currentPrice: number;
}
interface InsightFields {
  type: Insight["type"];
  message: string;
  isRead: boolean;
}
interface DebtFields {
  direction: Debt["direction"];
  person: string;
  amount: number;
  remainingAmount: number;
  dueDate?: string;
  note?: string;
  status: Debt["status"];
}

const demoData: AppBootstrapData = {
  accounts: mockAccounts,
  categories: mockCategories,
  transactions: mockTransactions,
  budgets: mockBudgets,
  goals: mockGoals,
  assets: mockAssets,
  insights: mockInsights,
  debts: mockDebts,
  recurringRules: mockRecurringRules,
  preferences: DEFAULT_PREFERENCES,
};

export async function getAppBootstrapAction(): Promise<{
  mode: "guest" | "demo" | "cloud";
  data: AppBootstrapData;
  userName?: string;
  userEmail?: string;
  error?: string;
}> {
  const user = await getAuthUserAction();

  if (!user) return { mode: "guest", data: demoData };
  if (user.isDemo) return { mode: "demo", data: demoData, userName: user.name, userEmail: user.email };

  try {
    const { databases } = await createAdminServerClient();
    const userQuery = [Query.equal("userId", user.id), Query.limit(500)];

    const dueRules = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RECURRING_RULES, [
      Query.equal("userId", user.id),
      Query.equal("isActive", true),
      Query.lessThanEqual("nextOccurrence", new Date().toISOString()),
      Query.limit(100),
    ]);
    if (dueRules.documents.length > 0) {
      await generateDueRecurringTransactions(databases, user.id, dueRules.documents);
    }

    const [accounts, categories, transactions, budgets, goals, assets, insights, debts, recurringRules, preferences] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.ACCOUNTS, userQuery),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, userQuery),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
        Query.equal("userId", user.id),
        Query.orderDesc("date"),
        Query.limit(500),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.BUDGETS, userQuery),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GOALS, userQuery),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.ASSETS, userQuery),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.INSIGHTS, [
        Query.equal("userId", user.id),
        Query.orderDesc("$createdAt"),
        Query.limit(500),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.DEBTS, [
        Query.equal("userId", user.id), Query.orderDesc("$createdAt"), Query.limit(500),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.RECURRING_RULES, [
        Query.equal("userId", user.id), Query.orderAsc("nextOccurrence"), Query.limit(200),
      ]),
      getPreferencesAction(),
    ]);

    const mappedAccounts = accounts.documents.map((doc) => {
      const f = fields<AccountFields>(doc);
      return {
        id: doc.$id,
        name: f.name,
        type: f.type,
        balance: Number(f.balance),
        colorTag: f.colorTag || "#5B4AEF",
        isActive: Boolean(f.isActive),
      };
    });
    const mappedCategories = categories.documents.map((doc) => {
      const f = fields<CategoryFields>(doc);
      return {
        id: doc.$id,
        name: f.name,
        type: f.type,
        icon: f.icon || "circle",
        color: f.color || "#5B4AEF",
        parentId: f.parentId || undefined,
      };
    });
    const mappedTransactions = transactions.documents.map((doc) => {
      const f = fields<TransactionFields>(doc);
      return {
        id: doc.$id,
        accountId: f.accountId,
        destinationAccountId: f.destinationAccountId || undefined,
        transferKind: f.transferKind || undefined,
        recordKind: f.recordKind || "standard",
        recurringRuleId: f.recurringRuleId || undefined,
        debtId: f.debtId || undefined,
        observedBalance: f.observedBalance == null ? undefined : Number(f.observedBalance),
        categoryId: f.categoryId || undefined,
        type: f.type,
        amount: Number(f.amount),
        date: new Date(f.date),
        createdAt: new Date(doc.$createdAt),
        note: f.note || undefined,
        tags: f.tags || [],
      };
    });
    const mappedBudgets = budgets.documents.map((doc) => {
      const f = fields<BudgetFields>(doc);
      return {
        id: doc.$id,
        categoryId: f.categoryId,
        period: f.period,
        limitAmount: Number(f.limitAmount),
      };
    });
    const mappedGoals = goals.documents.map((doc) => {
      const f = fields<GoalFields>(doc);
      return {
        id: doc.$id,
        name: f.name,
        targetAmount: Number(f.targetAmount),
        currentAmount: Number(f.currentAmount || 0),
        targetDate: new Date(f.targetDate),
        linkedAccountId: f.linkedAccountId || undefined,
      };
    });
    const mappedAssets = assets.documents.map((doc) => {
      const f = fields<AssetFields>(doc);
      return {
        id: doc.$id,
        type: f.type,
        name: f.name,
        units: Number(f.units),
        buyPrice: Number(f.buyPrice),
        currentPrice: Number(f.currentPrice),
        updatedAt: new Date(doc.$updatedAt),
      };
    });
    const mappedExistingInsights = insights.documents.map((doc) => {
      const f = fields<InsightFields>(doc);
      return {
        id: doc.$id,
        type: f.type,
        message: f.message,
        isRead: Boolean(f.isRead),
        createdAt: new Date(doc.$createdAt),
      };
    });
    const mappedDebts = debts.documents.map((doc) => {
      const f = fields<DebtFields>(doc);
      return {
        id: doc.$id,
        direction: f.direction,
        person: f.person,
        amount: Number(f.amount),
        remainingAmount: Number(f.remainingAmount),
        dueDate: f.dueDate ? new Date(f.dueDate) : undefined,
        note: f.note || undefined,
        status: f.status,
        createdAt: new Date(doc.$createdAt),
        updatedAt: new Date(doc.$updatedAt),
      };
    });
    const mappedRecurringRules = recurringRules.documents.map(recurringRuleFromDocument);

    const newInsights = await generateInsights(
      databases,
      user.id,
      {
        categories: mappedCategories,
        transactions: mappedTransactions,
        budgets: mappedBudgets,
        goals: mappedGoals,
        recurringRules: mappedRecurringRules,
      },
      insights.documents,
    );
    const mergedInsights = [...newInsights, ...mappedExistingInsights].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      mode: "cloud",
      userName: user.name,
      userEmail: user.email,
      data: {
        accounts: mappedAccounts,
        categories: mappedCategories,
        transactions: mappedTransactions,
        budgets: mappedBudgets,
        goals: mappedGoals,
        assets: mappedAssets,
        insights: mergedInsights,
        debts: mappedDebts,
        recurringRules: mappedRecurringRules,
        preferences,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Data cloud tidak dapat dimuat.";
    return { mode: "cloud", data: { accounts: [], categories: [], transactions: [], budgets: [], goals: [], assets: [], insights: [], debts: [], recurringRules: [], preferences: DEFAULT_PREFERENCES }, userName: user.name, userEmail: user.email, error: message };
  }
}
