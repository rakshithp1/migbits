import { test, expect } from "@playwright/test";

test("Full-screen template gallery control expands the isolated preview and exits cleanly", async ({ page }) => {
  await page.goto("/library/resource/template-orbit-cloud");
  const preview = page.locator('iframe[title="Orbit Cloud — full-screen interactive preview"]');
  await expect(preview).toBeVisible();
  await expect(page.frameLocator('iframe[title="Orbit Cloud — full-screen interactive preview"]').locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await page.getByRole("button", { name: "Full-screen template preview" }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe("preview-template-orbit-cloud");
  expect((await preview.boundingBox())!.height).toBeGreaterThanOrEqual(1000);
  await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await page.getByLabel("Template colour").selectOption("emerald");
  await expect.poll(() => page.frames().find(f => f.url().includes("/orbit-cloud"))?.evaluate(() => document.documentElement.dataset.templateColor)).toBe("emerald");
});
