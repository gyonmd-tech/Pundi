/**
 * lib/penjaga/demoParser.ts
 * "Penjaga latihan" untuk mode demo/guest: pengurai kalimat sederhana
 * berbasis aturan supaya alur cerita → draft → simpan bisa dicoba tanpa
 * Hermes. Akun cloud SELALU memakai Hermes Agent sungguhan.
 */
import type { Account, Category, TransactionType } from "@/lib/data/mock";
import { matchByName, normalizeName } from "./matching";

export interface ParsedDraft {
  type: TransactionType;
  amount: number;
  accountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  note: string;
  rawText: string;
}

const AMOUNT = /(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta|m|miliar)?\b/i;
const INCOME = /\b(gaji|gajian|dapat|dapet|terima|masuk|bonus|dibayar|jual|cair|thr|untung|komisi|freelance)\b/i;
const TRANSFER = /\b(transfer|pindah(?:in|kan)?|tarik tunai|top ?up|isi saldo)\b/i;

const CATEGORY_HINTS: [RegExp, string][] = [
  [/\b(makan|sarapan|siang|malam|kopi|jajan|minum|resto|warung|soto|bakso|nasi|gofood|grabfood)\b/i, "makan"],
  [/\b(bensin|ojek|ojol|grab|gojek|parkir|tol|kereta|krl|bus|taksi|transport)\b/i, "transportasi"],
  [/\b(belanja|beli|indomaret|alfamart|supermarket|shopee|tokopedia)\b/i, "belanja"],
  [/\b(listrik|pln|air|pdam|internet|wifi|pulsa|kuota|token)\b/i, "tagihan"],
  [/\b(nonton|film|game|netflix|spotify|hiburan)\b/i, "hiburan"],
  [/\b(obat|dokter|apotek|rumah sakit|klinik)\b/i, "kesehatan"],
  [/\b(gaji|gajian)\b/i, "gaji"],
  [/\b(bonus|thr)\b/i, "bonus"],
  [/\b(freelance|proyek|project|komisi)\b/i, "freelance"],
];

function parseAmount(text: string) {
  const match = AMOUNT.exec(text);
  if (!match) return null;
  const unit = (match[2] ?? "").toLowerCase();
  let digits = match[1];
  // "1,5jt" / "2.5 juta" → desimal; "25.000" → pemisah ribuan.
  if (unit && /^\d+[.,]\d{1,2}$/.test(digits)) digits = digits.replace(",", ".");
  else digits = digits.replace(/[.,]/g, "");
  const base = Number(digits);
  if (!Number.isFinite(base) || base <= 0) return null;
  const multiplier = unit === "rb" || unit === "ribu" || unit === "k" ? 1_000
    : unit === "jt" || unit === "juta" ? 1_000_000
    : unit === "m" || unit === "miliar" ? 1_000_000_000
    : 1;
  return { amount: Math.round(base * multiplier), match: match[0] };
}

const TYPE_PRIORITY: Account["type"][] = ["bank", "ewallet", "cash", "credit_card", "investment"];

/** Rekening dengan token nama terbanyak yang muncul di teks; seri → bank/e-wallet didahulukan. */
function findAccount(accounts: Account[], text: string, exclude?: string) {
  const words = new Set(normalizeName(text).split(" "));
  const wantsCash = /\b(cash|tunai|dompet)\b/i.test(text);
  const ranked = accounts
    .filter((account) => account.id !== exclude)
    .map((account) => {
      const tokens = normalizeName(account.name).split(" ").filter((token) => token.length >= 3);
      const score = tokens.filter((token) => words.has(token)).length + (wantsCash && account.type === "cash" ? 1 : 0);
      return { account, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || TYPE_PRIORITY.indexOf(a.account.type) - TYPE_PRIORITY.indexOf(b.account.type));
  return ranked[0]?.account;
}

function cleanNote(segment: string, amountText: string) {
  const note = segment
    .replace(amountText, "")
    .replace(/\b(hari ini|tadi pagi|tadi siang|tadi malam|barusan)\b/gi, " ")
    .replace(/\b(aku|saya|tadi|terus|lalu|habis|abis|bayar|pakai|pake|sebesar|seharga|buat|untuk|di|ke|dari)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return note ? note.charAt(0).toUpperCase() + note.slice(1, 80) : "Transaksi";
}

export function parseStory(story: string, accounts: Account[], categories: Category[]): ParsedDraft[] {
  const active = accounts.filter((account) => account.isActive);
  const segments = story
    .split(/[\n;]|,(?!\d)|\.(?!\d)|\b(?:lalu|terus|kemudian|habis itu|abis itu|trus)\b/i)
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));

  const drafts: ParsedDraft[] = [];
  // Rekening terakhir yang disebut dipakai untuk kalimat lanjutan ("…masuk BCA, terus transfer ke tabungan").
  let lastAccount = active.length === 1 ? active[0] : undefined;
  for (const segment of segments) {
    const parsed = parseAmount(segment);
    if (!parsed) continue;
    const type: TransactionType = TRANSFER.test(segment) ? "transfer" : INCOME.test(segment) ? "income" : "expense";
    const hint = CATEGORY_HINTS.find(([pattern]) => pattern.test(segment))?.[1];
    const category = type === "transfer" ? undefined : matchByName(categories.filter((item) => item.type === type), hint);

    let account: Account | undefined;
    let destination: Account | undefined;
    if (type === "transfer") {
      const [before, after = ""] = segment.split(/\bke\b/i);
      account = findAccount(active, before) ?? lastAccount;
      destination = findAccount(active, after, account?.id);
    } else {
      account = findAccount(active, segment) ?? lastAccount;
    }
    if (account) lastAccount = account;

    drafts.push({
      type,
      amount: parsed.amount,
      accountId: account?.id,
      destinationAccountId: destination?.id,
      categoryId: category?.id,
      note: cleanNote(segment, parsed.match),
      rawText: segment,
    });
  }
  return drafts;
}
