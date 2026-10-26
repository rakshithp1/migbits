import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { unzipSync, strFromU8 } from "fflate";
import partners from "../catalog/approved-partner-resources.json";
import { libraryResources, resourceUsage } from "../lib/resource-library";

test("Partner scopes retain exact source grants and tested artifacts", () => {
  assert.ok(partners.length > 0);
  for (const item of partners) {
    assert.ok(libraryResources.some(r => r.id === item.id));
    assert.match(item.sourceUrl, /^https:\/\/github\.com\/(motiondivision|textura-agency)\//);
    assert.ok(!("template" in item), "Technical examples and source kits must not inflate template counts");
    for (const [url, expected] of Object.entries(item.review.artifactDigests)) assert.equal(createHash("sha256").update(readFileSync("public" + url)).digest("hex"), expected, url);
    const archive = unzipSync(readFileSync("public" + item.downloadUrl));
    for (const notice of item.review.notices) assert.ok(archive[notice], notice);
    if (item.previewType === "source-kit") {
      assert.equal(item.category, "tools");
      assert.equal(item.partner.installation, "UNVERIFIED");
      assert.match(strFromU8(archive["README-MIGBITS.md"]), /not been executed or certified/);
      assert.ok(resourceUsage(item).saleOfCopies);
    } else {
      assert.ok(item.variants?.length);
      assert.equal(item.partner.variants, item.variants.length);
      const html = readFileSync("public" + item.previewUrl, "utf8");
      assert.match(html, /connect-src 'none'/);
      assert.match(html, /Pause motion/);
      assert.doesNotMatch(html, /<script\b[^>]*src=["']https?:/i);
    }
  }
});
