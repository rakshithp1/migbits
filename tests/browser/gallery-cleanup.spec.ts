import { test, expect } from "@playwright/test";

test("Checkerboard and blur fixtures are removed from search and detail routes", async ({ page, request }) => {
  await page.goto("/library/shaders?q=blur");
  await expect(page.locator(".mb-card")).toHaveCount(0);
  for (const url of ["/library/resource/shaders--angularblur", "/imported/shaders/previews/shaders--angularblur.html", "/imported/shaders/angularblur.zip"]) expect((await request.get(url)).status()).toBe(404);
});

test("Template colours change inside one isolated entry and reset to the original", async ({ page }) => {
  await page.goto("/library/resource/approved-collection-pizza-delivery");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  const heading = await frame.locator("h1").innerText();
  const luminance = (color: string) => (color.match(/[\d.]+/g) || []).slice(0, 3).reduce((sum, channel, index) => {
    const c = Number(channel) / 255;
    return sum + (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][index];
  }, 0);
  const originalLuminance = luminance(await frame.locator("h1").evaluate(node => getComputedStyle(node).color));
  const original = await frame.locator("style").allTextContents();
  await page.getByRole("combobox", { name: "Template colour" }).selectOption("emerald");
  await expect(frame.locator("html")).toHaveAttribute("data-template-color", "emerald");
  await expect(page.getByRole("button", { name: "Copy colour CSS" })).toBeVisible();
  expect(await frame.locator("style").allTextContents()).not.toEqual(original);
  expect(await frame.locator("h1").innerText()).toEqual(heading);
  for (const color of ["ocean", "emerald", "amber", "violet", "rose"]) {
    await page.getByRole("combobox", { name: "Template colour" }).selectOption(color);
    await expect(frame.locator("html")).toHaveAttribute("data-template-color", color);
    expect(Math.abs(luminance(await frame.locator("h1").evaluate(node => getComputedStyle(node).color)) - originalLuminance)).toBeLessThan(.01);
  }
  await page.getByRole("combobox", { name: "Template colour" }).selectOption("original");
  await expect(frame.locator("html")).toHaveAttribute("data-template-color", "original");
  expect(await frame.locator("style").allTextContents()).toEqual(original);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("Shader starts automatically, pauses globally, and honours reduced motion", async ({ page }) => {
  await page.goto("/library/resource/shaders--aurora");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", /rendered|error/);
  if (await frame.locator("body").getAttribute("data-preview-state") === "error") {
    await expect(frame.locator("#error")).toContainText("Live WebGPU preview unavailable");
    return; // GPU capability varies on CI; the isolated temporal audit runs on a real WebGPU device.
  }
  await expect(frame.locator("body")).toHaveAttribute("data-motion-state", "running");
  await expect(frame.getByRole("button", { name: "Play animation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect(frame.locator("body")).toHaveAttribute("data-motion-state", "paused");
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await expect(frame.locator("body")).toHaveAttribute("data-motion-state", "paused");
  await page.getByRole("button", { name: "Resume motion", exact: true }).click();
  await expect(frame.locator("body")).toHaveAttribute("data-motion-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame.locator("body")).toHaveAttribute("data-motion-state", "paused");
});
