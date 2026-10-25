import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const records = JSON.parse(readFileSync("catalog/approved-resource-candidates.json", "utf8"));
const base = process.env.APPROVED_PREVIEW_ORIGIN || "http://127.0.0.1:3212";
const browser = await chromium.launch({ channel: "chrome" });
const results: { id: string; status: string; detail: string; digest?: string }[] = [];
const passed = [];
mkdirSync("public/library/approved/thumbnails", { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 660 }, reducedMotion: "reduce" });
  for (const record of records) {
    const errors: string[] = [];
    const collect = (error: Error) => errors.push(error.message);
    page.on("pageerror", collect);
    try {
      const response = await page.goto(base + record.previewUrl);
      if (!response?.ok()) throw Error("Preview response failed");
      await page.waitForFunction(() => document.body.dataset.previewState === "rendered" || document.body.dataset.previewState === "error", { timeout: 15000 });
      if (await page.locator("body").getAttribute("data-preview-state") === "error" || errors.length) throw Error(errors.join("; ") || "Preview runtime error");
      if (await page.locator("body *").count() < 4) throw Error("Empty preview markup");
      const bytes = await page.screenshot({ animations: "disabled" });
      const stats = await sharp(bytes).stats();
      if (stats.channels.slice(0, 3).every(c => c.stdev < 2)) throw Error("Blank or flat thumbnail");
      writeFileSync("public" + record.image, bytes);
      const html = readFileSync("public" + record.previewUrl);
      record.review = { ...record.review, preview: "passed", checkedAt: new Date().toISOString(), previewDigest: createHash("sha256").update(html).digest("hex") };
      passed.push(record);
      results.push({ id: record.id, status: "passed", detail: "Chrome isolated render, no page errors, nonblank thumbnail. Consumer and full accessibility checks remain separate.", digest: record.review.previewDigest });
    } catch (error) {
      results.push({ id: record.id, status: "held", detail: String(error) });
    } finally { page.off("pageerror", collect); }
  }
} finally { await browser.close(); }
writeFileSync("catalog/approved-resource-validation.json", JSON.stringify(results, null, 2) + "\n");
writeFileSync("catalog/approved-resources.json", JSON.stringify(passed, null, 2) + "\n");
console.log(JSON.stringify({ attempted: records.length, passed: passed.length, held: results.filter(r => r.status === "held") }, null, 2));
