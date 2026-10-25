import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const templates = process.argv.includes("--templates");
const records = JSON.parse(readFileSync(templates ? "catalog/template-research/import-candidates.json" : "catalog/approved-resource-candidates.json", "utf8"));
const base = process.env.APPROVED_PREVIEW_ORIGIN || "http://127.0.0.1:3212";
const browser = await chromium.launch({ channel: "chrome" });
const results: { id: string; status: string; detail: string; digest?: string }[] = [];
const passed = [];
mkdirSync("public/library/approved/thumbnails", { recursive: true });
try {
  const page = await browser.newPage({ viewport: templates ? { width: 1280, height: 900 } : { width: 960, height: 660 }, reducedMotion: "reduce" });
  for (const record of records) {
    const errors: string[] = [];
    const collect = (error: Error) => errors.push(error.message);
    page.on("pageerror", collect);
    try {
      if (templates) await page.setViewportSize({ width: 1280, height: 900 });
      const response = await page.goto(base + record.previewUrl);
      if (!response?.ok()) throw Error("Preview response failed");
      await page.waitForFunction(() => document.body.dataset.previewState === "rendered" || document.body.dataset.previewState === "error", { timeout: 15000 });
      if (await page.locator("body").getAttribute("data-preview-state") === "error" || errors.length) throw Error(errors.join("; ") || "Preview runtime error");
      if (await page.locator("body *").count() < 4) throw Error("Empty preview markup");
      const bytes = await page.screenshot({ animations: "disabled" });
      const stats = await sharp(bytes).stats();
      if (stats.channels.slice(0, 3).every(c => c.stdev < 2)) throw Error("Blank or flat thumbnail");
      writeFileSync("public" + record.image, bytes);
      const previewDigests: Record<string, string> = {};
      if (templates) {
        const urls: string[] = [...new Set<string>([record.previewUrl, ...(record.variants || []).map((v: { previewUrl: string }) => v.previewUrl)])];
        for (const url of urls) {
          await page.setViewportSize({ width: 1280, height: 900 });
          await page.goto(base + url);
          await page.waitForFunction(() => document.body.dataset.previewState === "rendered");
          if (errors.length) throw Error(errors.join("; "));
          if (await page.locator("img").evaluateAll(images => images.some(image => !(image as HTMLImageElement).complete || !(image as HTMLImageElement).naturalWidth))) throw Error("Missing template artwork " + url);
          await page.setViewportSize({ width: 375, height: 812 });
          if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw Error("Mobile overflow " + url);
          previewDigests[url] = createHash("sha256").update(readFileSync("public" + url)).digest("hex");
        }
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.getByRole("button", { name: "Pause motion", exact: true }).click();
        if (await page.locator("html").getAttribute("data-template-motion") !== "paused") throw Error("Template pause did not take effect");
        await page.getByRole("button", { name: "Resume motion", exact: true }).click();
        await page.emulateMedia({ reducedMotion: "reduce" });
        if (!await page.getByRole("button", { name: "Reduced motion", exact: true }).isDisabled()) throw Error("Template ignores reduced motion");
        await page.setViewportSize({ width: 1280, height: 900 });
      }
      const html = readFileSync("public" + record.previewUrl);
      const artifactDigests = templates ? Object.fromEntries([record.image, record.dataUrl, record.downloadUrl, record.licenseUrl].map(url => [url, createHash("sha256").update(readFileSync("public" + url)).digest("hex")])) : undefined;
      record.review = { ...record.review, preview: "passed", checkedAt: new Date().toISOString(), previewDigest: createHash("sha256").update(html).digest("hex"), ...(templates ? { previewDigests, artifactDigests } : {}) };
      passed.push(record);
      results.push({ id: record.id, status: "passed", detail: "Chrome isolated render, no page errors, nonblank thumbnail. Consumer and full accessibility checks remain separate.", digest: record.review.previewDigest });
    } catch (error) {
      results.push({ id: record.id, status: "held", detail: String(error) });
    } finally { page.off("pageerror", collect); }
  }
} finally { await browser.close(); }
writeFileSync(templates ? "catalog/template-research/render-validation.json" : "catalog/approved-resource-validation.json", JSON.stringify(results, null, 2) + "\n");
writeFileSync(templates ? "catalog/approved-templates.json" : "catalog/approved-resources.json", JSON.stringify(passed, null, 2) + "\n");
console.log(JSON.stringify({ attempted: records.length, passed: passed.length, held: results.filter(r => r.status === "held") }, null, 2));
