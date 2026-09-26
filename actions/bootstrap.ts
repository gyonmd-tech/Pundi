"use server";

import { Query } from "node-appwrite";
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
        accounts: accounts.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          type: doc.type,
          balance: Number(doc.balance),
          colorTag: doc.colorTag || "#5B4AEF",
          isActive: Boolean(doc.isActive),
        })),
        categories: categories.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          type: doc.type,
          icon: doc.icon || "circle",
          color: doc.color || "#5B4AEF",
          parentId: doc.parentId || undefined,
        })),
        transactions: transactions.documents.map((doc: any) => ({
          id: doc.$id,
          accountId: doc.accountId,
          destinationAccountId: doc.destinationAccountId || undefined,
          transferKind: doc.transferKind || undefined,
          recordKind: doc.recordKind || "standard",
          observedBalance: doc.observedBalance == null ? undefined : Number(doc.observedBalance),
          categoryId: doc.categoryId || undefined,
          type: doc.type,
          amount: Number(doc.amount),
          date: new Date(doc.date),
          createdAt: new Date(doc.$createdAt),
          note: doc.note || undefined,
          tags: doc.tags || [],
        })),
        budgets: budgets.documents.map((doc: any) => ({
          id: doc.$id,
          categoryId: doc.categoryId,
          period: doc.period,
          limitAmount: Number(doc.limitAmount),
        })),
        goals: goals.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          targetAmount: Number(doc.targetAmount),
          currentAmount: Number(doc.currentAmount || 0),
          targetDate: new Date(doc.targetDate),
          linkedAccountId: doc.linkedAccountId || undefined,
        })),
        assets: assets.documents.map((doc: any) => ({
          id: doc.$id,
          type: doc.type,
          name: doc.name,
          units: Number(doc.units),
          buyPrice: Number(doc.buyPrice),
          currentPrice: Number(doc.currentPrice),
          updatedAt: new Date(doc.$updatedAt),
        })),
        insights: insights.documents.map((doc: any) => ({
          id: doc.$id,
          type: doc.type,
          message: doc.message,
          isRead: Boolean(doc.isRead),
          createdAt: new Date(doc.$createdAt),
        })),
        debts: debts.documents.map((doc: any) => ({
          id: doc.$id,
          direction: doc.direction,
          person: doc.person,
          amount: Number(doc.amount),
          remainingAmount: Number(doc.remainingAmount),
          dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
          note: doc.note || undefined,
          status: doc.status,
          createdAt: new Date(doc.$createdAt),
          updatedAt: new Date(doc.$updatedAt),
        })),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Data cloud tidak dapat dimuat.";
    return { mode: "cloud", data: { accounts: [], categories: [], transactions: [], budgets: [], goals: [], assets: [], insights: [], debts: [] }, userName: user.name, userEmail: user.email, error: message };
  }
}
