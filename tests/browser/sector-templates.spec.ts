import { test, expect } from "@playwright/test";
import { sectorDesigns } from "../../resources/library/fullscreen-templates/sectors";

for (const design of sectorDesigns) test(`${design.slug}: original full-screen ${design.sector} template`, async ({ page }) => {
  await page.setViewportSize({width:1440,height:960});
  await page.goto(`/library/previews/templates/${design.slug}.html`);
  await expect(page.locator("body")).toHaveAttribute("data-preview-state","rendered");
  expect((await page.locator(".hero").boundingBox())!.height).toBeGreaterThanOrEqual(960);
  await page.waitForFunction(()=>Number(document.querySelector("canvas")?.dataset.elapsed)>.5);
  const before=await page.locator("canvas").screenshot();
  await page.waitForTimeout(900);
  expect(Buffer.compare(before,await page.locator("canvas").screenshot())).not.toBe(0);
  await page.locator(".motion-control").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion","paused");
  const time=await page.locator("canvas").getAttribute("data-elapsed");
  await page.waitForTimeout(150);
  expect(await page.locator("canvas").getAttribute("data-elapsed")).toBe(time);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".motion-control")).toBeDisabled();
  await page.setViewportSize({width:320,height:700});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe("BODY");
  await page.locator(".hero-copy .primary").click();
  await expect(page.locator("#explore")).toBeInViewport();
});
