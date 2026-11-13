/**
 * Memuat seluruh data awal aplikasi untuk pengguna yang sedang masuk.
 *
 * Dipanggil oleh layout server `app/(app)/layout.tsx` saat halaman diminta,
 * sehingga query Appwrite berjalan paralel dengan unduhan JS di ponsel dan
 * hasilnya di-stream ke klien (bukan menunggu JS selesai lalu memanggil
 * server action). Insight baru dibuat terpisah (`newInsights`) agar tidak
 * menahan tampilan pertama.
 */
import { Query, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getAuthUserAction } from "@/actions/auth";
import { budgetFromDocument, budgetTransferFromDocument } from "@/lib/appwrite/budgetMapper";
import { recurringRuleFromDocument } from "@/lib/appwrite/recurringMapper";
import { generateDueRecurringTransactions } from "@/lib/appwrite/recurringGenerator";
import { listAllDocuments } from "@/lib/appwrite/pagination";
import { seedDefaultsForUser } from "@/lib/appwrite/seedDefaults";
import { sweepBudgetLeftovers } from "@/lib/appwrite/budgetLeftover";
import { generateInsights } from "@/lib/appwrite/insightGenerator";
import { getPreferencesAction } from "@/actions/preferences";
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
  mockBudgetTransfers,
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
  type BudgetTransfer,
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
  budgetTransfers: BudgetTransfer[];
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
  budgetTransfers: mockBudgetTransfers,
  preferences: DEFAULT_PREFERENCES,
};

export interface AppBootstrapResult {
  mode: "guest" | "demo" | "cloud";
  data: AppBootstrapData;
  userName?: string;
  userEmail?: string;
  error?: string;
}

export interface AppBootstrap {
  /** Data untuk tampilan pertama. */
  result: Promise<AppBootstrapResult>;
  /** Insight yang baru dibuat dari data di atas; menyusul setelah `result`. */
  newInsights: Promise<Insight[]>;
}

/** Sengaja tidak async: kedua promise dikembalikan tanpa ditunggu agar bisa di-stream. */
export function loadAppBootstrap(): AppBootstrap {
  let resolveInputs!: (inputs: InsightInputs | null) => void;
  const inputs = new Promise<InsightInputs | null>((resolve) => { resolveInputs = resolve; });
  const result = loadInitialData(resolveInputs).catch((error: unknown) => {
    resolveInputs(null);
    throw error;
  });
  const newInsights = inputs.then(async (input) => {
    if (!input) return [];
    try {
      return await generateInsights(input.databases, input.userId, input.data, input.existing);
    } catch (error) {
      console.error("Gagal membuat insight baru:", error instanceof Error ? error.message : error);
      return [];
    }
  });
  return { result, newInsights };
}

type InsightInputs = {
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"];
  userId: string;
  data: Parameters<typeof generateInsights>[2];
  existing: Parameters<typeof generateInsights>[3];
};

async function loadInitialData(provideInsightInputs: (inputs: InsightInputs | null) => void): Promise<AppBootstrapResult> {
  const user = await getAuthUserAction();

  if (!user || user.isDemo) {
    provideInsightInputs(null);
    return user ? { mode: "demo", data: demoData, userName: user.name, userEmail: user.email } : { mode: "guest", data: demoData };
  }

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

    const [initialAccounts, initialCategories, transactions, budgets, goals, assets, insights, debts, recurringRules, preferences, budgetTransfers] = await Promise.all([
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
      // Koleksi baru: database yang belum menjalankan db:setup belum punya — anggap kosong.
      all(COLLECTIONS.BUDGET_TRANSFERS, [...byUser, Query.orderDesc("date")]).catch(() => ({ documents: [] })),
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
    const mappedBudgets = budgets.documents.map(budgetFromDocument);
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

    // Sisa jatah siklus yang sudah berakhir → tujuan tabungan (idempoten).
    const mappedTransfers = budgetTransfers.documents.map(budgetTransferFromDocument);
    if (mappedBudgets.some((budget) => budget.leftoverGoalId)) {
      try {
        const deposits = await sweepBudgetLeftovers(databases, user.id, {
          budgets: mappedBudgets, goals: mappedGoals, transactions: mappedTransactions, transfers: mappedTransfers, cycleDay: preferences.budgetCycleDay,
        });
        for (const deposit of deposits) {
          const goal = mappedGoals.find((item) => item.id === deposit.goalId);
          if (goal) goal.currentAmount += deposit.amount;
          mappedTransfers.unshift(deposit.record);
        }
      } catch (error) {
        console.error("Gagal menyetor sisa jatah ke tujuan:", error instanceof Error ? error.message : error);
      }
    }

    provideInsightInputs({
      databases,
      userId: user.id,
      data: {
        categories: mappedCategories,
        transactions: mappedTransactions,
        budgets: mappedBudgets,
        goals: mappedGoals,
        recurringRules: mappedRecurringRules,
        cycleDay: preferences.budgetCycleDay,
      },
      existing: insights.documents,
    });

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
        insights: mappedExistingInsights,
        debts: mappedDebts,
        recurringRules: mappedRecurringRules,
        budgetTransfers: mappedTransfers,
        preferences,
      },
    };
  } catch (error: unknown) {
    provideInsightInputs(null);
    const message = error instanceof Error ? error.message : "Data cloud tidak dapat dimuat.";
    return { mode: "cloud", data: { accounts: [], categories: [], transactions: [], budgets: [], goals: [], assets: [], insights: [], debts: [], recurringRules: [], budgetTransfers: [], preferences: DEFAULT_PREFERENCES }, userName: user.name, userEmail: user.email, error: message };
  }
}
