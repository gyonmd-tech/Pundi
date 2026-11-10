import { expect, test, type Browser } from "@playwright/test";

/**
 * Batas ukuran JS ponsel: JS (tak terkompresi) yang diunduh sampai halaman
 * tampil, per rute, mode demo. Target rilis app-maturity: ≤ 600 KB.
 * Setiap rute dibuka di konteks baru (tanpa cache) agar angkanya sama dengan
 * kunjungan pertama pengguna.
 */
const BUDGET_KB = 600;
const ROUTES = ["/dashboard", "/transaksi", "/anggaran", "/arus-kas", "/aset", "/utang", "/tujuan", "/insight", "/catatan-kondisi", "/penjaga", "/kalkulator", "/pengaturan"];

async function demoState(browser: Browser, baseURL: string, device: object) {
  const context = await browser.newContext({ ...device, baseURL });
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: "Mode demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const state = await context.storageState();
  await context.close();
  return state;
}

test("JS per halaman ponsel tetap ≤ 600 KB", async ({ browser, baseURL, isMobile, playwright }) => {
  test.skip(!isMobile, "anggaran diukur di ponsel");
  test.setTimeout(120_000);
  const device = playwright.devices["Pixel 7"];
  const storageState = await demoState(browser, baseURL!, device);
  const report: Record<string, number> = {};

  for (const route of ROUTES) {
    const context = await browser.newContext({ ...device, baseURL, storageState });
    const page = await context.newPage();
    const sizes = new Map<string, number>();
    page.on("response", async (response) => {
      const url = response.url();
      if (!url.includes("/_next/static/") || !url.endsWith(".js")) return;
      try { sizes.set(url, (await response.body()).length); } catch { /* respons dibatalkan */ }
    });
    await page.goto(route);
    await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    report[route] = Math.round([...sizes.values()].reduce((sum, size) => sum + size, 0) / 1024);
    await context.close();
  }

  console.log("JS per halaman (KB):", JSON.stringify(report));
  const over = Object.entries(report).filter(([, kb]) => kb > BUDGET_KB).map(([route, kb]) => `${route}: ${kb} KB`);
  expect(over, `Halaman melewati batas ${BUDGET_KB} KB — pindahkan kode yang tidak perlu untuk tampilan pertama ke dynamic import / deferUntilVisible`).toEqual([]);
});
