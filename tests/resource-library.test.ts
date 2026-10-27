import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Script } from "node:vm";
import { unzipSync, strFromU8 } from "fflate";
import {
  findLibraryResources,
  libraryResources,
  resourceCategories,
} from "../lib/resource-library";
import { contrastRatio, relativeLuminance } from "../lib/color-theory";
import { figmaKits, kitPlugin } from "../resources/library/figma-kits";
import curation from "../catalog/library/curation.json";
import promotions from "../catalog/archive-previews/promotion.json";
import approved from "../catalog/approved-resources.json";
import templates from "../catalog/approved-templates.json";
import partners from "../catalog/approved-partner-resources.json";
import { validateLibrary } from "../lib/library-validation";
test("visual curation excludes retired entries and repeated color families from delivery", () => {
  const ids = new Set(libraryResources.map((r) => r.id));
  const baseline = new Set([...curation.retainedIds, ...promotions.map(r => r.id)]);
  for (const id of baseline) assert.ok(ids.has(id), `Existing resource lost: ${id}`);
  for (const item of libraryResources) assert.ok(baseline.has(item.id) || [...approved, ...templates, ...partners].some(r => r.id === item.id), `Unreviewed gallery addition: ${item.id}`);
  for (const item of approved) assert.ok(ids.has(item.id) || libraryResources.some(r => r.variants?.some(v => v.previewUrl === item.previewUrl)), `Source variant lost: ${item.id}`);
  for (const item of curation.removed) {
    assert.equal(ids.has(item.id), false, item.id);
    for (const url of [
      item.dataUrl,
      item.image,
      item.downloadUrl,
      item.previewUrl,
    ].filter((u): u is string => Boolean(u && u.startsWith("/library/")))) {
      assert.equal(existsSync("public" + url), false, url);
    }
  }
  const palettes = libraryResources.filter((r) => r.category === "colors");
  assert.equal(
    new Set(palettes.map((p) => p.colors!.Primary)).size,
    palettes.length,
  );
  assert.equal(
    libraryResources.filter((r) => r.category === "figma").length,
    1,
  );
});
test("gallery categories contain real resources and search combines terms within a category", () => {
  assert.equal(
    new Set(libraryResources.map((r) => r.id)).size,
    libraryResources.length,
  );
  for (const category of resourceCategories)
    assert.ok(
      findLibraryResources({ category: category.id }).length > 0,
      category.id,
    );
  assert.ok(
    findLibraryResources({ category: "blocks", query: "hero split" }).length >
      0,
  );
  assert.equal(
    findLibraryResources({ category: "illustrations", query: "hero split" })
      .length,
    0,
  );
  assert.equal(
    findLibraryResources({ query: "no-such-gallery-resource-zz" }).length,
    0,
  );
});
test("every gallery source and asset exists and original downloads preserve licenses", () => {
  for (const item of libraryResources) {
    assert.ok(item.author && item.license && item.downloadUrl);
    if (item.dataUrl) assert.ok(existsSync("public" + item.dataUrl), item.id);
    if (item.image && !item.image.endsWith(".png"))
      assert.ok(existsSync("public" + item.image), item.id);
    if (item.previewUrl)
      assert.ok(existsSync("public" + item.previewUrl), item.id);
    if (item.downloadUrl?.endsWith(".zip")) {
      const zip = unzipSync(
        new Uint8Array(readFileSync("public" + item.downloadUrl)),
      );
      assert.ok(
        Object.keys(zip).some((p) => /LICENSE|OFL|LICENCE/i.test(p)),
        item.id,
      );
      for (const path of Object.keys(zip))
        assert.ok(!path.startsWith("/") && !path.split("/").includes(".."));
      if (item.author === "Migbits")
        assert.match(strFromU8(zip.LICENSE), /sell\s+copies/);
    }
  }
  for (const item of libraryResources.filter((r) => r.license === "OFL-1.1"))
    assert.equal(item.category, "typography");
  assert.deepEqual(validateLibrary(libraryResources), []);
  assert.ok(libraryResources.every(r => ["MIT", "MIT AND OFL-1.1", "OFL-1.1", "CC0-1.0", "Unlicense", "LicenseRef-MotionSites-Distribution"].includes(r.license)));
});

test("new resources cannot bypass source/preview approval or safe artifact paths", () => {
  const item = libraryResources.find(r => r.id.startsWith("approved-"))!;
  assert.ok(item);
  assert.ok(validateLibrary([{ ...item, review: undefined }]).length);
  assert.ok(validateLibrary([{ ...item, downloadUrl: "/../private.zip" }]).length);
  assert.ok(validateLibrary([item, item]).length);
});
test("contrast calculations match WCAG reference endpoints and reject invalid input", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#FFFFFF"), 1);
  assert.equal(contrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(contrastRatio("#7957D5", "#7957D5"), 1);
  assert.ok(Math.abs(contrastRatio("#777777", "#FFFFFF") - 4.478) < 0.001);
  assert.throws(() => relativeLuminance("#fff"), /six-digit/);
});
test("Figma kit sources parse and include native variants without network or font binaries", () => {
  for (const kit of figmaKits.filter((k) =>
    libraryResources.some((r) => r.id === "figma-" + k.id),
  )) {
    assert.doesNotThrow(() => new Script(kitPlugin(kit.id)));
    const zip = unzipSync(
      new Uint8Array(
        readFileSync("public/library/downloads/figma-" + kit.id + ".zip"),
      ),
    );
    const manifest = JSON.parse(strFromU8(zip["manifest.json"]));
    assert.deepEqual(manifest.networkAccess.allowedDomains, ["none"]);
    assert.equal(manifest.documentAccess, "dynamic-page");
    assert.ok(zip["board.svg"] && zip["tokens.json"] && zip["code.js"]);
    assert.match(strFromU8(zip["code.js"]), /combineAsVariants/);
    assert.match(strFromU8(zip["README.md"]), /not been verified/);
    assert.ok(!Object.keys(zip).some((p) => /\.(fig|ttf|woff2?)$/.test(p)));
  }
});
