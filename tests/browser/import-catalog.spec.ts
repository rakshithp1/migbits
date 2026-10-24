import { test, expect } from "@playwright/test";

test("removed resources and their source downloads are no longer served", async ({ request }) => {
  for (const route of [
    "/open-source/imports/bencho--ascii-wake",
    "/imported/bencho/ascii-wake.json",
    "/imported/bencho/ascii-wake.zip",
    "/imported/bencho/support.zip",
    "/imported/threeui/support.zip",
    "/imported/magic-ui/android.zip",
  ]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});

test("shared library navigation fits mobile across the existing galleries", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/library", "/open-source", "/open-source/components", "/open-source/icons", "/open-source/motion"]) {
    await page.goto(route);
    await expect(page.getByRole("navigation", { name: "Library navigation" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
});

test("import catalog searches, opens attributed source, downloads and isolates previews", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/open-source/imports");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("make your mark");
  await page.getByLabel("Search", { exact: true }).fill("split-screen");
  await page.getByRole("combobox", { name: "Collection", exact: true }).selectOption("inspo");
  await page.getByRole("button", { name: "Find resources" }).click();
  await expect(page.locator(".imported-card")).toHaveCount(1);
  await page.getByRole("link", { name: "View source ↗", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Split-screen");
  await expect(page.getByRole("heading", { name: "Source & usage" })).toBeVisible();
  const code = page.getByRole("region", { name: "Source and usage" }).locator("pre");
  await expect(code).toContainText("HeroSplitScreen");
  await page.getByRole("button", { name: "Load preview" }).click();
  const frame = page.frameLocator('iframe[title="Hero / Split-screen preview"]');
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  const download = page.getByRole("link", { name: "Download attributed source" });
  const response = await request.get((await download.getAttribute("href"))!);
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 2).toString()).toBe("PK");
  await page.getByRole("combobox", { name: "File", exact: true }).selectOption("LICENSE");
  await expect(code).toContainText("MIT License");
  expect(errors).toEqual([]);
});

test("catalog works without scripts and supports mobile, reduced motion and empty results", async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const plain = await context.newPage();
  await plain.goto("/open-source/imports?source=shaders&q=aurora");
  await expect(plain.locator(".imported-card")).toHaveCount(1);
  await expect(plain.getByRole("link", { name: "View source ↗", exact: true })).toBeVisible();
  await context.close();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/open-source/imports?q=zz-no-such-resource-zz");
  await expect(page.getByRole("heading", { name: "No matching resources" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel("Search", { exact: true }).focus();
  await expect(page.getByLabel("Search", { exact: true })).toBeFocused();
  await page.screenshot({ path: "tmp/browser/import-catalog-mobile.png", fullPage: true });
});
