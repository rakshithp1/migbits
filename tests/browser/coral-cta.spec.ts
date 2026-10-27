import { test, expect } from "@playwright/test";

test("Coral signup is a template with continuous smoke beyond the former five-second seam", async ({ page, request }) => {
  const response = await request.get("/library/resource/block-coral-signup", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/library/resource/template-coral-signup");
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/library/previews/templates/coral-signup.html");
  await expect(page.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await expect(page.locator("video")).toHaveCount(0);
  const canvas = page.locator("canvas.smoke");
  await expect.poll(async () => Number(await canvas.getAttribute("data-elapsed"))).toBeGreaterThan(5.2);
  const before = Number(await canvas.getAttribute("data-elapsed"));
  const pixels = await canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await expect.poll(async () => Number(await canvas.getAttribute("data-elapsed"))).toBeGreaterThan(before + .3);
  expect(await canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL())).not.toBe(pixels);
  const box = await page.locator(".cta").boundingBox();
  expect(box!.width).toBeCloseTo(1380, 0); expect(box!.height).toBeCloseTo(340, 0);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  const paused = await canvas.getAttribute("data-elapsed");
  await page.waitForTimeout(200);
  expect(await canvas.getAttribute("data-elapsed")).toBe(paused);
});

test("Coral template supports theme changes, sandbox form, mobile and reduced motion", async ({ page }) => {
  await page.goto("/library/resource/template-coral-signup");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await page.getByRole("combobox", { name: "Template colour" }).selectOption("emerald");
  await expect(frame.locator("html")).toHaveAttribute("data-template-color", "emerald");
  await frame.getByRole("textbox", { name: "Email address" }).fill("demo@example.com");
  await frame.getByRole("button", { name: "Get Free Access", exact: true }).click();
  await expect(frame.getByRole("status")).toContainText("no email was submitted");
  await page.setViewportSize({ width: 390, height: 655 });
  expect(await frame.locator("html").evaluate(node => node.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame.locator("html")).toHaveAttribute("data-cta-motion", "paused");
  const canvas = frame.locator("canvas.smoke");
  const elapsed = await canvas.getAttribute("data-elapsed");
  await page.waitForTimeout(200);
  expect(await canvas.getAttribute("data-elapsed")).toBe(elapsed);
  await expect(canvas).toBeVisible();
});
