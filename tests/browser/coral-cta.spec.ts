import { test, expect } from "@playwright/test";

test("Coral CTA matches the desktop frame and automatically plays a forward loop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/library/previews/blocks/coral-signup.html");
  await expect(page.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await expect.poll(() => page.locator("video").evaluate(video => !(video as HTMLVideoElement).paused)).toBe(true);
  const geometry = await page.locator(".cta").boundingBox();
  expect(geometry!.x).toBeCloseTo(30, 0);
  expect(geometry!.width).toBeCloseTo(1380, 0);
  expect(geometry!.height).toBeCloseTo(340, 0);
  const media = await page.locator("video").evaluate(node => { const v = node as HTMLVideoElement; return { duration: v.duration, rate: v.playbackRate, loop: v.loop, muted: v.muted, time: v.currentTime }; });
  expect(media.duration).toBeGreaterThan(4.8); expect(media.duration).toBeLessThan(5.5);
  expect(media.rate).toBe(1); expect(media.loop).toBe(true); expect(media.muted).toBe(true);
  await expect.poll(() => page.locator("video").evaluate(node => (node as HTMLVideoElement).currentTime)).not.toBe(media.time);
  expect(await page.evaluate(() => document.fonts.check('600 34px "Inter MigBits"'))).toBe(true);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  expect(await page.locator("video").evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
  expect(await page.locator("h1").evaluate(node => getComputedStyle(node).opacity)).toBe("1");
});

test("Coral CTA works inside the sandbox, adapts to mobile and reduces to a still plate", async ({ page }) => {
  await page.goto("/library/resource/block-coral-signup");
  const frame = page.frameLocator("iframe");
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "allow-scripts");
  await expect(frame.locator("body")).toHaveAttribute("data-preview-state", "rendered");
  await page.waitForTimeout(1700); // Check actual decoded frames after the entrance has finished.
  const decoded = await frame.locator("video").evaluate(node => (node as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames);
  await expect.poll(() => frame.locator("video").evaluate(node => (node as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames)).toBeGreaterThan(decoded + 3);
  await frame.getByRole("textbox", { name: "Email address" }).fill("demo@example.com");
  await frame.getByRole("button", { name: "Get Free Access", exact: true }).click();
  await expect(frame.getByRole("status")).toContainText("no email was submitted");
  for (const size of [{ width: 768, height: 700 }, { width: 680, height: 612 }, { width: 390, height: 655 }]) {
    await page.setViewportSize(size);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await frame.locator("html").evaluate(node => node.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame.locator("html")).toHaveAttribute("data-cta-reduced", "true");
  await expect(frame.locator("video")).toBeHidden();
  expect(await frame.locator("video").evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
  expect(await frame.locator("h1").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
  await expect(frame.locator(".plate")).toBeVisible();
});
