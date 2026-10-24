import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { shadcnCatalog } from "../../catalog/shadcn";

test("every catalog entry loads its real interactive preview without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  const failedPreviews: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  mkdirSync("tmp/browser", { recursive: true });
  await page.goto("/open-source/components");
  await expect(page.locator("body")).toHaveAttribute("data-component-theme", "dark");
  for (const item of shadcnCatalog) {
    await page.evaluate((id) => {
      window.location.hash = id;
    }, item.id);
    await expect(page.locator(".kit-detail-heading h2")).toHaveText(item.title);
    await expect(page.locator(".kit-preview-inner")).toBeVisible();
    await expect(page.locator(".kit-preview-loading")).toHaveCount(0);
    if (await page.locator(".kit-preview-error").count()) {
      failedPreviews.push(item.id);
      continue;
    }
    await expect(
      page.locator(".kit-preview-inner > *:visible").first(),
    ).toBeVisible();
    await page.waitForTimeout(100);
    if (["calendar", "chart", "combobox", "questionnaire", "sidebar", "code-block", "message-scroller", "trace"].includes(item.id)) {
      await page.locator(".kit-stage").screenshot({path:`tmp/browser/shadcn-${item.id}.png`});
    }
  }
  expect(failedPreviews).toEqual([]);
  expect(errors).toEqual([]);
});

test("search, source files, dialog focus, forms and data-table controls work", async ({
  page,
}) => {
  await page.goto("/open-source/components#dialog");
  await expect(page.locator(".kit-preview-loading")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Dialog", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByLabel("Name", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(page.locator(".kit-code-panel pre")).toContainText(
    "function Dialog",
  );
  await page.getByLabel("Source file").selectOption("example");
  await expect(page.locator(".kit-code-panel pre")).toContainText("DialogDemo");
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await page
    .getByLabel("Search all components")
    .fill("no-component-with-this-name");
  await expect(page.getByText("No matching pieces.")).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.goto("/open-source/components#form");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByText("Add a project name.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Project name", { exact: true }).fill("Orbit");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByText("Saved in this preview. No data was sent."),
  ).toBeVisible();
  await page.goto("/open-source/components#data-table");
  await page.getByLabel("Filter projects").fill("not-a-project");
  await expect(page.getByText("No matching projects.")).toBeVisible();
  await page.getByLabel("Filter projects").fill("");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Previous", exact: true }),
  ).toBeEnabled();
});

test("desktop and mobile layouts keep previews aligned and stay within the viewport", async ({
  page,
}) => {
  mkdirSync("tmp/browser", { recursive: true });
  await page.goto("/open-source/components#button");
  await expect(page.locator(".kit-preview-loading")).toHaveCount(0);
  await page.screenshot({
    path: "tmp/browser/shadcn-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Light preview", exact: true })
    .click();
  await expect(page.locator(".kit-preview-canvas")).toHaveAttribute(
    "data-appearance",
    "light",
  );
  await page
    .locator(".kit-stage")
    .screenshot({ path: "tmp/browser/shadcn-light.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByLabel("Choose a component", { exact: true }),
  ).toBeVisible();
  for (const id of [
    "button",
    "calendar",
    "data-table",
    "sidebar",
    "code-block",
  ]) {
    await page
      .getByLabel("Choose a component", { exact: true })
      .selectOption(id);
    await expect(page.locator(".kit-preview-loading")).toHaveCount(0);
    const widths = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.page, `Mobile overflow for ${id}`).toBeLessThanOrEqual(
      widths.viewport + 1,
    );
  }
  await page
    .getByLabel("Choose a component", { exact: true })
    .selectOption("button");
  await page.screenshot({
    path: "tmp/browser/shadcn-mobile.png",
    fullPage: true,
  });
  for (const width of [360, 414, 768]) {
    await page.setViewportSize({width,height:900});
    const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:window.innerWidth}));
    expect(dimensions.page,`Layout overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport+1);
  }
});
