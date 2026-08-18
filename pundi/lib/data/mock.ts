/**
 * lib/data/mock.ts
 * Centralized mock data layer — sumber data tunggal untuk semua halaman frontend.
 * Data realistis 6–12 bulan, bukan angka acak/placeholder.
 * (AGENTS.md § 4: seed data wajib realistis, nominal tidak bulat genap)
 *
 * CATATAN: File ini hanya untuk fase frontend-only.
 * Saat Appwrite sudah dikonfigurasi, ganti import di tiap halaman
 * dari '@/lib/data/mock' → '@/lib/appwrite/queries'.
 */

// ── Types ─────────────────────────────────────────────────────────────

export type AccountType = "bank" | "ewallet" | "cash" | "credit_card" | "investment";
export type TransactionType = "income" | "expense" | "transfer";
export type CategoryType = "income" | "expense";
export type AssetType = "stock" | "mutual_fund" | "crypto" | "gold" | "property";
export type InsightType = "budget_warning" | "goal_progress" | "trend" | "tip";
export type BudgetStatus = "safe" | "warning" | "over";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  colorTag: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  note?: string;
  tags: string[];
}

export interface Budget {
  id: string;
  categoryId: string;
  period: string; // "YYYY-MM"
  limitAmount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  linkedAccountId?: string;
}

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  units: number;
  buyPrice: number;
  currentPrice: number;
  updatedAt: Date;
}

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// ── Accounts ──────────────────────────────────────────────────────────

export const mockAccounts: Account[] = [
  { id: "acc-1", name: "BCA Tabungan", type: "bank", balance: 14_350_000, colorTag: "#1B4B3F", isActive: true },
  { id: "acc-2", name: "OVO", type: "ewallet", balance: 487_500, colorTag: "#B08A3E", isActive: true },
  { id: "acc-3", name: "Dompet Tunai", type: "cash", balance: 312_000, colorTag: "#5B655F", isActive: true },
  { id: "acc-4", name: "BCA Investasi (Reksadana)", type: "investment", balance: 9_700_000, colorTag: "#9C4A2E", isActive: true },
];

export const totalBalance = mockAccounts.reduce((sum, a) => sum + a.balance, 0);
// = 24_849_500

// ── Categories ────────────────────────────────────────────────────────

export const mockCategories: Category[] = [
  // Income
  { id: "cat-i1", name: "Gaji", type: "income", icon: "briefcase", color: "#1B4B3F" },
  { id: "cat-i2", name: "Freelance", type: "income", icon: "laptop", color: "#1B4B3F" },
  { id: "cat-i3", name: "Investasi", type: "income", icon: "trending-up", color: "#1B4B3F" },
  { id: "cat-i4", name: "Lainnya (Masuk)", type: "income", icon: "plus-circle", color: "#7AADA4" },
  // Expense
  { id: "cat-e1", name: "Makan & Minum", type: "expense", icon: "utensils", color: "#9C4A2E" },
  { id: "cat-e2", name: "Transportasi", type: "expense", icon: "car", color: "#B08A3E" },
  { id: "cat-e3", name: "Belanja", type: "expense", icon: "shopping-bag", color: "#5B655F" },
  { id: "cat-e4", name: "Hiburan", type: "expense", icon: "music", color: "#7AADA4" },
  { id: "cat-e5", name: "Kesehatan", type: "expense", icon: "heart", color: "#9C4A2E" },
  { id: "cat-e6", name: "Tagihan & Utilitas", type: "expense", icon: "zap", color: "#B08A3E" },
  { id: "cat-e7", name: "Pendidikan", type: "expense", icon: "book", color: "#1B4B3F" },
  { id: "cat-e8", name: "Tabungan & Investasi", type: "expense", icon: "piggy-bank", color: "#1B4B3F" },
  { id: "cat-e9", name: "Lainnya (Keluar)", type: "expense", icon: "more-horizontal", color: "#C8CDC7" },
];

// ── Transactions (12 bulan: Sep 2025 – Agu 2026) ──────────────────────

function txDate(monthsAgo: number, day: number): Date {
  const d = new Date(2026, 7 - monthsAgo, day, 9 + (day % 8), (day * 13) % 60, 0);
  return d;
}

export const mockTransactions: Transaction[] = [
  // ── Agustus 2026 (bulan ini) ────────────────────────────────────────
  { id: "tx-001", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(0, 1), note: "Gaji Agustus 2026", tags: [] },
  { id: "tx-002", accountId: "acc-2", categoryId: "cat-i2", type: "income", amount: 700_000, date: txDate(0, 3), note: "Project desain logo Kopi Nusantara", tags: ["freelance"] },
  { id: "tx-003", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 42_500, date: txDate(0, 3), note: "Makan siang ayam penyet", tags: [] },
  { id: "tx-004", accountId: "acc-2", categoryId: "cat-e2", type: "expense", amount: 28_000, date: txDate(0, 4), note: "Grab ke kantor", tags: [] },
  { id: "tx-005", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 387_000, date: txDate(0, 5), note: "Beli baju kerja Tokopedia", tags: ["online"] },
  { id: "tx-006", accountId: "acc-2", categoryId: "cat-e1", type: "expense", amount: 67_000, date: txDate(0, 6), note: "Nongkrong Starbucks weekend", tags: ["weekend"] },
  { id: "tx-007", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 185_000, date: txDate(0, 7), note: "Listrik & internet Agustus", tags: ["tagihan"] },
  { id: "tx-008", accountId: "acc-2", categoryId: "cat-e2", type: "expense", amount: 45_000, date: txDate(0, 8), note: "Bensin motor", tags: [] },
  { id: "tx-009", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 35_000, date: txDate(0, 9), note: "Beli mie ayam + es teh", tags: [] },
  { id: "tx-010", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 856_000, date: txDate(0, 10), note: "Belanja bulanan Indomaret", tags: ["bulanan"] },
  { id: "tx-011", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 95_000, date: txDate(0, 11), note: "Netflix + Spotify", tags: ["langganan"] },
  { id: "tx-012", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 53_000, date: txDate(0, 12), note: "Soto Betawi Cak Min", tags: [] },
  { id: "tx-013", accountId: "acc-2", categoryId: "cat-e2", type: "expense", amount: 32_000, date: txDate(0, 13), note: "Grab motor pulang kantor", tags: [] },
  { id: "tx-014", accountId: "acc-1", categoryId: "cat-e5", type: "expense", amount: 125_000, date: txDate(0, 14), note: "Beli vitamin C + masker", tags: ["kesehatan"] },
  { id: "tx-015", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 450_000, date: txDate(0, 15), note: "Revisi konten Instagram client", tags: ["freelance"] },
  { id: "tx-016", accountId: "acc-3", categoryId: "cat-e1", type: "expense", amount: 22_000, date: txDate(0, 15), note: "Sate ayam 10 tusuk", tags: [] },
  { id: "tx-017", accountId: "acc-2", categoryId: "cat-e1", type: "expense", amount: 78_000, date: txDate(0, 16), note: "Dinner Sabtu sama teman", tags: ["weekend"] },
  { id: "tx-018", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 267_000, date: txDate(0, 17), note: "Tas kerja baru Lazada", tags: ["online"] },
  // Transfer ke tabungan investasi
  { id: "tx-019", accountId: "acc-1", categoryId: undefined, type: "transfer", amount: 1_200_000, date: txDate(0, 17), note: "Top-up reksadana rutin", tags: ["investasi"] },

  // ── Juli 2026 ────────────────────────────────────────────────────────
  { id: "tx-020", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(1, 1), note: "Gaji Juli 2026", tags: [] },
  { id: "tx-021", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 1_400_000, date: txDate(1, 8), note: "Project website UKM Juli", tags: ["freelance"] },
  { id: "tx-022", accountId: "acc-2", categoryId: "cat-e1", type: "expense", amount: 1_823_000, date: txDate(1, 15), note: "Total makan Juli (gabungan)", tags: ["bulanan"] },
  { id: "tx-023", accountId: "acc-1", categoryId: "cat-e2", type: "expense", amount: 412_000, date: txDate(1, 20), note: "Transportasi Juli", tags: [] },
  { id: "tx-024", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 1_245_000, date: txDate(1, 22), note: "Belanja + fashion Juli", tags: [] },
  { id: "tx-025", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 350_000, date: txDate(1, 25), note: "Hiburan Juli (nonton + game)", tags: [] },
  { id: "tx-026", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 185_000, date: txDate(1, 7), note: "Tagihan Juli", tags: ["tagihan"] },
  { id: "tx-027", accountId: "acc-1", categoryId: "cat-e8", type: "expense", amount: 1_200_000, date: txDate(1, 17), note: "Reksadana Juli", tags: ["investasi"] },
  { id: "tx-028", accountId: "acc-1", categoryId: "cat-e5", type: "expense", amount: 203_000, date: txDate(1, 18), note: "Periksa dokter + obat", tags: ["kesehatan"] },

  // ── Juni 2026 ────────────────────────────────────────────────────────
  { id: "tx-030", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(2, 1), note: "Gaji Juni 2026", tags: [] },
  { id: "tx-031", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 3_000_000, date: txDate(2, 15), note: "Project besar Juni — branding startup", tags: ["freelance"] },
  { id: "tx-032", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 2_150_000, date: txDate(2, 20), note: "Makan Juni termasuk dinner ultah", tags: [] },
  { id: "tx-033", accountId: "acc-1", categoryId: "cat-e2", type: "expense", amount: 520_000, date: txDate(2, 25), note: "Transportasi Juni termasuk trip", tags: [] },
  { id: "tx-034", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 780_000, date: txDate(2, 22), note: "Hiburan Juni — konser + nonton", tags: [] },
  { id: "tx-035", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 210_000, date: txDate(2, 7), note: "Tagihan Juni + domain hosting", tags: ["tagihan"] },
  { id: "tx-036", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 1_850_000, date: txDate(2, 18), note: "Belanja Juni incl. baju lebaran", tags: [] },
  { id: "tx-037", accountId: "acc-1", categoryId: "cat-e8", type: "expense", amount: 1_200_000, date: txDate(2, 17), note: "Reksadana Juni", tags: ["investasi"] },
  { id: "tx-038", accountId: "acc-1", categoryId: "cat-e5", type: "expense", amount: 290_000, date: txDate(2, 10), note: "Kacamata baru", tags: ["kesehatan"] },

  // ── Mei 2026 ────────────────────────────────────────────────────────
  { id: "tx-040", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(3, 1), note: "Gaji Mei 2026", tags: [] },
  { id: "tx-041", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 1_200_000, date: txDate(3, 20), note: "Freelance Mei", tags: ["freelance"] },
  { id: "tx-042", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 1_685_000, date: txDate(3, 20), note: "Makan Mei", tags: [] },
  { id: "tx-043", accountId: "acc-1", categoryId: "cat-e2", type: "expense", amount: 380_000, date: txDate(3, 25), note: "Transportasi Mei", tags: [] },
  { id: "tx-044", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 975_000, date: txDate(3, 22), note: "Belanja Mei", tags: [] },
  { id: "tx-045", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 290_000, date: txDate(3, 28), note: "Hiburan Mei", tags: [] },
  { id: "tx-046", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 185_000, date: txDate(3, 7), note: "Tagihan Mei", tags: ["tagihan"] },
  { id: "tx-047", accountId: "acc-1", categoryId: "cat-e8", type: "expense", amount: 1_200_000, date: txDate(3, 17), note: "Reksadana Mei", tags: ["investasi"] },

  // ── April 2026 ───────────────────────────────────────────────────────
  { id: "tx-050", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(4, 1), note: "Gaji April 2026", tags: [] },
  { id: "tx-051", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 1_700_000, date: txDate(4, 18), note: "Freelance April", tags: ["freelance"] },
  { id: "tx-052", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 1_920_000, date: txDate(4, 20), note: "Makan April", tags: [] },
  { id: "tx-053", accountId: "acc-1", categoryId: "cat-e2", type: "expense", amount: 435_000, date: txDate(4, 25), note: "Transportasi April", tags: [] },
  { id: "tx-054", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 420_000, date: txDate(4, 22), note: "Hiburan April", tags: [] },
  { id: "tx-055", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 210_000, date: txDate(4, 7), note: "Tagihan April", tags: ["tagihan"] },
  { id: "tx-056", accountId: "acc-1", categoryId: "cat-e8", type: "expense", amount: 1_200_000, date: txDate(4, 17), note: "Reksadana April", tags: ["investasi"] },
  { id: "tx-057", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 1_415_000, date: txDate(4, 23), note: "Belanja April", tags: [] },

  // ── Maret 2026 ──────────────────────────────────────────────────────
  { id: "tx-060", accountId: "acc-1", categoryId: "cat-i1", type: "income", amount: 7_500_000, date: txDate(5, 1), note: "Gaji Maret 2026", tags: [] },
  { id: "tx-061", accountId: "acc-1", categoryId: "cat-i2", type: "income", amount: 1_000_000, date: txDate(5, 15), note: "Freelance Maret", tags: ["freelance"] },
  { id: "tx-062", accountId: "acc-1", categoryId: "cat-e1", type: "expense", amount: 1_745_000, date: txDate(5, 20), note: "Makan Maret", tags: [] },
  { id: "tx-063", accountId: "acc-1", categoryId: "cat-e2", type: "expense", amount: 398_000, date: txDate(5, 25), note: "Transportasi Maret", tags: [] },
  { id: "tx-064", accountId: "acc-1", categoryId: "cat-e3", type: "expense", amount: 1_120_000, date: txDate(5, 22), note: "Belanja Maret", tags: [] },
  { id: "tx-065", accountId: "acc-2", categoryId: "cat-e4", type: "expense", amount: 315_000, date: txDate(5, 28), note: "Hiburan Maret", tags: [] },
  { id: "tx-066", accountId: "acc-1", categoryId: "cat-e6", type: "expense", amount: 185_000, date: txDate(5, 7), note: "Tagihan Maret", tags: ["tagihan"] },
  { id: "tx-067", accountId: "acc-1", categoryId: "cat-e8", type: "expense", amount: 1_200_000, date: txDate(5, 17), note: "Reksadana Maret", tags: ["investasi"] },
];

// ── Budgets (bulan ini: Agustus 2026) ─────────────────────────────────

export const mockBudgets: Budget[] = [
  { id: "bud-1", categoryId: "cat-e1", period: "2026-08", limitAmount: 2_000_000 },
  { id: "bud-2", categoryId: "cat-e2", period: "2026-08", limitAmount: 1_000_000 },
  { id: "bud-3", categoryId: "cat-e3", period: "2026-08", limitAmount: 1_200_000 },
  { id: "bud-4", categoryId: "cat-e4", period: "2026-08", limitAmount: 600_000 },
  { id: "bud-5", categoryId: "cat-e5", period: "2026-08", limitAmount: 300_000 },
  { id: "bud-6", categoryId: "cat-e6", period: "2026-08", limitAmount: 250_000 },
];

// ── Goals ──────────────────────────────────────────────────────────────

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    name: "Dana Darurat (6 bulan)",
    targetAmount: 30_000_000,
    currentAmount: 18_500_000,
    targetDate: new Date("2026-12-31"),
    linkedAccountId: "acc-1",
  },
  {
    id: "goal-2",
    name: "Liburan Jepang",
    targetAmount: 15_000_000,
    currentAmount: 6_800_000,
    targetDate: new Date("2027-03-01"),
  },
  {
    id: "goal-3",
    name: "MacBook Pro M4",
    targetAmount: 28_000_000,
    currentAmount: 4_200_000,
    targetDate: new Date("2027-06-30"),
  },
];

// ── Assets ─────────────────────────────────────────────────────────────

export const mockAssets: Asset[] = [
  {
    id: "ast-1", type: "mutual_fund", name: "Reksadana Saham Schroder",
    units: 9_250.47, buyPrice: 950, currentPrice: 1_049,
    updatedAt: new Date(2026, 7, 18, 10, 0, 0),
  },
  {
    id: "ast-2", type: "gold", name: "Emas Antam",
    units: 10, buyPrice: 1_050_000, currentPrice: 1_168_000,
    updatedAt: new Date(2026, 7, 18, 10, 0, 0),
  },
  {
    id: "ast-3", type: "stock", name: "BBCA (Bank Central Asia)",
    units: 100, buyPrice: 8_800, currentPrice: 9_475,
    updatedAt: new Date(2026, 7, 18, 10, 0, 0),
  },
  {
    id: "ast-4", type: "crypto", name: "Bitcoin (BTC)",
    units: 0.0023, buyPrice: 920_000_000, currentPrice: 1_025_000_000,
    updatedAt: new Date(2026, 7, 18, 10, 0, 0),
  },
];

// ── Insights ────────────────────────────────────────────────────────────

export const mockInsights: Insight[] = [
  {
    id: "ins-1",
    type: "budget_warning",
    message: "Pengeluaran Belanja sudah Rp 1.510.000 dari batas Rp 1.200.000 bulan ini (126%). Coba tahan pengeluaran non-esensial hingga akhir bulan.",
    isRead: false,
    createdAt: new Date(2026, 7, 18, 10, 30, 0),
  },
  {
    id: "ins-2",
    type: "trend",
    message: "Makan & Minum bulan ini sudah Rp 398.000 — 8% lebih rendah dari rata-rata 3 bulan terakhir (Rp 1.860.000). Pertahankan kebiasaan ini!",
    isRead: false,
    createdAt: new Date(2026, 7, 18, 8, 15, 0),
  },
  {
    id: "ins-3",
    type: "goal_progress",
    message: "Dana Darurat sudah 61,7% tercapai (Rp 18,5 jt dari Rp 30 jt). Dengan kecepatan menabung saat ini, perkiraan selesai Desember 2026.",
    isRead: true,
    createdAt: new Date(2026, 7, 17, 14, 20, 0),
  },
  {
    id: "ins-4",
    type: "tip",
    message: "Tip: Mengalokasikan 20% penghasilan untuk tabungan/investasi dapat mempercepat pencapaian tujuan keuangan. Saat ini kamu sudah 14,6% — terus tingkatkan!",
    isRead: true,
    createdAt: new Date(2026, 7, 16, 9, 0, 0),
  },
  {
    id: "ins-5",
    type: "budget_warning",
    message: "Anggaran Kesehatan hampir penuh: Rp 125.000 dari batas Rp 300.000 (41,7%). Masih aman, tapi perhatikan sisa bulan.",
    isRead: true,
    createdAt: new Date(2026, 7, 15, 11, 45, 0),
  },
];

// ── Computed / Derived Data ────────────────────────────────────────────

/** Hitung total spent per categoryId untuk periode tertentu */
export function getSpentByCategory(categoryId: string, period: string): number {
  const [year, month] = period.split("-").map(Number);
  return mockTransactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return (
        tx.categoryId === categoryId &&
        tx.type === "expense" &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/** Summary bulan berjalan */
export function getMonthlySummary(monthsAgo: number = 0) {
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const y = targetMonth.getFullYear();
  const m = targetMonth.getMonth();

  const txs = mockTransactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });

  const income  = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
}

/** Data cash flow 6 bulan terakhir untuk chart */
export function getCashFlowData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const s = getMonthlySummary(i);
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    result.push({ month: months[d.getMonth()], income: s.income, expense: s.expense });
  }
  return result;
}

/** Breakdown pengeluaran per kategori bulan ini untuk donut chart */
export function getCategoryBreakdown(period: string = "2026-08") {
  return mockCategories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      name:   c.name,
      amount: getSpentByCategory(c.id, period),
      color:  c.color,
    }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** Net worth per bulan (6 bulan) */
export function getNetWorthData() {
  const assetTotal = mockAssets.reduce(
    (sum, a) => sum + a.units * a.currentPrice, 0
  );
  const months = ["Mar", "Apr", "Mei", "Jun", "Jul", "Agu"];
  // Simulasi tren naik 2-4% per bulan dari 3 bulan lalu
  return months.map((month, i) => ({
    month,
    netWorth: Math.round(assetTotal * (0.88 + i * 0.024)),
  }));
}

/** Cari account by id */
export function getAccountById(id: string) {
  return mockAccounts.find((a) => a.id === id);
}

/** Cari category by id */
export function getCategoryById(id: string) {
  return mockCategories.find((c) => c.id === id);
}

/** Budgets bulan ini dengan spent amount */
export function getBudgetsWithSpent(period: string = "2026-08") {
  return mockBudgets
    .filter((b) => b.period === period)
    .map((b) => {
      const cat = getCategoryById(b.categoryId);
      const spent = getSpentByCategory(b.categoryId, period);
      return { ...b, category: cat, spent };
    });
}

/** Transactions diurutkan terbaru, dengan relasi account & category */
export function getTransactionsWithRelations() {
  return [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((tx) => ({
      ...tx,
      account:  getAccountById(tx.accountId),
      category: tx.categoryId ? getCategoryById(tx.categoryId) : undefined,
    }));
}

/** Total nilai aset */
export function getTotalAssetValue() {
  return mockAssets.reduce((sum, a) => sum + a.units * a.currentPrice, 0);
}

/** P&L per aset */
export function getAssetPnL(asset: Asset) {
  const currentVal = asset.units * asset.currentPrice;
  const buyVal     = asset.units * asset.buyPrice;
  const pnl        = currentVal - buyVal;
  const pnlPct     = ((currentVal - buyVal) / buyVal) * 100;
  return { currentVal, buyVal, pnl, pnlPct };
}
