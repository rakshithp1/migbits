import { test, expect } from "@playwright/test";
test("homepage has the blue hero, working showcase, navigation and browse actions", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Copy the details.Make them yours.",
  );
  await expect(page.locator(".mb-flow-background svg")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Featured template preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close featured preview" }).click();
  await expect(
    page.getByRole("region", { name: "Featured template preview" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Preview a resource" }).click();
  await expect(
    page.getByRole("region", { name: "Featured template preview" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Featured template preview" }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Explore the library", exact: true })
    .click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The library",
  );
  await page
    .getByRole("button", { name: "Search the library", exact: true })
    .click();
  await expect(
    page.getByRole("searchbox", { name: "Search resources" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await page.locator("h1").click();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("searchbox", { name: "Search resources" }),
  ).toBeFocused();
  await page.getByLabel("Usage and sort filters", { exact: true }).click();
  await page.getByLabel("Usage", { exact: true }).selectOption("resale");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/rights=resale/);
});
test("reference geometry stays responsive and dropdowns expose every category", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/library");
  const grid = await page.locator(".mb-grid").first().boundingBox();
  expect(grid!.x).toBe(168);
  expect(grid!.width).toBe(1104);
  expect(
    await page
      .locator(".mb-grid")
      .first()
      .evaluate(
        (n) => getComputedStyle(n).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(4);
  const search = await page.locator(".mb-search-row").boundingBox(),
    tabs = await page
      .getByRole("navigation", { name: "Resource categories" })
      .boundingBox();
  expect(Math.abs(search!.y - tabs!.y)).toBeLessThan(12);
  await page.screenshot({
    path: "tmp/browser/reference-gallery-desktop.png",
    fullPage: false,
  });
  await page.goto("/");
  await page.screenshot({
    path: "tmp/browser/reference-home-desktop.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of [
    "/",
    "/library",
    "/library/templates",
    "/library/resource/template-atlas",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/library");
  expect(
    await page
      .locator(".mb-grid")
      .first()
      .evaluate(
        (n) => getComputedStyle(n).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(1);
  await page.getByLabel("Open navigation", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "Mobile library navigation", exact: true })
    .getByRole("link", { name: "Figma UI kits", exact: true })
    .click();
  await expect(page).toHaveURL(/\/library\/figma$/);
  await page.goto("/library");
  await page.screenshot({
    path: "tmp/browser/reference-gallery-mobile.png",
    fullPage: false,
  });
  await page.goto("/");
  await page.screenshot({
    path: "tmp/browser/reference-home-mobile.png",
    fullPage: false,
  });
});
