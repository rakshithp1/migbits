import { test, expect } from "@playwright/test";
test("Icons and motion are first-class homepage and category destinations", async ({
  page,
}) => {
  await page.goto("/");
  const sections = page.locator(".mb-home-category-grid");
  await expect(sections.getByRole("link", { name: /Icons/ })).toBeVisible();
  await sections.getByRole("link", { name: /Icons/ }).click();
  await expect(page).toHaveURL(/\/library\/icons$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Icons");
  await expect(page.locator(".icon-choice-grid>button")).toHaveCount(36);
  await page
    .getByRole("searchbox", { name: "Search curated icons" })
    .fill("heart");
  await expect(page.locator(".icon-choice-grid>button")).toHaveCount(1);
  await page.getByRole("button", { name: "Heart", exact: true }).click();
  await expect(page.locator(".icon-customizer h2")).toHaveText("Heart");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download SVG/ }).click();
  expect((await download).suggestedFilename()).toBe("lucide-heart.svg");
  await page.goto("/library");
  await page
    .getByRole("navigation", { name: "Resource categories" })
    .getByRole("link", { name: /^Motion & backgrounds/ })
    .click();
  await expect(page).toHaveURL(/\/library\/motion$/);
});
test("background previews, pause, source and downloads contain real examples", async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/motion");
  await expect(page.locator(".mb-background-card")).toHaveCount(2);
  const background = page.locator(".mb-background-card").first();
  const frame = page.frameLocator(
    'iframe[title="Aurora flow background preview"]',
  );
  await expect(frame.locator("body")).toBeVisible();
  expect(
    await frame
      .locator("body")
      .evaluate((n) => getComputedStyle(n, "::before").backgroundImage),
  ).toContain("linear-gradient");
  await background.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    background.getByRole("button", { name: "Resume", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await background.getByText("View source", { exact: true }).click();
  await expect(background.locator("pre")).toContainText("MIT License");
  await background
    .getByRole("button", { name: "Copy HTML", exact: true })
    .click();
  await expect(
    background.getByRole("button", { name: "Copied", exact: true }),
  ).toBeVisible();
  await expect(
    background.getByRole("link", { name: "HTML", exact: true }),
  ).toHaveAttribute("download", "aurora.html");
  await expect(page.locator(".mp-demo")).toHaveCount(6);
  await page
    .getByRole("button", { name: "View Text loop source", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("pre")).toContainText(
    "TextLoop",
  );
  await page.getByRole("button", { name: "Close source", exact: true }).click();
  const zip = await request.get("/api/open-source/motion");
  expect(zip.status()).toBe(200);
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/library/icons", "/library/motion"]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/library/motion");
  await page.screenshot({
    path: "tmp/browser/motion-backgrounds-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/library/icons");
  await page.screenshot({
    path: "tmp/browser/icons-main-category.png",
    fullPage: false,
  });
});
