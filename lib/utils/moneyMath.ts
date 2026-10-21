/**
 * lib/utils/moneyMath.ts
 * Logika murni kalkulator uang Pundi: evaluasi ekspresi (tanpa eval),
 * format tampilan Rupiah, terbilang, dan rumus cicilan.
 *
 * Ekspresi disimpan dalam bentuk mentah: angka memakai "." sebagai desimal,
 * operator + - * / dan % (postfix). Contoh: "200000-10%" → 180000.
 */

export type Operator = "+" | "-" | "*" | "/";
export const OPERATORS: Operator[] = ["+", "-", "*", "/"];
export const OPERATOR_SYMBOL: Record<Operator, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

type Token = { type: "num"; value: number; percent: boolean } | { type: "op"; value: Operator };

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expression.length) {
    const char = expression[i];
    if (/[0-9.]/.test(char)) {
      let raw = "";
      while (i < expression.length && /[0-9.]/.test(expression[i])) raw += expression[i++];
      if ((raw.match(/\./g) || []).length > 1) return null;
      let percent = false;
      if (expression[i] === "%") { percent = true; i += 1; }
      tokens.push({ type: "num", value: raw === "." ? 0 : Number(raw), percent });
      continue;
    }
    if ((OPERATORS as string[]).includes(char)) {
      // Minus di awal ekspresi atau setelah operator = tanda negatif.
      const prev = tokens[tokens.length - 1];
      if (char === "-" && (!prev || prev.type === "op")) {
        tokens.push({ type: "num", value: 0, percent: false }, { type: "op", value: "-" });
      } else {
        tokens.push({ type: "op", value: char as Operator });
      }
      i += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

/**
 * Evaluasi dengan prioritas ×÷ di atas +−. Persen mengikuti kebiasaan
 * kalkulator ponsel: "a + b%" = a + (a × b/100), selainnya b% = b/100.
 * Mengembalikan null bila ekspresi belum lengkap / tidak valid.
 */
export function evaluateExpression(expression: string): number | null {
  const trimmed = expression.replace(/[+\-*/]+$/, "");
  if (!trimmed) return null;
  const tokens = tokenize(trimmed);
  if (!tokens || !tokens.length) return null;

  let index = 0;
  const parseFactor = (): { value: number; percent: boolean } | null => {
    const token = tokens[index];
    if (!token || token.type !== "num") return null;
    index += 1;
    return { value: token.value, percent: token.percent };
  };
  const parseTerm = (): { value: number; lonePercent: number | null } | null => {
    const first = parseFactor();
    if (!first) return null;
    let value = first.percent ? first.value / 100 : first.value;
    let lone: number | null = first.percent ? first.value : null;
    while (tokens[index]?.type === "op" && (tokens[index].value === "*" || tokens[index].value === "/")) {
      const op = tokens[index].value;
      index += 1;
      const next = parseFactor();
      if (!next) return null;
      const rhs = next.percent ? next.value / 100 : next.value;
      if (op === "/" && rhs === 0) return null;
      value = op === "*" ? value * rhs : value / rhs;
      lone = null;
    }
    return { value, lonePercent: lone };
  };

  const first = parseTerm();
  if (!first) return null;
  let total = first.value;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.type !== "op") return null;
    index += 1;
    const term = parseTerm();
    if (!term) return null;
    const rhs = term.lonePercent !== null ? (total * term.lonePercent) / 100 : term.value;
    total = token.value === "+" ? total + rhs : total - rhs;
  }
  return Number.isFinite(total) ? Math.round(total * 100) / 100 : null;
}

const groupFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

/** Format angka mentah ("12500.5") ke tampilan Indonesia ("12.500,5"), menjaga koma yang baru diketik. */
function formatRawNumber(raw: string) {
  const [intPart, decPart] = raw.split(".");
  const grouped = intPart ? Number(intPart).toLocaleString("id-ID") : "0";
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

export function formatExpression(expression: string): string {
  return expression
    .replace(/[0-9.]+/g, (raw) => formatRawNumber(raw))
    .replace(/[+\-*/]/g, (op) => ` ${OPERATOR_SYMBOL[op as Operator]} `);
}

export function formatNumber(value: number): string {
  return groupFormatter.format(value);
}

const ONES = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

function spellBelowThousand(n: number): string {
  if (n < 12) return ONES[n];
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) return `${ONES[Math.floor(n / 10)]} puluh${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
  if (n < 200) return `seratus${n % 100 ? ` ${spellBelowThousand(n % 100)}` : ""}`;
  return `${ONES[Math.floor(n / 100)]} ratus${n % 100 ? ` ${spellBelowThousand(n % 100)}` : ""}`;
}

/** Terbilang Rupiah: 1.250.000 → "satu juta dua ratus lima puluh ribu rupiah". */
export function terbilang(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return "nol rupiah";
  if (n >= 1e15) return "nominal terlalu besar";
  const scales: Array<[number, string]> = [[1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"], [1e3, "ribu"]];
  let rest = n;
  const parts: string[] = [];
  for (const [size, name] of scales) {
    const chunk = Math.floor(rest / size);
    if (chunk) {
      parts.push(size === 1e3 && chunk === 1 ? "seribu" : `${spellBelowThousand(chunk)} ${name}`);
      rest %= size;
    }
  }
  if (rest) parts.push(spellBelowThousand(rest));
  return `${value < 0 ? "minus " : ""}${parts.join(" ")} rupiah`;
}

/** Cicilan per bulan. Flat: bunga dari pokok awal; anuitas: bunga efektif menurun. */
export function installment(principal: number, annualRatePct: number, months: number, method: "flat" | "anuitas") {
  if (principal <= 0 || months <= 0) return { monthly: 0, totalInterest: 0, total: 0 };
  const monthlyRate = annualRatePct / 100 / 12;
  let monthly: number;
  if (method === "flat" || monthlyRate === 0) {
    monthly = principal / months + principal * monthlyRate;
  } else {
    monthly = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }
  const total = monthly * months;
  return { monthly: Math.round(monthly), totalInterest: Math.round(total - principal), total: Math.round(total) };
}

/** Pembulatan ke atas ke kelipatan tertentu (mis. 500 / 1.000) untuk patungan. */
export function roundUpTo(value: number, step: number) {
  return step > 0 ? Math.ceil(value / step) * step : value;
}
