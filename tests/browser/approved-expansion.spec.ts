import { test, expect } from "@playwright/test";

test("blue atmosphere moves, pauses and respects live reduced-motion preferences", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).toBeVisible();
  const atmosphere = () => page.locator(".mb-site").first().evaluate(node => getComputedStyle(node, "::before").transform);
  const initial = await atmosphere();
  await expect.poll(atmosphere).not.toBe(initial);
  const secondary = () => page.locator(".mb-site").first().evaluate(node => getComputedStyle(node, "::after").transform);
  const secondaryStart = await secondary();
  await expect.poll(secondary).not.toBe(secondaryStart);
  const ribbon = page.locator(".mb-hero-aurora");
  const ribbonStart = await ribbon.evaluate(node => getComputedStyle(node).transform);
  await expect.poll(() => ribbon.evaluate(node => getComputedStyle(node).transform)).not.toBe(ribbonStart);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mb-motion", "paused");
  expect(await page.locator(".mb-site").first().evaluate(node => getComputedStyle(node, "::before").animationPlayState)).toBe("paused");
  expect(await page.locator(".mb-site").first().evaluate(node => getComputedStyle(node, "::after").animationPlayState)).toBe("paused");
  expect(await ribbon.evaluate(node => getComputedStyle(node).animationPlayState)).toBe("paused");
  await page.getByRole("button", { name: "Resume motion", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mb-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Reduced motion", exact: true })).toBeDisabled();
  expect(await atmosphere()).toBe("none");
  expect(await secondary()).toBe("none");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "tmp/browser/approved-home-mobile.png" });
});

test("reviewed registry installation and grouped artwork retain usable source downloads", async ({ page, request }) => {
  await page.goto("/library/resource/approved-animata-status-button");
  await expect(page.locator(".mb-registry-install")).toContainText("npx shadcn@4.22.1 add https://migbits.com/r/migbits-status-button.json");
  const response = await request.get("/r/migbits-status-button.json");
  expect(response.ok()).toBe(true);
  expect((await response.json()).files.some((file: { path: string }) => file.path.includes("LICENSE"))).toBe(true);
  await page.goto("/library/resource/approved-open-doodles-ballet-svg");
  const variants = page.getByRole("combobox", { name: "Preview variant" });
  await expect(variants.locator("option")).toHaveCount(6);
  await variants.selectOption("1");
  const download = page.getByRole("link", { name: "Download selected variant" });
  await expect(download).toHaveAttribute("href", /chilling/);
  expect((await request.get((await download.getAttribute("href"))!)).ok()).toBe(true);
  await page.goto("/library/backgrounds");
  await expect(page.locator(".mb-card")).toHaveCount(6);
  await page.screenshot({ path: "tmp/browser/approved-backgrounds-desktop.png" });
});
