import { test, expect } from "@playwright/test";

test("call-to-action effects preserve links, keyboard focus and live reduced motion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/playground");
  const cta = page.getByRole("region", { name: "Start exploring components" });
  await cta.scrollIntoViewIfNeeded();
  await expect(cta.locator(".spotlight-card")).toHaveCount(0);
  await expect(cta.getByRole("heading", { name: "Build something people remember." })).toBeVisible();
  const link = cta.getByRole("link", { name: "Find your first bit" });
  await link.focus();
  await expect(link).toBeFocused();
  await cta.screenshot({ path: "tmp/browser/home-cta-desktop.png", animations: "disabled" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cta.locator(".spotlight-card")).toHaveCount(0);
  await expect(cta.getByRole("heading")).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/#components$/);
  await page.getByRole("button", { name: "Open Elastic Text", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile reduced-motion layout keeps the call-to-action inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  const cta = page.getByRole("region", { name: "Start exploring components" });
  await cta.scrollIntoViewIfNeeded();
  await expect(cta.getByRole("link", { name: "Find your first bit" })).toBeVisible();
  const box = await cta.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  await cta.screenshot({ path: "tmp/browser/home-cta-mobile.png" });
});

test("call-to-action remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/playground");
  const cta = page.getByRole("region", { name: "Start exploring components" });
  await expect(cta.getByRole("heading", { name: "Build something people remember." })).toBeVisible();
  await expect(cta.getByRole("link", { name: "Find your first bit" })).toHaveAttribute("href", "#components");
  await context.close();
});
