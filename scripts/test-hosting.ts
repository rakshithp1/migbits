import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { resources } from "../catalog/resources";

const base = process.env.SMOKE_BASE_URL;
assert(base, "Set SMOKE_BASE_URL to the Worker preview or production origin.");
const origin = new URL(base);
assert(["http:", "https:"].includes(origin.protocol), "Expected an HTTP(S) origin.");

async function request(path: string, init?: RequestInit) {
  return fetch(new URL(path, origin), { ...init, signal: AbortSignal.timeout(30_000) });
}

async function main() {
for (const path of ["/", "/library", "/open-source", "/open-source/components", "/open-source/icons", "/open-source/motion"]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must render`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  const html = await response.text();
  assert.match(html, /migbits/i);
  if (path === "/") {
    const css = html.match(/href="([^"<>]+\.css(?:\?[^"<>]*)?)"/);
    assert(css, "Homepage must include its stylesheet");
    const asset = await request(css[1].replaceAll("&amp;", "&"));
    assert.equal(asset.status, 200, "CSS asset must load");
    assert.match(asset.headers.get("content-type") ?? "", /text\/css/);
  }
  console.log(`PASS ${path}`);
}

for (const [kind, count] of [["components", 65], ["motion", 6]] as const) {
  const path = `/api/open-source/${kind}`;
  const json = await request(`${path}?format=json`);
  assert.equal(json.status, 200);
  const pack = await json.json();
  assert.equal(pack.components.length, count);
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/zip/);
  const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const manifest = JSON.parse(strFromU8(archive["manifest.json"]));
  assert.equal(manifest.sourceDigest, pack.sourceDigest);
  assert.equal(Object.keys(archive).length, pack.files.length + 1);
  console.log(`PASS ${kind}: JSON and ZIP downloads`);
}

const resource = resources.find((entry) => entry.slug === "profile-settings")!;
const draft = await request(`/r/profile-settings/${resource.version}.json`);
assert.equal(draft.status, 404, "Production must not expose draft registry entries");
assert.equal((await draft.json()).error.code, "RESOURCE_NOT_RELEASED");
const exportDraft = await request("/api/exports", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: resource.slug, version: resource.version, format: "json" }),
});
assert.equal(exportDraft.status, 404);
assert.equal((await exportDraft.json()).error.code, "RESOURCE_NOT_RELEASED");
console.log("PASS draft registry is private in production");
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
