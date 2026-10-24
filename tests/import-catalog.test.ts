import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import { findImports, importedResources } from "../lib/import-catalog";
import type { ImportedPayload } from "../lib/import-catalog";
import { importReport } from "../lib/import-status";
import { parseCsv } from "../scripts/import-open-source";

test("design CSV parser preserves quotes, multiline values, empty fields and UTF-8 BOM", () => {
  assert.deepEqual(parseCsv('\uFEFFName,Note,Empty\r\n"Serif, Sans","A ""quoted""\nvalue",\r\n'), [{ Name: "Serif, Sans", Note: 'A "quoted"\nvalue', Empty: "" }]);
  assert.throws(() => parseCsv('Name,Note\n"unfinished,value'), /Unclosed/);
  assert.throws(() => parseCsv('Name,Note\na,b,c'), /column/);
});

test("import discovery combines filters and pagination input remains server data", () => {
  assert.ok(findImports("hero", "inspo", "Blocks & sections").length > 0);
  assert.ok(findImports("", "shaders").every(item => item.category === "Shaders & graphics"));
  assert.equal(findImports("zz-no-such-resource-zz").length, 0);
});

test("every imported resource has unique provenance, intact original files and license notices", () => {
  const ids = new Set<string>();
  for (const item of importedResources) {
    assert.equal(ids.has(item.id), false); ids.add(item.id);
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.match(item.revision, /^[a-f0-9]{40}$/);
    assert.ok(item.upstream.includes(item.revision));
    assert.match(item.dataUrl, /^\/imported\/[a-z0-9-]+\/[a-z0-9-]+\.json$/);
    assert.match(item.downloadUrl, /^\/imported\/[a-z0-9-]+\/[a-z0-9-]+\.zip$/);
    const payload: ImportedPayload = JSON.parse(readFileSync(`public${item.dataUrl}`, "utf8"));
    assert.equal(payload.resource.digest, item.digest);
    assert.ok(payload.files.some(file => /(^|\/)(LICENSE|LICENCE)(\.|$)/i.test(file.path)));
    for (const file of payload.files) {
      assert.ok(!file.path.split("/").includes("..") && !file.path.startsWith("/"));
      assert.equal(createHash("sha256").update(file.content).digest("hex"), file.sha256);
    }
    assert.ok(item.validationNotes.some(note => note.includes("not yet validated")));
  }
});

test("each collection download contains source notices and source counts reconcile with its inventory", () => {
  for (const source of importReport.sources.filter(source => source.status === "imported")) {
    const items = importedResources.filter(item => item.source === source.id);
    assert.equal(items.length, source.imported);
    assert.equal(source.discovered, items.length + (source.duplicates || 0) + (source.removed || 0));
    const progress = JSON.parse(readFileSync(`catalog/import-progress/${source.id}.json`, "utf8"));
    assert.equal(progress.items.length, source.discovered);
    assert.match(progress.licenseSha256, /^[a-f0-9]{64}$/);
    const item = items[0];
    const archive = unzipSync(new Uint8Array(readFileSync(`public${item.downloadUrl}`)));
    const payload: ImportedPayload = JSON.parse(strFromU8(archive["MIGBITS-RESOURCE.json"]));
    for (const file of payload.files) assert.equal(strFromU8(archive[file.path]), file.content);
  }
  assert.equal(importReport.complete, false);
  assert.ok(importReport.sources.some(source => source.id === "originkit" && source.status === "excluded"));
});

test("static hosting limits and split support packs preserve the complete attributed asset tree", () => {
  function checkFiles(folder: string) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) checkFiles(file);
      else assert.ok(statSync(file).size <= 24_000_000, `Static file too large: ${file}`);
    }
  }
  checkFiles("public/imported");
  const allowed = new Set(["inspo", "magic-ui", "shaders", "ui-ux-pro-max"]);
  assert.ok(importedResources.every(item => allowed.has(item.source)));
  const cleanup = JSON.parse(readFileSync("catalog/rights-cleanup.json", "utf8"));
  for (const removed of cleanup.removed) {
    assert.equal(importedResources.some(item => item.id === removed.id), false);
    const [source, slug] = removed.id.split("--");
    assert.equal(existsSync(`public/imported/${source}/${slug}.json`), false);
    assert.equal(existsSync(`public/imported/${source}/${slug}.zip`), false);
  }
  assert.equal(existsSync("components/site-effects/BlurText.tsx"), false);
  assert.equal(existsSync("components/site-effects/SpotlightCard.tsx"), false);
});
