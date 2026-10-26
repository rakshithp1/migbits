import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";

test("Collection template can be found, previewed in isolation and downloaded with creator notices", async ({ page, request }) => {
  await page.goto("/library/templates?q=corporate");
  await expect(page.getByRole("link", { name: /Corporate Company/ }).first()).toBeVisible();
  await page.goto("/library/resource/approved-collection-corporate-company");
  await expect(page.locator("iframe")).toBeVisible();
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  const frame = page.frameLocator("iframe");
  await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  const menu = frame.getByRole("button", { name: "Open menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(frame.getByRole("link", { name: "About us", exact: true }).first()).toBeVisible();
  const response = await request.get("/library/approved/downloads/approved-collection-corporate-company.zip");
  expect(response.ok()).toBe(true);
  const files = unzipSync(new Uint8Array(await response.body()));
  expect(strFromU8(files.LICENSE)).toContain("Copyright (c) 2026 mmrahmanbappi");
  expect(files["upstream/index.html"]).toBeTruthy();
  expect(strFromU8(files["index.html"])).toContain("connect-src 'none'");
});

test("Search metadata indexes resource pages and keeps preview copies out of crawling", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("https://migbits.com/library/resource/approved-collection-corporate-company");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /library/approved/sites/");
});
