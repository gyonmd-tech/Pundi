import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Audit aksesibilitas otomatis (axe-core, WCAG 2.1 A/AA) di semua halaman,
 * tema terang & gelap. Gagal bila ada pelanggaran berdampak "serious" atau
 * "critical" — termasuk kontras teks < 4,5:1. Warna teks semantik memakai
 * token --color-*-text (styles/tokens.css), bukan warna isian.
 */
const ROUTES = ["/dashboard", "/transaksi", "/anggaran", "/anggaran/bud-1", "/anggaran/bud-3", "/arus-kas", "/aset", "/utang", "/tujuan", "/insight", "/catatan-kondisi", "/penjaga", "/kalkulator", "/pengaturan", "/pengaturan/log-aktivitas"];

async function audit(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return result.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .flatMap((violation) => violation.nodes.slice(0, 3).map((node) => `${label} ${violation.id}: ${node.target.join(" ")} — ${(node.failureSummary ?? "").split("\n")[1]?.trim() ?? ""}`));
}

for (const theme of ["light", "dark"] as const) {
  test(`aksesibilitas semua halaman (tema ${theme === "light" ? "terang" : "gelap"})`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "diaudit di viewport ponsel");
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: theme });
    await page.addInitScript((value) => {
      try { localStorage.setItem("pundi-demo-preferences", JSON.stringify({ theme: value })); } catch { /* abaikan */ }
    }, theme);

    const problems: string[] = [];
    await page.goto("/login");
    problems.push(...await audit(page, "/login"));
    await page.getByRole("button", { name: "Mode demo" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
      await page.waitForTimeout(500); // animasi masuk selesai (warna diukur saat opasitas penuh)
      problems.push(...await audit(page, route));
    }
    expect(problems).toEqual([]);
  });
}
