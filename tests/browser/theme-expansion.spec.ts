import { test, expect } from "@playwright/test";

test("themes are browsable, scoped, usable and persist across routes", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/themes");
  await expect(page.locator(".mb-card")).toHaveCount(12);
  await page.goto("/library/resource/theme-ocean");
  await expect(page.locator(".mb-theme-canvas")).toBeVisible();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page
    .getByRole("button", { name: "Apply to site", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-mb-appearance",
    "dark",
  );
  await page
    .getByRole("button", { name: "Copy theme CSS", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "--primary:",
  );
  await page.getByLabel("Project name", { exact: true }).fill("Theme check");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByText("Demo project created. No data was sent."),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Site theme", exact: true })
    .selectOption("rose-studio");
  await page
    .getByRole("button", { name: "Use light appearance", exact: true })
    .click();
  await page.goto("/library/typography");
  await expect(page.locator("html")).toHaveAttribute(
    "data-mb-theme",
    "rose-studio",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-mb-appearance",
    "light",
  );
  await expect(
    page.getByRole("combobox", { name: "Site theme", exact: true }),
  ).toHaveValue("rose-studio");
});

test("color icons search, copy attributed SVG, animate and respect reduced motion", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/icons");
  await expect(page.locator(".mb-color-icon")).toHaveCount(16);
  await page.locator(".mb-color-icon img").evaluateAll((images) =>
    Promise.all(
      images.map((image) => {
        const img = image as HTMLImageElement;
        img.loading = "eager";
        return img.decode();
      }),
    ),
  );
  await page
    .getByRole("searchbox", { name: "Search color icons" })
    .fill("mail");
  await expect(page.locator(".mb-color-icon")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Copy Mail SVG", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Mail SVG copied" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Microsoft Corporation",
  );
  await page.getByRole("button", { name: "Play icon motion" }).click();
  await expect
    .poll(() =>
      page
        .locator(".migbits-color-glyph")
        .evaluate((e) => getComputedStyle(e).animationName),
    )
    .toBe("migbits-glyph-bob");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".migbits-color-glyph")
        .evaluate((e) => getComputedStyle(e).animationName),
    )
    .toBe("none");
});

test("illustrations support multi-role palettes and typography exposes responsive scales", async ({
  page,
}) => {
  await page.goto("/library/resource/illustration-workspace");
  await page.getByRole("button", { name: "Ocean candy", exact: true }).click();
  await expect(page.getByLabel("Ink color", { exact: true })).toHaveValue(
    "#172554",
  );
  const svg = page.getByRole("link", { name: "Download recolored SVG" });
  await expect(svg).toHaveAttribute("href", /172554/);
  await page
    .getByRole("button", { name: "Original palette", exact: true })
    .click();
  await expect(page.getByLabel("Ink color", { exact: true })).toHaveValue(
    "#302b46",
  );
  await page.goto("/library/resource/font-inter");
  await page
    .getByLabel("Typography scale", { exact: true })
    .selectOption("1.333");
  await expect(
    page.getByRole("button", { name: "Copy typography scale", exact: true }),
  ).toBeVisible();
});

test("gradient editor exports working motion CSS with a static reduced-motion alternative", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/resource/ui-ux-pro-max--colors-1");
  await page
    .getByRole("button", { name: "Animate gradient", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator(".mb-gradient-preview>div")
        .evaluate((e) => getComputedStyle(e).animationName),
    )
    .toBe("mb-gradient-drift");
  await page
    .getByRole("button", { name: "Copy gradient CSS", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "prefers-reduced-motion:reduce",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".mb-gradient-preview>div")
        .evaluate((e) => getComputedStyle(e).animationName),
    )
    .toBe("none");
});

test("light appearance keeps descriptive text and tool controls on semantic colors", async ({
  page,
}) => {
  await page.goto("/library/icons");
  await page
    .getByRole("button", { name: "Use light appearance", exact: true })
    .click();
  await expect(page.locator(".mb-intro > p:not(.mb-eyebrow)")).toHaveCSS(
    "color",
    "rgb(71, 85, 105)",
  );
  await expect(
    page.getByRole("searchbox", { name: "Search color icons" }),
  ).toHaveCSS("color", "rgb(15, 23, 42)");
  await expect(
    page.getByRole("searchbox", { name: "Search color icons" }),
  ).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("new themes and icon tools fit mobile with keyboard reachable controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    "/library/themes",
    "/library/resource/theme-forest-archive",
    "/library/icons",
  ]) {
    await page.goto(url);
    await expect(
      page.getByRole("combobox", { name: "Site theme", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("searchbox", { name: "Search color icons" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("combobox", { name: "Motion preset" }),
  ).toBeFocused();
});
