import { test, expect } from "@playwright/test";
import { libraryResources } from "../../lib/resource-library";
test("original templates provide frontend controls, honest form states and mobile layouts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const id of libraryResources
    .filter((r) => r.category === "templates" && r.author === "Migbits")
    .map((r) => r.id.replace("template-", ""))) {
    await page.goto("/library/previews/templates/" + id + ".html");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const form = page.locator("form").first();
    if (await form.count()) {
      await form
        .getByRole("textbox", { name: "Email address", exact: true })
        .fill("hello@example.com");
      await form.getByRole("button").click();
      await expect(form.getByRole("status")).toContainText(
        "no information has been sent",
      );
    }
    const filter = page
      .locator('[data-filter]:not([data-filter="all"])')
      .first();
    if (await filter.count()) {
      await filter.click();
      await expect(filter).toHaveAttribute("aria-pressed", "true");
      expect(await page.locator("[data-item]:visible").count()).toBeGreaterThan(
        0,
      );
    }
    if (id === "pulse") {
      await page.getByRole("button", { name: "Projects", exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Projects",
      );
      await page
        .getByRole("searchbox", { name: "Search activity" })
        .fill("zz-nonexistent");
      await expect(page.locator("[data-search-item]:visible")).toHaveCount(0);
    }
    if (id === "supply") {
      await page.locator("[data-add-cart]:visible").first().click();
      await expect(page.locator("[data-cart-count]")).toHaveText("1");
      await page
        .getByRole("button", { name: "Preview checkout", exact: true })
        .click();
      await expect(page.locator("[data-cart-status]")).toContainText(
        "Demo checkout",
      );
    }
    await page.setViewportSize({ width: 375, height: 812 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      id,
    ).toBe(true);
    await page.setViewportSize({ width: 1440, height: 1100 });
  }
  expect(errors).toEqual([]);
});
