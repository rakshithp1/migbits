import { test, expect } from "@playwright/test";
import { libraryResources } from "../../lib/resource-library";

test("Showcase resources lead a complete scrolling gallery", async ({ page }) => {
  await page.goto("/library");
  await expect(page.locator(".mb-card")).toHaveCount(libraryResources.length);
  await expect(page.locator(".mb-card").first()).toContainText("MigBits /");
  await expect(page.getByRole("navigation", { name: "Gallery pages" })).toHaveCount(0);
  await page.locator(".mb-card").last().scrollIntoViewIfNeeded();
  await expect(page.locator(".mb-card").last()).toBeVisible();
});

test("Hero backgrounds rotate, allow selection and pause with reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".mb-hero-backdrops")).toHaveAttribute("data-background", "Aurora");
  await expect(page.locator(".mb-hero-backdrops")).toHaveAttribute("data-background", "Orbit", { timeout: 10000 });
  await page.getByRole("button", { name: "Prism background", exact: true }).click();
  await expect(page.locator(".mb-hero-backdrops")).toHaveAttribute("data-background", "Prism");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(7000);
  await expect(page.locator(".mb-hero-backdrops")).toHaveAttribute("data-background", "Prism");
});

test("Presence gallery fits the canvas with both arrows usable", async ({ page }) => {
  await page.goto("/library/resource/approved-motion-collection-presence");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  expect(await frame.locator(".example-container").evaluate(node => { const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.bottom <= innerHeight; })).toBe(true);
  const initialImage = await frame.locator(".example-container img").first().getAttribute("src");
  await expect(frame.locator(".next")).toBeVisible();
  await frame.getByRole("button", { name: "Next image", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => frame.locator(".example-container img").first().getAttribute("src")).not.toBe(initialImage);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await frame.locator(".example-container").evaluate(node => node.getBoundingClientRect().right <= innerWidth)).toBe(true);
});
