"use server";

import { Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getAuthUserAction } from "./auth";
import {
  mockAccounts,
  mockAssets,
  mockBudgets,
  mockCategories,
  mockGoals,
  mockInsights,
  mockTransactions,
  mockDebts,
  type Account,
  type Asset,
  type Budget,
  type Category,
  type Goal,
  type Insight,
  type Transaction,
  type Debt,
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
    const [accounts, categories, transactions, budgets, goals, assets, insights, debts] = await Promise.all([
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
    ]);

    return {
      mode: "cloud",
      userName: user.name,
      userEmail: user.email,
      data: {
        accounts: accounts.documents.map((doc) => {
          const f = fields<AccountFields>(doc);
          return {
            id: doc.$id,
            name: f.name,
            type: f.type,
            balance: Number(f.balance),
            colorTag: f.colorTag || "#5B4AEF",
            isActive: Boolean(f.isActive),
          };
        }),
        categories: categories.documents.map((doc) => {
          const f = fields<CategoryFields>(doc);
          return {
            id: doc.$id,
            name: f.name,
            type: f.type,
            icon: f.icon || "circle",
            color: f.color || "#5B4AEF",
            parentId: f.parentId || undefined,
          };
        }),
        transactions: transactions.documents.map((doc) => {
          const f = fields<TransactionFields>(doc);
          return {
            id: doc.$id,
            accountId: f.accountId,
            destinationAccountId: f.destinationAccountId || undefined,
            transferKind: f.transferKind || undefined,
            recordKind: f.recordKind || "standard",
            observedBalance: f.observedBalance == null ? undefined : Number(f.observedBalance),
            categoryId: f.categoryId || undefined,
            type: f.type,
            amount: Number(f.amount),
            date: new Date(f.date),
            createdAt: new Date(doc.$createdAt),
            note: f.note || undefined,
            tags: f.tags || [],
          };
        }),
        budgets: budgets.documents.map((doc) => {
          const f = fields<BudgetFields>(doc);
          return {
            id: doc.$id,
            categoryId: f.categoryId,
            period: f.period,
            limitAmount: Number(f.limitAmount),
          };
        }),
        goals: goals.documents.map((doc) => {
          const f = fields<GoalFields>(doc);
          return {
            id: doc.$id,
            name: f.name,
            targetAmount: Number(f.targetAmount),
            currentAmount: Number(f.currentAmount || 0),
            targetDate: new Date(f.targetDate),
            linkedAccountId: f.linkedAccountId || undefined,
          };
        }),
        assets: assets.documents.map((doc) => {
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
        }),
        insights: insights.documents.map((doc) => {
          const f = fields<InsightFields>(doc);
          return {
            id: doc.$id,
            type: f.type,
            message: f.message,
            isRead: Boolean(f.isRead),
            createdAt: new Date(doc.$createdAt),
          };
        }),
        debts: debts.documents.map((doc) => {
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
        }),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Data cloud tidak dapat dimuat.";
    return { mode: "cloud", data: { accounts: [], categories: [], transactions: [], budgets: [], goals: [], assets: [], insights: [], debts: [] }, userName: user.name, userEmail: user.email, error: message };
  }
}
