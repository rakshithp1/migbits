import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { libraryResources } from "../lib/resource-library";
import retired from "../catalog/library/retired-shader-resources.json";
import validation from "../catalog/library/cleanup-preview-validation.json";

test("Custom colour previews and retained motion scenes match tested artifacts", () => {
  for (const item of libraryResources.filter(r => r.category === "templates" || r.category === "shaders")) {
    const proof = validation.find(r => r.id === item.id);
    assert.equal(proof?.status, "passed", item.id);
    assert.equal(proof?.previewUrl, item.previewUrl);
    assert.equal(proof?.previewDigest, createHash("sha256").update(readFileSync("public" + item.previewUrl)).digest("hex"), item.id);
  }
});

test("Retired checkerboard, blur and static fixtures have no public entry or individual assets", () => {
  for (const item of retired.items) {
    assert.equal(libraryResources.some(r => r.id === item.id), false, item.id);
    for (const url of [item.dataUrl, item.downloadUrl, `/imported/shaders/previews/${item.id}.html`, `/imported/shaders/thumbnails/${item.id}.png`]) assert.equal(existsSync("public" + url), false, url);
  }
  for (const item of libraryResources.filter(r => r.category === "shaders")) {
    const html = readFileSync("public" + item.previewUrl, "utf8");
    assert.doesNotMatch(html, /Play animation|id="play"/);
    assert.match(html, /schedule\(\)/);
    assert.match(html, /prefers-reduced-motion/);
  }
});
