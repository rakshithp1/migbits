import { test, expect } from "@playwright/test";

const slugs = ["coral-horizon", "orbit-cloud", "folio-studio", "signal-developer", "afterhours-release", "monument-spaces"];
for (const slug of slugs) test(`${slug}: full-screen, automatic motion, responsive and reduced motion`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`/library/previews/templates/${slug}.html`);
  await expect(page.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  expect((await page.locator(".hero").boundingBox())!.height).toBeGreaterThanOrEqual(960);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "running");
  await page.waitForFunction(() => Number(document.querySelector("canvas")?.dataset.elapsed) > .5);
  const before = await page.locator("canvas").screenshot();
  await page.waitForTimeout(900);
  expect(Buffer.compare(before, await page.locator("canvas").screenshot())).not.toBe(0);
  await page.locator(".motion-control").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const time = await page.locator("canvas").getAttribute("data-elapsed");
  await page.waitForTimeout(200);
  expect(await page.locator("canvas").getAttribute("data-elapsed")).toBe(time);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".motion-control")).toBeDisabled();
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
  if (slug === "coral-horizon") {
    await page.locator("input").fill("demo@example.com");
    await page.locator("form button").click();
    await expect(page.getByRole("status")).toContainText("no email was sent");
  }
});
