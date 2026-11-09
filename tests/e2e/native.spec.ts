import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Perilaku aplikasi native (components/providers/NativeBridge.tsx) dengan
 * window.Capacitor tiruan: mencatat panggilan plugin dan menyimpan handler
 * tombol back agar bisa "ditekan" dari test.
 */
async function fakeCapacitor(page: Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    const handlers: Array<(event: { canGoBack: boolean }) => void> = [];
    const record = (name: string) => (options?: unknown) => { calls.push(`${name}${options ? " " + JSON.stringify(options) : ""}`); return Promise.resolve(); };
    (window as unknown as Record<string, unknown>).__native = { calls, handlers };
    (window as unknown as Record<string, unknown>).Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => "android",
      Plugins: {
        SplashScreen: { hide: record("SplashScreen.hide") },
        SystemBars: { setStyle: record("SystemBars.setStyle") },
        App: {
          minimizeApp: record("App.minimizeApp"),
          addListener: (event: string, handler: (event: { canGoBack: boolean }) => void) => {
            if (event === "backButton") handlers.push(handler);
            return Promise.resolve({ remove: () => { handlers.splice(handlers.indexOf(handler), 1); } });
          },
        },
      },
    };
  });
}

const calls = (page: Page) => page.evaluate(() => (window as unknown as { __native: { calls: string[] } }).__native.calls);
const pressBack = (page: Page, canGoBack = true) =>
  page.evaluate((value) => (window as unknown as { __native: { handlers: Array<(e: { canGoBack: boolean }) => void> } }).__native.handlers.at(-1)?.({ canGoBack: value }), canGoBack);

test("native: splash ditutup, status bar ikut tema, tombol back menutup dialog lalu kembali", async ({ page, isMobile }) => {
  test.skip(!isMobile, "khusus ponsel");
  await fakeCapacitor(page);
  await page.goto("/login");
  await expect.poll(() => calls(page)).toContain("SplashScreen.hide {\"fadeOutDuration\":250}");

  await page.getByRole("button", { name: "Mode demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(async () => (await calls(page)).some((call) => call.startsWith("SystemBars.setStyle"))).toBe(true);

  // Back saat panel tambah transaksi terbuka → panel tertutup, tetap di dashboard.
  await page.getByRole("button", { name: "Tambah transaksi" }).first().click();
  await expect(page.getByRole("dialog", { name: "Tambah transaksi" })).toBeVisible();
  await pressBack(page);
  await expect(page.getByRole("dialog", { name: "Tambah transaksi" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/dashboard$/);

  // Back dari halaman lain → kembali ke halaman sebelumnya.
  await page.getByRole("link", { name: "Transaksi" }).first().click();
  await expect(page).toHaveURL(/\/transaksi$/);
  await pressBack(page);
  await expect(page).toHaveURL(/\/dashboard$/);

  // Back di halaman utama → aplikasi diminimalkan, bukan ditutup.
  await pressBack(page, false);
  await expect.poll(() => calls(page)).toContain("App.minimizeApp");
});

test("native: dialog tanpa Escape ditutup lewat tombol Batal", async ({ page, isMobile }) => {
  test.skip(!isMobile, "khusus ponsel");
  await fakeCapacitor(page);
  await page.goto("/login");
  await page.getByRole("button", { name: "Mode demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/anggaran");
  await page.getByRole("button", { name: "Rincian" }).first().click();
  await page.getByRole("button", { name: /Hapus anggaran/ }).first().click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await pressBack(page);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/anggaran$/);
});

test("halaman offline aplikasi: Coba lagi membuka aplikasi, bukan memuat ulang dirinya", async ({ page, isMobile, baseURL }) => {
  test.skip(!isMobile, "khusus ponsel");
  const target = `${baseURL}/login?dari=offline`;
  await page.route("**/app-url.js", (route) => route.fulfill({ contentType: "text/javascript", body: `window.PUNDI_APP_URL = ${JSON.stringify(target)};` }));
  await page.goto(pathToFileURL(path.resolve("mobile/www/index.html")).href);
  await expect(page.getByRole("heading", { name: "Tidak dapat terhubung" })).toBeVisible();
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page).toHaveURL(/\/login\?dari=offline$/);
});
