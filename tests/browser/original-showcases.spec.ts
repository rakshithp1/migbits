import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";

test("Original audio storefront auto-animates, changes finishes and includes an editable prompt", async ({ page, context, request }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/library/resource/template-sonic");
  await page.getByRole("button", { name: "Copy build prompt", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("Design Sonic Atelier");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  const initial = await frame.locator(".float").evaluate(node => getComputedStyle(node).transform);
  await expect.poll(() => frame.locator(".float").evaluate(node => getComputedStyle(node).transform)).not.toBe(initial);
  await frame.getByRole("button", { name: "Copper", exact: true }).click();
  await expect(frame.locator("#finish-name")).toHaveText("Copper");
  await frame.getByRole("button", { name: /^Add to demo bag/ }).click();
  await expect(frame.locator("#cart-count")).toHaveText("1");
  await expect(frame.locator("#cart-status")).toContainText("Checkout is not connected");
  const response = await request.get("/library/downloads/template-sonic.zip");
  expect(response.ok()).toBe(true);
  const files = unzipSync(new Uint8Array(await response.body()));
  expect(strFromU8(files["PROMPT.md"])).toContain("Original MigBits build brief");
  expect(strFromU8(files["LICENSE.txt"])).toContain("Permission is hereby granted");
  expect(strFromU8(files["index.html"])).toContain("connect-src 'none'");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame.locator("html")).toHaveAttribute("data-template-motion", "paused");
});

test("Original studio filters real project cards and has ready mobile navigation", async ({ page }) => {
  await page.goto("/library/resource/template-margin");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await frame.getByRole("button", { name: "Digital", exact: true }).click();
  await expect(frame.locator("[data-project]:visible")).toHaveCount(1);
  await frame.getByRole("button", { name: "All work", exact: true }).click();
  await expect(frame.locator("[data-project]:visible")).toHaveCount(3);
  await page.setViewportSize({ width: 375, height: 812 });
  await frame.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(frame.locator(".menu")).toHaveAttribute("aria-expanded", "true");
  expect(await frame.locator("html").evaluate(node => node.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("Original coaching template changes plans, selects sessions and keeps enquiries local", async ({ page }) => {
  await page.goto("/library/resource/template-stride");
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await frame.getByRole("button", { name: "03 / Go the distance", exact: true }).click();
  await expect(frame.locator("#plan-title")).toHaveText("5 sessions / week");
  await expect(frame.locator("#plan-price")).toHaveText("64");
  await frame.getByRole("button", { name: "Tuesday / 18:00", exact: true }).click();
  await expect(frame.locator("#slot-status")).toContainText("No booking has been made");
  await frame.getByRole("textbox", { name: "Your name", exact: true }).fill("Demo person");
  await frame.getByRole("textbox", { name: "Email address", exact: true }).fill("demo@example.com");
  await frame.getByRole("textbox", { name: "Tell us a little more", exact: true }).fill("A demonstration enquiry");
  await frame.getByRole("button", { name: "Send enquiry ↗", exact: true }).click();
  await expect(frame.locator("form [role=status]")).toContainText("has not been sent");
});
