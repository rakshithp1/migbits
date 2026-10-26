import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const approved = read("catalog/approved-templates.json").filter((r: {id:string}) => r.id.startsWith("approved-collection-"));
test("Collection templates preserve reviewed source and enforce the preview boundary", () => {
  assert.ok(approved.length > 0);
  const snapshot = read("catalog/template-research/reviewed-single-file-source.json");
  for (const item of approved) {
    const html = readFileSync("public" + item.previewUrl, "utf8");
    assert.match(html, /default-src 'none'/);
    assert.match(html, /connect-src 'none'/);
    assert.match(html, /form-action 'none'/);
    assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/i);
    assert.doesNotMatch(html, /<img\b[^>]*\bsrc=["']https?:/i);
    assert.doesNotMatch(html, /id=["']template-bar["']/i);
    assert.doesNotMatch(html.split(/<\/head>/i)[0], /<svg\b/i, "Inline favicon markup must be removed as a complete quoted tag");
    const review = read(`resources/template-imports/${item.id}/review.json`);
    assert.equal(review.revision, snapshot.revision);
    const source = readFileSync(`resources/template-imports/${item.id}/original/index.html`);
    const digest = createHash("sha256").update(source).digest("hex");
    assert.ok(Object.values(snapshot.sourceSha256).includes(digest), item.id);
    assert.match(readFileSync("public" + item.licenseUrl, "utf8"), /Copyright \(c\) 2026 mmrahmanbappi/);
  }
});
