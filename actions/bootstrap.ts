"use server";

import { Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getAuthUserAction } from "./auth";
import { recurringRuleFromDocument } from "@/lib/appwrite/recurringMapper";
import { generateDueRecurringTransactions } from "@/lib/appwrite/recurringGenerator";
import { listAllDocuments } from "@/lib/appwrite/pagination";
import { seedDefaultsForUser } from "@/lib/appwrite/seedDefaults";
import { generateInsights } from "@/lib/appwrite/insightGenerator";
import { getPreferencesAction } from "./preferences";
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
  cadence?: "daily" | "weekly" | "monthly" | null;
  cadenceAmount?: number | null;
  rollover?: boolean | null;
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

    const dueRules = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RECURRING_RULES, [
      Query.equal("userId", user.id),
      Query.equal("isActive", true),
      Query.lessThanEqual("nextOccurrence", new Date().toISOString()),
      Query.limit(100),
    ]);
    if (dueRules.documents.length > 0) {
      await generateDueRecurringTransactions(databases, user.id, dueRules.documents);
    }

    // Semua koleksi diambil lewat cursor pagination — tidak ada lagi data yang
    // diam-diam terpotong di 500 dokumen.
    const all = (collectionId: string, queries: string[], maxDocuments?: number) =>
      listAllDocuments(databases, collectionId, queries, { maxDocuments }).then((documents) => ({ documents }));
    const byUser = [Query.equal("userId", user.id)];

    const [initialAccounts, initialCategories, transactions, budgets, goals, assets, insights, debts, recurringRules, preferences] = await Promise.all([
      all(COLLECTIONS.ACCOUNTS, byUser),
      all(COLLECTIONS.CATEGORIES, byUser),
      all(COLLECTIONS.TRANSACTIONS, [...byUser, Query.orderDesc("date")]),
      all(COLLECTIONS.BUDGETS, byUser),
      all(COLLECTIONS.GOALS, byUser),
      all(COLLECTIONS.ASSETS, byUser),
      all(COLLECTIONS.INSIGHTS, [...byUser, Query.orderDesc("$createdAt")]),
      all(COLLECTIONS.DEBTS, [...byUser, Query.orderDesc("$createdAt")]),
      all(COLLECTIONS.RECURRING_RULES, [...byUser, Query.orderAsc("nextOccurrence")]),
      getPreferencesAction(),
    ]);

    let accounts = initialAccounts;
    let categories = initialCategories;
    // Pengguna baru yang seed-nya gagal saat signup: ulangi sekali di sini.
    if (accounts.documents.length === 0 && categories.documents.length === 0) {
      try {
        await seedDefaultsForUser(databases, user.id);
        [accounts, categories] = await Promise.all([all(COLLECTIONS.ACCOUNTS, byUser), all(COLLECTIONS.CATEGORIES, byUser)]);
      } catch (error) {
        console.error("Seed ulang data awal gagal:", error instanceof Error ? error.message : error);
      }
    }

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
        cadence: f.cadence ?? "monthly",
        cadenceAmount: f.cadenceAmount ? Number(f.cadenceAmount) : undefined,
        rollover: f.rollover ?? true,
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
