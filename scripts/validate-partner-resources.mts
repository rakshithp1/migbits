import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { zipSync, strToU8 } from "fflate";

const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const hash = (b: Uint8Array | string) => createHash("sha256").update(b).digest("hex");
const save = (p: string, data: string | Uint8Array) => writeFileSync(p, data);
const json = (p: string, v: unknown) => save(p, JSON.stringify(v, null, 2) + "\n");
const candidates = read("catalog/partner-imports/candidates.json");
const resume = process.argv.includes("--resume");
const priorResults = resume && existsSync("catalog/partner-imports/render-validation.json") ? read("catalog/partner-imports/render-validation.json") : [];
const priorApproved = resume && existsSync("catalog/approved-partner-resources.json") ? read("catalog/approved-partner-resources.json") : [];
const priorHashes: Record<string, string> = Object.assign({}, ...priorApproved.map((r: { review: {artifactDigests: Record<string, string>} }) => r.review.artifactDigests));
const inventory = read("catalog/partner-imports/inventory.json");
const base = process.env.APPROVED_PREVIEW_ORIGIN || "http://127.0.0.1:3212";
const browser = await chromium.launch({ channel: "chrome" });
const passed = [], results = [];
mkdirSync("public/library/approved/thumbnails", { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 820 }, reducedMotion: "no-preference" });
  for (const item of candidates) {
    const previous = priorResults.find((r: {id: string; status: string}) => r.id === item.id && r.status === "passed");
    if (previous && [item.previewUrl, item.image, item.dataUrl, item.downloadUrl, item.licenseUrl].every(url => existsSync("public" + url) && priorHashes[url] === hash(readFileSync("public" + url)))) {
      passed.push(item); results.push(previous); console.log(`Retained exact validated artifacts: ${item.id}`); continue;
    }
    const errors: string[] = [];
    const collect = (error: Error) => errors.push(error.message);
    page.on("pageerror", collect);
    try {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: 1100, height: 820 });
      const response = await page.goto(base + item.previewUrl);
      if (!response?.ok()) throw Error("Preview response failed");
      await page.waitForFunction(() => ["rendered", "error"].includes(document.body.dataset.previewState || ""), undefined, { timeout: 12000 });
      if (errors.length || await page.locator("body").getAttribute("data-preview-state") === "error") throw Error(errors.join("; ") || "Runtime boundary failed");
      if (await page.locator("img").evaluateAll(images => images.some(image => !(image as HTMLImageElement).complete || !(image as HTMLImageElement).naturalWidth))) throw Error("Missing example artwork");
      if (item.previewType === "motion-example") {
        if (!await page.locator("#root *").count()) throw Error("Empty example root");
        await page.getByRole("button", { name: "Pause motion", exact: true }).click();
        if (await page.locator("html").getAttribute("data-partner-motion") !== "paused") throw Error("Pause did not apply");
      }
      const image = await page.screenshot({ animations: "disabled" });
      const stats = await sharp(image).stats();
      if (stats.channels.slice(0, 3).every(c => c.stdev < 2)) throw Error("Flat/blank screenshot");
      save("public" + item.image, image);
      if (item.previewType === "motion-example") {
        await page.getByRole("button", { name: "Resume motion", exact: true }).click();
        await page.emulateMedia({ reducedMotion: "reduce" });
        if (!await page.getByRole("button", { name: "Reduced motion", exact: true }).isDisabled()) throw Error("Reduced motion policy did not apply");
      }
      await page.setViewportSize({ width: 375, height: 812 });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw Error("Document mobile overflow; original demo may use a scrollable canvas");
      if (errors.length) throw Error(errors.join("; "));
      passed.push(item);
      results.push({ id: item.id, status: "passed", detail: item.previewType === "source-kit" ? "Source hash/notice integrity and documentation preview rendered. Upstream installation/build remains UNVERIFIED." : "Chrome render, root content, screenshot, motion pause/resume, live reduced-motion and mobile document-width checks. Original fixed-width content can scroll within the demo canvas; full accessibility/consumer certification is separate." });
    } catch (error) { results.push({ id: item.id, status: "held", detail: String(error) }); }
    finally {
      page.off("pageerror", collect);
      json("catalog/partner-imports/validation-checkpoint.json", { results, passedIds: passed.map(r => r.id) });
      console.log(`${results.length}/${candidates.length}: ${item.id} ${results.at(-1)?.status}`);
    }
  }
} finally { await browser.close(); }

const grouped = new Map<string, typeof passed>();
for (const item of passed) {
  const group = item.previewType === "source-kit" ? item.id : item.family;
  grouped.set(group, [...(grouped.get(group) || []), item]);
}
const approved = [];
for (const [family, members] of grouped) {
  const first = members[0];
  const sourceKit = first.previewType === "source-kit";
  const id = sourceKit ? first.id : `approved-motion-collection-${family}`;
  const record = { ...first, id };
  const assetDigests: Record<string, string> = {};
  const previewDigests: Record<string, string> = {};
  const files: Record<string, string> = {};
  for (const member of members) {
    const data = read("public" + member.dataUrl);
    for (const file of data.files) files[sourceKit ? file.path : `${member.id}/${file.path}`] = file.content;
    for (const url of [member.previewUrl, member.image, member.dataUrl, member.downloadUrl, member.licenseUrl]) assetDigests[url] = hash(readFileSync("public" + url));
    previewDigests[member.previewUrl] = assetDigests[member.previewUrl];
  }
  if (!sourceKit) {
    const title = family.split("-").map(s => s[0].toUpperCase() + s.slice(1)).join(" ");
    record.name = `Motion · ${title} examples`;
    record.description = `${members.length} reviewed MIT Motion source variants in one collection. Original code, current client imports and dependency notices stay distinct. These are technical examples requiring production accessibility review.`;
    record.variants = members.map(member => ({ label: member.name.replace("Motion · ", ""), previewUrl: member.previewUrl, dataUrl: member.dataUrl, downloadUrl: member.downloadUrl }));
    record.downloadUrl = `/library/approved/downloads/${id}.zip`;
    record.image = `/library/approved/thumbnails/${id}.png`;
    record.dataUrl = `/library/approved/data/${id}.json`;
    record.licenseUrl = `/library/approved/notices/${id}.txt`;
    files["README-MIGBITS.md"] = `# ${record.name}\n\n${record.description}\n\n${record.usage.join("\n\n")}\n\n${members.length} variants, not ${members.length} separate gallery components or templates.`;
    save("public" + record.downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([p, c]) => [p, strToU8(c)])), { level: 6, mtime: new Date("2026-01-01") }));
    json("public" + record.dataUrl, { files: Object.entries(files).map(([path, content]) => ({ path, content, sha256: hash(content) })), installation: record.usage, resource: { revision: record.revision, kind: "Grouped Motion source examples" } });
    save("public" + record.licenseUrl, readFileSync("public" + first.licenseUrl));
    const samples = members.slice(0, 4);
    const columns = samples.length <= 2 ? 1 : 2, rows = Math.ceil(samples.length / columns);
    const tileWidth = 1000 / columns, tileHeight = 740 / rows;
    const tiles = await Promise.all(samples.map(async (member, index) => ({ input: await sharp("public" + member.image).resize(tileWidth, tileHeight, { fit: "cover" }).png().toBuffer(), left: index % columns * tileWidth, top: Math.floor(index / columns) * tileHeight })));
    const cover = await sharp({ create: { width: 1000, height: 740, channels: 3, background: "#10182c" } }).composite(tiles).png().toBuffer();
    save("public" + record.image, cover);
    for (const url of [record.image, record.dataUrl, record.downloadUrl, record.licenseUrl]) assetDigests[url] = hash(readFileSync("public" + url));
  }
  const repositoryKey = sourceKit ? id.replace("approved-partner-", "").replace(/^(textura-agency|motiondivision)-/, "$1--") : "motiondivision--motion";
  record.partner = { repositoryKey, variants: members.length, validationScope: record.validationScope, installation: sourceKit ? "UNVERIFIED" : "Preview compiled against installed React/Motion; original consumer integration needs review" };
  record.review = { ...record.review, notices: sourceKit ? record.review.notices : Object.keys(files).filter(p => /(?:^|\/)(?:LICENSE\.md|DEPENDENCY_NOTICES\.txt|MIGBITS-ADAPTATION-LICENSE)$/.test(p)), preview: "passed", checkedAt: new Date().toISOString(), previewDigest: hash(readFileSync("public" + record.previewUrl)), previewDigests, artifactDigests: assetDigests };
  approved.push(record);
}
for (const item of inventory) {
  const result = results.find(r => r.id === item.id);
  if (result) { item.status = result.status === "passed" ? item.status === "SOURCE_IMPORTED_INSTALL_UNVERIFIED" ? "IMPORTED_SOURCE_INSTALL_UNVERIFIED" : "IMPORTED_PREVIEW_VALIDATED" : "BLOCKED_VALIDATION"; item.reason = result.detail; }
}
json("catalog/partner-imports/inventory.json", inventory);
json("catalog/partner-imports/render-validation.json", results);
json("catalog/approved-partner-resources.json", approved);
console.log(JSON.stringify({ attempted: candidates.length, passedVariantsAndKits: passed.length, galleryCollections: approved.length, held: results.filter(r => r.status !== "passed") }, null, 2));
