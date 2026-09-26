/** Appwrite database and collection identifiers. */
import { APPWRITE_DATABASE_ID } from "@/lib/appwrite/config";

export const DATABASE_ID = APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  ACCOUNTS: "accounts",
  CATEGORIES: "categories",
  TRANSACTIONS: "transactions",
  BUDGETS: "budgets",
  GOALS: "goals",
  ASSETS: "assets",
  INSIGHTS: "insights",
  DEBTS: "debts",
} as const;
