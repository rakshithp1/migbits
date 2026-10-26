import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";

test("Motion collection variants have isolated live previews, real pause and attributed source", async ({ page, request }) => {
  await page.goto("/library/motion");
  await expect(page.getByRole("heading", { name: "Motion collections", exact: true })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="motion-collections-title"] .mb-card')).toHaveCount(10);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/library/components?q=motion");
  await expect(page.locator(".mb-card").first()).toBeVisible();
  await page.goto("/library/resource/approved-motion-collection-gestures");
  await expect(page.locator("iframe")).toBeVisible();
  await expect(page.getByRole("button", { name: /Load interactive preview|Load source kit overview/ })).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("html")).toHaveAttribute("data-partner-motion", "running");
  await frame.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect(frame.locator("#root")).toHaveAttribute("inert", "");
  await frame.getByRole("button", { name: "Resume motion", exact: true }).click();
  await page.getByRole("combobox", { name: "Preview variant" }).selectOption({ index: 1 });
  await expect(page.locator("iframe")).toHaveAttribute("src", /approved-motion-events/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame.getByRole("button", { name: "Reduced motion", exact: true })).toBeDisabled();
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "File", exact: true })).toHaveValue("Example.tsx");
  const response = await request.get("/library/approved/downloads/approved-motion-collection-gestures.zip");
  expect(response.ok()).toBe(true);
  const files = unzipSync(new Uint8Array(await response.body()));
  const license = Object.keys(files).find(p => p.endsWith("/LICENSE.md"))!;
  expect(strFromU8(files[license])).toContain("Copyright (c) 2024");
});

test("Motion overview covers stay readable, animate and honor pause/reduced motion", async ({ page }) => {
  await page.goto("/library/motion");
  await expect(page.locator(".mb-motion-cover")).toHaveCount(10);
  await expect(page.locator(".mb-motion-cover-label").first()).toContainText("10 examples");
  expect(await page.locator(".mb-motion-cover .mb-cover-drift").first().evaluate(el => getComputedStyle(el).animationName)).not.toBe("none");
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  expect(await page.locator(".mb-motion-cover .mb-cover-drift").first().evaluate(el => getComputedStyle(el).animationPlayState)).toBe("paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".mb-motion-cover .mb-cover-drift").first().evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await page.setViewportSize({ width: 375, height: 812 });
  const covers = await page.locator(".mb-motion-cover").evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  expect(covers.every(width => width > 250 && width < 375)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("Developer kits disclose installation limits and source kits remain outside the template count", async ({ page }) => {
  await page.goto("/library/tools");
  await expect(page.locator(".mb-card")).toHaveCount(2);
  await page.goto("/library/resource/approved-partner-textura-agency-ai-design-vault");
  await expect(page.getByText(/Documentation preview only\. Original source and license are reviewed/)).toBeVisible();
  await expect(page.locator("iframe")).toBeVisible();
  await expect(page.frameLocator("iframe").getByRole("heading", { level: 1 })).toHaveText(/AI design vault/);
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "File", exact: true })).toHaveValue("README-MIGBITS.md");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
