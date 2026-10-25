import { test, expect } from "@playwright/test";
test("all seven gallery categories expose real downloadable resources", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Good design starts here.",
  );
  await expect(page.locator(".mb-card")).toHaveCount(24);
  for (const category of [
    "components",
    "blocks",
    "templates",
    "typography",
    "colors",
    "illustrations",
    "figma",
  ]) {
    await page.goto("/library/" + category);
    await expect(page.locator(".mb-card").first()).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Resource categories" })
        .locator('[aria-current="page"]'),
    ).toHaveAttribute("href", "/library/" + category);
    const images = await page
      .locator(".mb-card-preview img")
      .evaluateAll((images) => images.map((img) => img.getAttribute("src")));
    for (const src of images) {
      expect(src).toBeTruthy();
      expect((await request.get(src!)).status(), src!).toBe(200);
    }
  }
  await page.goto("/library");
  await page
    .getByRole("navigation", { name: "Component types" })
    .getByRole("link", { name: /^Pricing/ })
    .click();
  await expect(page).toHaveURL(/topic=pricing/);
  await expect(page.locator(".mb-card").first()).toContainText(/pricing/i);
});
test("gallery search, pagination and resale filter work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/library/blocks");
  await page
    .getByRole("searchbox", { name: "Search resources" })
    .fill("split-screen");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".mb-card")).toHaveCount(1);
  await page.goto("/library/typography?rights=resale");
  await expect(
    page.getByRole("heading", { name: "No matching resources" }),
  ).toBeVisible();
  await page.goto("/library/colors");
  const first = await page.locator(".mb-card h3").first().innerText();
  await page.getByRole("link", { name: "Next →", exact: true }).click();
  expect(await page.locator(".mb-card h3").first().innerText()).not.toBe(first);
  await context.close();
});
test("component and block previews stay isolated and original code copies", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/resource/component-button");
  await page.getByRole("button", { name: "Load interactive preview" }).click();
  const frame = page.frameLocator("iframe");
  await expect(frame.locator(".kit-preview-inner")).toBeVisible();
  await expect(frame.locator(".kit-preview-loading")).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveAttribute(
    "sandbox",
    "allow-scripts",
  );
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await expect(page.getByRole("code")).toContainText(/Button/);
  await page.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Copied", exact: true }),
  ).toBeVisible();
  await page.goto("/library/resource/inspo--hero-split-screen");
  await page.getByRole("button", { name: "Load interactive preview" }).click();
  await expect(page.frameLocator("iframe").locator("body")).toHaveAttribute(
    "data-preview-state",
    "rendered",
  );
  await page
    .getByRole("button", { name: "Mobile preview", exact: true })
    .click();
  await expect(page.locator(".mb-frame-mobile")).toBeVisible();
});
test("type, color, illustration and Figma studios expose working resources", async ({
  page,
  request,
}) => {
  await page.goto("/library/resource/font-inter");
  await page
    .getByLabel("Preview text", { exact: true })
    .fill("Make something good.");
  await expect(page.locator(".mb-type-specimen>p")).toHaveText(
    "Make something good.",
  );
  expect(await page.evaluate(() => document.fonts.check('20px "Inter"'))).toBe(
    true,
  );
  await page.goto("/library/resource/ui-ux-pro-max--colors-1");
  await expect(
    page.getByRole("heading", { name: "Check the contrast" }),
  ).toBeVisible();
  await expect(page.locator(".mb-swatches>div")).toHaveCount(16);
  await page.getByLabel("Text color", { exact: true }).fill("#000000");
  await page.getByLabel("Background", { exact: true }).fill("#ffffff");
  await expect(page.locator(".mb-contrast-sample strong")).toContainText(
    "21.00:1",
  );
  await page.goto("/library/resource/illustration-workspace");
  await page.getByLabel("Accent color", { exact: true }).fill("#267155");
  const svg = page.getByRole("link", { name: "Download recolored SVG" });
  await expect(svg).toHaveAttribute("href", /267155/);
  await page.goto("/library/resource/figma-studio");
  await expect(page.locator(".mb-figma-studio")).toContainText(
    "native Figma execution is not yet verified",
  );
  const zip = await request.get("/library/downloads/figma-studio.zip");
  expect(zip.status()).toBe(200);
  expect((await zip.body()).subarray(0, 2).toString()).toBe("PK");
});
test("gallery and detail pages stay inside mobile viewport with keyboard access", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/library/templates",
    "/library/figma",
    "/library/resource/template-atlas",
    "/library/resource/ui-ux-pro-max--colors-1",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/library/resource/template-atlas");
  const tab = page.getByRole("tab", { name: "Preview", exact: true });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Source", exact: true }),
  ).toBeFocused();
  await page.goto("/");
  await page.screenshot({
    path: "tmp/browser/gallery-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.screenshot({
    path: "tmp/browser/gallery-desktop.png",
    fullPage: true,
  });
});
