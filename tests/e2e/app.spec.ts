import { expect, test, type Page } from "@playwright/test";

async function enterDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Mode demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
}

test("mode demo: masuk, tambah transaksi, terlihat di buku transaksi", async ({ page }) => {
  await enterDemo(page);
  const note = `E2E kopi ${Date.now()}`;

  await page.getByRole("button", { name: "Tambah transaksi" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Tambah transaksi" });
  await expect(dialog).toBeVisible();
  await dialog.locator('input[inputmode="numeric"]').fill("25000");
  await dialog.getByPlaceholder("Contoh: makan siang bersama tim").fill(note);
  await dialog.getByRole("button", { name: "Simpan transaksi" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("link", { name: "Transaksi" }).first().click();
  await expect(page).toHaveURL(/\/transaksi$/);
  await page.getByPlaceholder(/Cari catatan/).fill(note);
  await expect(page.getByText(note).first()).toBeVisible();
});

test("keluar dari akun kembali ke login", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Lainnya" }).click();
  await page.getByRole("button", { name: "Keluar dari akun" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/); // sesi benar-benar hilang
});

test("semua halaman aplikasi muat tanpa error & tanpa geser horizontal di ponsel", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await enterDemo(page);
  for (const route of ["/dashboard", "/transaksi", "/anggaran", "/arus-kas", "/aset", "/utang", "/tujuan", "/insight", "/catatan-kondisi", "/penjaga", "/kalkulator", "/pengaturan", "/pengaturan/log-aktivitas"]) {
    await page.goto(route);
    await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `${route} meluber horizontal`).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("avatar tidak bisa diambil tanpa sesi pemilik", async ({ request }) => {
  const response = await request.get("/api/avatar/sembarang-id");
  expect(response.status()).toBe(404);
});
