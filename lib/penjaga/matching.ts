/**
 * lib/penjaga/matching.ts
 * Hermes boleh menyebut rekening/kategori dengan ID ATAU nama bebas
 * ("bca", "dompet", "makan"). Fungsi di sini mencocokkannya ke data milik
 * pengguna secara deterministik — LLM tidak pernah menebak ID.
 */

const ALIASES: Record<string, string[]> = {
  tunai: ["cash", "dompet", "uang tunai", "kas"],
  makan: ["makanan", "kuliner", "jajan", "food", "makan minum"],
  transportasi: ["transport", "bensin", "ojek", "ojol", "parkir", "tol"],
  belanja: ["shopping", "belanjaan"],
  gaji: ["salary", "payroll"],
};

export function normalizeName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

function variants(value: string) {
  const base = normalizeName(value);
  const result = new Set([base]);
  for (const [canonical, aliases] of Object.entries(ALIASES)) {
    if (base === canonical || aliases.includes(base)) {
      result.add(canonical);
      aliases.forEach((alias) => result.add(alias));
    }
  }
  return [...result].filter(Boolean);
}

/** Cocokkan teks ke item: ID persis → nama persis → alias → nama saling memuat. */
export function matchByName<T extends { id: string; name: string }>(items: T[], query: string | undefined | null): T | undefined {
  if (!query) return undefined;
  const byId = items.find((item) => item.id === query);
  if (byId) return byId;

  const wanted = variants(query);
  const named = items.map((item) => ({ item, name: normalizeName(item.name) }));
  return (
    named.find(({ name }) => wanted.includes(name))?.item ??
    named.find(({ name }) => wanted.some((value) => value.length >= 3 && (name.includes(value) || value.includes(name))))?.item
  );
}
