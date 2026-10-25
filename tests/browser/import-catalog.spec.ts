import { test, expect } from "@playwright/test";

test("removed resources and their source downloads are no longer served", async ({
  request,
}) => {
  for (const route of [
    "/open-source/imports/bencho--ascii-wake",
    "/imported/bencho/ascii-wake.json",
    "/imported/bencho/ascii-wake.zip",
    "/imported/bencho/support.zip",
    "/imported/threeui/support.zip",
    "/imported/magic-ui/android.zip",
  ]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});

test("shared library navigation fits mobile across the existing galleries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/library",
    "/open-source",
    "/open-source/components",
    "/open-source/icons",
    "/open-source/motion",
  ]) {
    await page.goto(route);
    const mobileMenu = page.getByLabel("Open navigation", { exact: true });
    if (await mobileMenu.count()) {
      await mobileMenu.click();
      await expect(
        page.getByRole("navigation", {
          name: "Mobile library navigation",
          exact: true,
        }),
      ).toBeVisible();
      await mobileMenu.click();
    } else {
      await expect(
        page.getByRole("navigation", { name: "Library navigation" }),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      route,
    ).toBe(true);
  }
});

test("archive routes redirect to the library and passing resources use isolated previews", async ({
  page,
  request,
}) => {
  await page.goto("/open-source/imports");
  await expect(page).toHaveURL(/\/library$/);
  await expect(
    page.getByRole("link", { name: "Source archive", exact: true }),
  ).toHaveCount(0);
  await page.goto("/open-source/imports/shaders--aurora");
  await expect(page).toHaveURL(/\/library\/resource\/shaders--aurora$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aurora");
  await page.getByRole("button", { name: "Load interactive preview" }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "sandbox",
    "allow-scripts",
  );
  const preview = page.frameLocator("iframe");
  const gpuAvailable = await preview.locator("body").evaluate(async () => {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
    return Boolean(gpu && await gpu.requestAdapter());
  });
  if (gpuAvailable) {
    await expect(preview.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  } else {
    // Headless CI may have no GPU. Verify the real fallback instead of claiming a render.
    await expect(preview.locator("body")).toHaveAttribute("data-preview-state", "error");
    await expect(preview.getByRole("status")).toContainText("Live WebGPU preview unavailable on this device");
    await expect(preview.getByRole("button", { name: "Play animation" })).toBeDisabled();
    test.info().annotations.push({ type: "GPU unavailable", description: "Verified unsupported-device fallback; shader rendering requires a compatible GPU." });
  }
  expect(
    (await request.get("/open-source/imports/shaders--webcamtexture")).status(),
  ).toBe(404);
});

test("shader thumbnails and server-rendered search work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/library/shaders?q=aurora");
  await expect(page.locator(".mb-card")).toHaveCount(1);
  await expect(page.locator(".mb-card img")).toHaveAttribute("src", /aurora/);
  await expect(
    page.getByRole("link", { name: "Source archive", exact: true }),
  ).toHaveCount(0);
  await context.close();
});
