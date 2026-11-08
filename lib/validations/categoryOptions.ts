/**
 * lib/validations/categoryOptions.ts
 * Daftar ikon & warna kategori tanpa zod — aman diimpor komponen klien
 * (CategoryFormModal) tanpa ikut mengunduh library zod (±300 KB) ke browser.
 */
export const CATEGORY_ICONS = [
  "utensils", "car", "shopping-bag", "music", "heart", "zap", "book",
  "piggy-bank", "more-horizontal", "briefcase", "laptop", "trending-up",
  "plus-circle", "tag", "gift", "fuel", "coffee",
] as const;

export const CATEGORY_COLORS = [
  { value: "#2459DE", label: "Biru" },
  { value: "#159B78", label: "Hijau" },
  { value: "#E95766", label: "Merah" },
  { value: "#D99418", label: "Kuning" },
  { value: "#7B61D1", label: "Ungu" },
  { value: "#168AA0", label: "Cyan" },
] as const;
