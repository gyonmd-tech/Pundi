"use client";

/**
 * lib/data/store.tsx
 * React Context + useReducer sebagai "in-memory database" untuk demo.
 * Semua CRUD operations (add/edit/delete transaksi, budget, goal, dsb.)
 * dijalankan di sini tanpa server call — pure client state.
 *
 * Saat Appwrite sudah dikonfigurasi, ganti dispatch calls dengan
 * Server Actions yang memanggil Appwrite SDK.
 */

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockBudgets,
  mockGoals,
  mockAssets,
  mockInsights,
  type Account,
  type Category,
  type Transaction,
  type Budget,
  type Goal,
  type Asset,
  type Insight,
} from "./mock";

// ── State ───────────────────────────────────────────────────────────

interface AppState {
  accounts:     Account[];
  categories:   Category[];
  transactions: Transaction[];
  budgets:      Budget[];
  goals:        Goal[];
  assets:       Asset[];
  insights:     Insight[];
}

const initialState: AppState = {
  accounts:     mockAccounts,
  categories:   mockCategories,
  transactions: mockTransactions,
  budgets:      mockBudgets,
  goals:        mockGoals,
  assets:       mockAssets,
  insights:     mockInsights,
};

// ── Actions ─────────────────────────────────────────────────────────

type Action =
  // Transaction
  | { type: "ADD_TRANSACTION";    payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  // Budget
  | { type: "UPSERT_BUDGET";  payload: Budget }
  | { type: "DELETE_BUDGET";  payload: string }
  // Goal
  | { type: "ADD_GOAL";    payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  // Asset
  | { type: "ADD_ASSET";    payload: Asset }
  | { type: "UPDATE_ASSET"; payload: Asset }
  | { type: "DELETE_ASSET"; payload: string }
  // Insight
  | { type: "MARK_INSIGHT_READ"; payload: string }
  | { type: "MARK_ALL_READ" }
  // Category
  | { type: "ADD_CATEGORY"; payload: Category };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };

    case "UPSERT_BUDGET":
      const exists = state.budgets.find((b) => b.id === action.payload.id);
      return {
        ...state,
        budgets: exists
          ? state.budgets.map((b) => (b.id === action.payload.id ? action.payload : b))
          : [...state.budgets, action.payload],
      };
    case "DELETE_BUDGET":
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };

    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };
    case "UPDATE_GOAL":
      return { ...state, goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)) };
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };

    case "ADD_ASSET":
      return { ...state, assets: [...state.assets, action.payload] };
    case "UPDATE_ASSET":
      return { ...state, assets: state.assets.map((a) => (a.id === action.payload.id ? action.payload : a)) };
    case "DELETE_ASSET":
      return { ...state, assets: state.assets.filter((a) => a.id !== action.payload) };

    case "MARK_INSIGHT_READ":
      return {
        ...state,
        insights: state.insights.map((i) => (i.id === action.payload ? { ...i, isRead: true } : i)),
      };
    case "MARK_ALL_READ":
      return { ...state, insights: state.insights.map((i) => ({ ...i, isRead: true })) };

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────────

interface AppContextValue {
  state:    AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp harus digunakan di dalam <AppProvider>");
  return ctx;
}

// ── Convenience hooks ───────────────────────────────────────────────

export function useTransactions() {
  const { state } = useApp();
  return [...state.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function useBudgets() {
  const { state } = useApp();
  return state.budgets;
}

export function useGoals() {
  const { state } = useApp();
  return state.goals;
}

export function useAssets() {
  const { state } = useApp();
  return state.assets;
}

export function useInsights() {
  const { state } = useApp();
  return state.insights;
}

export function useAccounts() {
  const { state } = useApp();
  return state.accounts;
}

export function useCategories() {
  const { state } = useApp();
  return state.categories;
}
