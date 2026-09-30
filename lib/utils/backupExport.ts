/**
 * lib/utils/backupExport.ts
 * Ekspor seluruh data pengguna (semua koleksi yang sudah dimuat di client
 * store) sebagai satu file JSON — bukan mekanisme baru, memakai pola
 * Blob+anchor yang sama persis dengan lib/utils/csvExport.ts/excelExport.ts.
 *
 * Sengaja hanya ekspor (bukan impor/restore) — impor butuh validasi
 * konflik data yang jauh lebih rumit dan berisiko, di luar cakupan ini.
 */
import type {
  Account, Asset, Budget, Category, Debt, Goal, Insight, RecurringRule, Transaction,
} from "@/lib/data/mock";

export interface BackupPayload {
  schemaVersion: 1;
  exportedAt: string;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  assets: Asset[];
  insights: Insight[];
  debts: Debt[];
  recurringRules: RecurringRule[];
}

export function buildBackupPayload(data: Omit<BackupPayload, "schemaVersion" | "exportedAt">): BackupPayload {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export function downloadBackupJson(payload: BackupPayload) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pundi-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}
