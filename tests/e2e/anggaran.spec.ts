import { expect, test, type Page } from "@playwright/test";

async function openBudgets(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Mode demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/anggaran");
  await expect(page.getByText("Memuat data keuangan")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Anggaran", level: 1 })).toBeVisible();
}

test("anggaran baru: mulai siklus depan + sumber dana → masuk daftar Dijadwalkan", async ({ page }) => {
  await openBudgets(page);
  await page.getByRole("button", { name: "Tambah anggaran" }).click();
  const dialog = page.getByRole("dialog", { name: "Anggaran baru" });
  await expect(dialog).toBeVisible();

  const category = dialog.locator("button:not([disabled])").filter({ hasText: /Belum ada riwayat|\/bln/ }).first();
  const categoryName = (await category.locator("span span").first().textContent())?.trim() ?? "";
  await category.click();

  await dialog.getByRole("radio", { name: "per minggu" }).click();
  await dialog.getByLabel("Nominal jatah per minggu").fill("70000");
  await dialog.getByRole("radio", { name: /Siklus depan/ }).click();
  await expect(dialog.getByText(/Mulai \d+ \w+/).first()).toBeVisible();
  await dialog.getByRole("button", { name: "Lanjut" }).click();

  await dialog.getByRole("checkbox", { name: /OVO/ }).click();
  await expect(dialog.getByRole("checkbox", { name: /OVO/ })).toHaveAttribute("aria-checked", "true");
  await expect(dialog.getByRole("switch", { name: /Ulangi tiap siklus/ })).toHaveAttribute("aria-checked", "true");
  await dialog.getByRole("button", { name: "Tetapkan anggaran" }).click();
  await expect(dialog).toBeHidden();

  const scheduled = page.getByRole("region", { name: "Dijadwalkan" });
  await expect(scheduled).toContainText(categoryName);
  await expect(scheduled).toContainText(/Mulai/);
});

test("siklus gajian: pilih tanggal 25, rentang siklus ikut berubah", async ({ page }) => {
  await openBudgets(page);
  await page.getByRole("button", { name: /^Bulanan · / }).click();
  const dialog = page.getByRole("dialog", { name: "Siklus anggaran" });
  await dialog.getByRole("radio", { name: "Tanggal gajian" }).click();
  await dialog.getByRole("radio", { name: "Tanggal 25" }).click();
  await dialog.getByRole("button", { name: "Simpan siklus" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /^Siklus gajian · 25 / })).toBeVisible();
});
