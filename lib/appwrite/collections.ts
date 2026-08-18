/**
 * lib/appwrite/collections.ts
 * Database and Collection ID constants
 */

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "pundi-db";

export const COLLECTIONS = {
  ACCOUNTS:     "accounts",
  CATEGORIES:   "categories",
  TRANSACTIONS: "transactions",
  BUDGETS:      "budgets",
  GOALS:        "goals",
  ASSETS:       "assets",
  INSIGHTS:     "insights",
} as const;
