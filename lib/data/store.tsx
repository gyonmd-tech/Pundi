"use client";

import React, { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import { getAppBootstrapAction, type AppBootstrapData } from "@/actions/bootstrap";
import {
  type Account,
  type Category,
  type Transaction,
  type Budget,
  type Goal,
  type Asset,
  type Insight,
} from "./mock";

interface AppState extends AppBootstrapData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  assets: Asset[];
  insights: Insight[];
}

const initialState: AppState = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  assets: [],
  insights: [],
};

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "UPSERT_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_ASSET"; payload: Asset }
  | { type: "UPDATE_ASSET"; payload: Asset }
  | { type: "DELETE_ASSET"; payload: string }
  | { type: "MARK_INSIGHT_READ"; payload: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_CATEGORY"; payload: Category };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };
    case "UPDATE_ACCOUNT":
      return { ...state, accounts: state.accounts.map((account) => account.id === action.payload.id ? action.payload : account) };
    case "DELETE_ACCOUNT":
      return { ...state, accounts: state.accounts.filter((account) => account.id !== action.payload) };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      };
    case "UPSERT_BUDGET": {
      const exists = state.budgets.some((budget) => budget.id === action.payload.id);
      return {
        ...state,
        budgets: exists
          ? state.budgets.map((budget) => budget.id === action.payload.id ? action.payload : budget)
          : [...state.budgets, action.payload],
      };
    }
    case "DELETE_BUDGET":
      return { ...state, budgets: state.budgets.filter((budget) => budget.id !== action.payload) };
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.payload.id ? action.payload : goal),
      };
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.payload) };
    case "ADD_ASSET":
      return { ...state, assets: [...state.assets, action.payload] };
    case "UPDATE_ASSET":
      return {
        ...state,
        assets: state.assets.map((asset) => asset.id === action.payload.id ? action.payload : asset),
      };
    case "DELETE_ASSET":
      return { ...state, assets: state.assets.filter((asset) => asset.id !== action.payload) };
    case "MARK_INSIGHT_READ":
      return {
        ...state,
        insights: state.insights.map((insight) =>
          insight.id === action.payload ? { ...insight, isRead: true } : insight
        ),
      };
    case "MARK_ALL_READ":
      return { ...state, insights: state.insights.map((insight) => ({ ...insight, isRead: true })) };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    default:
      return state;
  }
}

interface ConnectionState {
  mode: "guest" | "demo" | "cloud";
  status: "loading" | "ready" | "error";
  userName?: string;
  userEmail?: string;
  error?: string;
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  connection: ConnectionState;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connection, setConnection] = useState<ConnectionState>({
    mode: "guest",
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    getAppBootstrapAction().then((result) => {
      if (!active) return;
      dispatch({ type: "HYDRATE", payload: result.data });
      setConnection({
        mode: result.mode,
        status: result.error ? "error" : "ready",
        userName: result.userName,
        userEmail: result.userEmail,
        error: result.error,
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, connection }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp harus digunakan di dalam <AppProvider>");
  return context;
}

export function useTransactions() {
  const { state } = useApp();
  return [...state.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function useBudgets() {
  return useApp().state.budgets;
}

export function useGoals() {
  return useApp().state.goals;
}

export function useAssets() {
  return useApp().state.assets;
}

export function useInsights() {
  return useApp().state.insights;
}

export function useAccounts() {
  return useApp().state.accounts;
}

export function useCategories() {
  return useApp().state.categories;
}
