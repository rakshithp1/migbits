import { test, expect } from "@playwright/test";
test("homepage finishes with a dotted brand and sections retain textured backgrounds", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const mark = page.getByRole("img", { name: "MigBits", exact: true });
    await mark.scrollIntoViewIfNeeded();
    await expect(mark).toBeVisible();
    await expect(mark.locator("svg text")).toHaveText("MigBits");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `tmp/browser/home-dotted-${width}.png` });
  }
  await page.goto("/library/shaders");
  expect(
    await page
      .locator(".mb-site")
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain("radial-gradient");
  await expect(page.locator(".mb-card").first()).toBeVisible();
  await page.screenshot({ path: "tmp/browser/shader-library.png" });
});
