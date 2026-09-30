/**
 * lib/utils/balanceReconciliation.ts
 * Rumus rekonsiliasi saldo bersama — dipakai oleh actions/transactions.ts
 * (server, sumber kebenaran), components/transaction/QuickAddPanel.tsx
 * (fallback lokal saat mode demo, di mana server tidak menghitung delta
 * nyata), dan app/(app)/catatan-kondisi/page.tsx (rekonsiliasi banyak akun
 * sekaligus). Sebelumnya rumus ini terduplikasi di dua tempat.
 */
import type { Transaction } from "@/lib/data/mock";

/**
 * Hitung selisih (delta) antara saldo yang dicatat sistem pada tanggal
 * snapshot dengan saldo nyata yang diamati pengguna. Rumus:
 * saldo diharapkan saat snapshot = saldo saat ini − aktivitas SETELAH snapshot;
 * delta = saldo nyata − saldo diharapkan saat snapshot.
 */
export function computeObservedDelta(
  transactions: Transaction[],
  accountId: string,
  currentBalance: number,
  observedBalance: number,
  snapshotEnd: Date,
): number {
  const activityAfterSnapshot = transactions.reduce((sum, item) => {
    if (new Date(item.date) <= snapshotEnd) return sum;
    let delta = 0;
    if (item.accountId === accountId) {
      if (item.type === "income") delta += item.amount;
      if (item.type === "expense" || item.type === "transfer") delta -= item.amount;
    }
    if (item.type === "transfer" && item.destinationAccountId === accountId) delta += item.amount;
    return sum + delta;
  }, 0);

  const expectedAtSnapshot = currentBalance - activityAfterSnapshot;
  return observedBalance - expectedAtSnapshot;
}
