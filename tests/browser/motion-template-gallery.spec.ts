import { test, expect } from "@playwright/test";
import { libraryResources } from "../../lib/resource-library";
import { unzipSync, strFromU8 } from "fflate";

test("template filters expose real motion kits and preserve search choices", async ({ page }) => {
  const templates = libraryResources.filter(item => item.category === "templates");
  await page.goto("/library/templates");
  await expect(page.locator(".mb-card")).toHaveCount(templates.length);
  await expect(page.getByRole("navigation", { name: "Template categories" })).toBeVisible();
  await page.goto("/library/templates?pages=multi&motion=animated");
  await expect(page.locator(".mb-card")).toHaveCount(templates.filter(item => item.template!.pages > 1 && item.template!.motion).length);
  await page.getByRole("searchbox", { name: "Search resources" }).fill("modern");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/pages=multi/);
  await expect(page).toHaveURL(/motion=animated/);
  await expect(page.locator(".mb-card")).toHaveCount(1);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("multi-page template preview is isolated, switchable and downloadable with provenance", async ({ page, request }) => {
  const item = libraryResources.find(item => item.id === "approved-template-modern-business")!;
  await page.goto("/library/resource/" + item.id);
  await expect(page.locator("iframe")).toBeVisible();
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  await page.getByRole("combobox", { name: "Preview page" }).selectOption({ label: "about" });
  await expect(page.locator("iframe")).toHaveAttribute("src", /about\.html$/);
  const frame = page.frameLocator("iframe");
  await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
  await frame.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect(frame.locator("html")).toHaveAttribute("data-template-motion", "paused");
  const response = await request.get(item.downloadUrl!);
  expect(response.ok()).toBe(true);
  const zip = unzipSync(new Uint8Array(await response.body()));
  for (const file of ["index.html", "about.html", "upstream/dist/index.html", "LICENSE", "BOOTSTRAP-LICENSE", "MIGBITS-ADAPTATION-LICENSE", "MIGBITS-MODIFICATIONS.json"]) expect(zip[file], file).toBeTruthy();
  expect(Object.keys(zip).some(file => /\.(png|jpe?g|woff2?|ico)$/i.test(file))).toBe(false);
  expect(strFromU8(zip["index.html"])).toContain("data:image/svg+xml;base64");
  expect(strFromU8(zip["MIGBITS-MODIFICATIONS.json"])).toContain("third-party artwork");
});
