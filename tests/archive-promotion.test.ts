import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import promotions from "../catalog/archive-previews/promotion.json";
import audit from "../catalog/archive-previews/reconciliation.json";
import { libraryResources } from "../lib/resource-library";
test("archive promotion requires a successful isolated render and preserves provenance", () => {
  assert.equal(audit.entries.length, 270);
  assert.equal(new Set(audit.entries.map((r) => r.id)).size, 270);
  for (const p of promotions) {
    const resource = libraryResources.find((r) => r.id === p.id);
    assert.ok(resource, p.id);
    assert.equal(p.status, "validated");
    assert.ok(existsSync("public" + p.thumbnail));
    const html = readFileSync("public" + p.url, "utf8");
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /connect-src 'none'/);
    assert.ok(resource.sourceUrl && resource.revision && resource.licenseUrl);
    assert.ok(existsSync("public" + resource.licenseUrl));
  }
  for (const held of audit.entries.filter((r) => r.status !== "validated"))
    assert.equal(
      libraryResources.some((r) => r.id === held.id),
      false,
      held.id,
    );
});
