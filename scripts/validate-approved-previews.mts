import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const templates = process.argv.includes("--templates");
const collection = process.argv.includes("--collection");
const requestedIds = process.argv.find(value => value.startsWith("--ids="))?.slice(6).split(",");
const records = JSON.parse(readFileSync(collection ? "catalog/template-research/collection-import-candidates.json" : templates ? "catalog/template-research/import-candidates.json" : "catalog/approved-resource-candidates.json", "utf8")).filter((record: {id: string}) => !requestedIds || requestedIds.includes(record.id));
if (collection && !templates) throw Error("Collection validation requires --templates");
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
      await page.waitForFunction(() => document.body.dataset.previewState === "rendered" || document.body.dataset.previewState === "error", undefined, { timeout: 15000 });
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
    } finally {
      page.off("pageerror", collect);
      if (collection) writeFileSync("catalog/template-research/collection-validation-checkpoint.json", JSON.stringify({ checkedAt: new Date().toISOString(), results, passed }, null, 2) + "\n");
      console.log(`${results.length}/${records.length}: ${record.id} ${results.at(-1)?.status}`);
    }
  }
} finally { await browser.close(); }
const validationFile = collection ? "catalog/template-research/collection-render-validation.json" : templates ? "catalog/template-research/render-validation.json" : "catalog/approved-resource-validation.json";
const priorResults = collection && existsSync(validationFile) ? JSON.parse(readFileSync(validationFile, "utf8")) : [];
const resultIds = new Set(results.map(r => r.id));
writeFileSync(validationFile, JSON.stringify([...priorResults.filter((r: {id: string}) => !resultIds.has(r.id)), ...results], null, 2) + "\n");
const existing = templates ? JSON.parse(readFileSync("catalog/approved-templates.json", "utf8")) : [];
const attempted = new Set(records.map((r: {id: string}) => r.id));
const merged = templates ? [...existing.filter((r: {id: string}) => !attempted.has(r.id)), ...passed] : passed;
writeFileSync(templates ? "catalog/approved-templates.json" : "catalog/approved-resources.json", JSON.stringify(merged, null, 2) + "\n");
console.log(JSON.stringify({ attempted: records.length, passed: passed.length, held: results.filter(r => r.status === "held") }, null, 2));
