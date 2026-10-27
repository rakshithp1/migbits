import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { unzipSync, strFromU8 } from "fflate";
import { libraryResources, resourceUsage } from "../lib/resource-library";
import validation from "../catalog/library/coral-cta-validation.json";

test("Coral CTA is self-contained, preserves font rights and records the supplied brief accurately", () => {
  const item = libraryResources.find(r => r.id === "block-coral-signup")!;
  assert.equal(item.category, "blocks");
  assert.equal(item.license, "MIT AND OFL-1.1");
  assert.equal(resourceUsage(item).saleOfCopies, true);
  const files = unzipSync(readFileSync("public" + item.downloadUrl));
  const html = strFromU8(files["index.html"]);
  assert.match(html, /data:video\/mp4;base64,/);
  assert.match(html, /data:image\/png;base64,/);
  assert.doesNotMatch(html, /cloudfront\.net|Vexor|200\+ businesses/);
  const font = Buffer.from(html.match(/data:font\/ttf;base64,([A-Za-z\d+/=]+)/)![1], "base64");
  assert.equal(createHash("sha256").update(font).digest("hex"), "29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031");
  assert.match(strFromU8(files["INTER-OFL.txt"]), /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(html, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.ok(html.includes(strFromU8(files["INTER-OFL.txt"])), "The embedded font notice must remain complete and verbatim");
  assert.match(strFromU8(files["ORIGIN.md"]), /user-provided/);
  assert.equal(files["PROMPT.md"], undefined);
  assert.match(html, /connect-src 'none';form-action 'none'/);
  assert.equal(validation.status, "passed");
  for (const [url, expected] of Object.entries(validation.artifactDigests)) assert.equal(createHash("sha256").update(readFileSync("public" + url)).digest("hex"), expected, url);
});
