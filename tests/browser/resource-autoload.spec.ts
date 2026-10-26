import { test, expect } from "@playwright/test";
import { libraryResources } from "../../lib/resource-library";

for (const category of ["components", "blocks"] as const) {
  test(`Every ${category} resource opens its default isolated example without an activation button`, async ({ page }) => {
    test.setTimeout(480_000);
    const items = libraryResources.filter(item => item.category === category);
    const failures: string[] = [];
    for (const item of items) {
      const errors: string[] = [];
      const collect = (error: Error) => errors.push(error.message);
      page.on("pageerror", collect);
      try {
        await page.goto(`/library/resource/${item.id}`);
        await expect(page.getByRole("button", { name: /Load interactive preview|Load source kit overview/ })).toHaveCount(0);
        await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
        const frame = page.frameLocator("iframe");
        if (item.previewType === "component") {
          await expect(frame.locator(".kit-preview-inner")).toBeVisible();
          await expect(frame.locator(".kit-preview-loading")).toHaveCount(0);
        } else {
          await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
        }
        expect(errors, item.id).toEqual([]);
      } catch (error) { failures.push(`${item.id}: ${String(error).slice(0, 350)}`); }
      finally { page.off("pageerror", collect); }
    }
    expect(failures, `${items.length} default ${category} previews audited`).toEqual([]);
  });
}
