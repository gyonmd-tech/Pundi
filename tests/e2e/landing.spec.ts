import { expect, test } from "@playwright/test";

test("ponsel membuka / langsung ke halaman login", async ({ page, isMobile }) => {
  test.skip(!isMobile, "khusus ponsel");
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
});

test("ponsel tetap bisa melihat landing lewat ?web=1", async ({ page, isMobile }) => {
  test.skip(!isMobile, "khusus ponsel");
  await page.goto("/?web=1");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Semua arus uangmu");
});

test("desktop melihat landing, tanpa video", async ({ page, isMobile }) => {
  test.skip(isMobile, "khusus desktop");
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Semua arus uangmu");
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("link", { name: "Masuk" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
