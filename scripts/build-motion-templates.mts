/** Explicit review fetch, then deterministic offline builds. Never executes upstream scripts. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { templateMotionCss, templateMotionJs } from "../resources/library/template-motion";

interface Selection { slug: string; kind: string; title: string; color: string }
interface Review { id: string; status: "APPROVED"; repository: string; revision: string; license: string; evidence: string; author: string; checksums: Record<string, string>; sourceDigest: string; bootstrap: string; excludedAssets: string[]; adaptations: string[] }
const selected: Selection[] = JSON.parse(readFileSync("catalog/template-research/selected.json", "utf8"));
const hash = (input: string | Uint8Array) => createHash("sha256").update(input).digest("hex");
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const save = (file: string, content: string | Uint8Array) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, content); };
const json = (file: string, value: unknown) => save(file, JSON.stringify(value, null, 2) + "\n");
const api = (endpoint: string) => {
  const response = spawnSync("gh", ["api", endpoint], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, windowsHide: true });
  if (response.status !== 0) throw Error(response.stderr);
  return JSON.parse(response.stdout);
};
async function text(url: string) { const response = await fetch(url, { signal: AbortSignal.timeout(45000) }); if (!response.ok) throw Error(`${response.status} ${url}`); return response.text(); }
function mitGrant(value: string) { return /Permission is hereby granted, free of charge/i.test(value) && /sublicense,? and\/or sell/i.test(value) && /copyright notice and this permission notice/i.test(value) && !/commons clause|non.?commercial|no redistribution/i.test(value); }
const rootLicense = readFileSync("public/library/LICENSE.txt", "utf8");
if (process.argv.includes("--fetch-reviewed")) {
  const outcomes = [];
  for (const selection of selected) {
    const repository = `StartBootstrap/startbootstrap-${selection.slug}`;
    const id = `approved-template-${selection.slug}`;
    const folder = `resources/template-imports/${id}`;
    try {
      if (existsSync(`${folder}/review.json`)) { outcomes.push({ id, status: "reviewed-snapshot-retained" }); continue; }
      const meta = api(`repos/${repository}`);
      const revision = api(`repos/${repository}/commits/${meta.default_branch}`).sha;
      const source = `https://raw.githubusercontent.com/${repository}/${revision}`;
      const license = await text(`${source}/LICENSE`);
      if (!mitGrant(license) || !/Start Bootstrap/.test(license)) throw Error("Creator MIT license not verified");
      const tree: { path: string; type: string }[] = api(`repos/${repository}/git/trees/${revision}?recursive=1`).tree;
      const entries = tree.filter(entry => entry.type === "blob" && (/^dist\/[^/]+\.html$/.test(entry.path) || ["dist/css/styles.css", "dist/js/scripts.js", "README.md", "package.json"].includes(entry.path)));
      if (!entries.some(entry => entry.path === "dist/index.html")) throw Error("No complete prebuilt HTML entry");
      const files: Record<string, string> = { LICENSE: license };
      for (const entry of entries) files[entry.path] = await text(`${source}/${entry.path}`);
      const bootstrap = files["dist/css/styles.css"]?.match(/Bootstrap\s+v([\d.]+)/)?.[1];
      if (!bootstrap || !bootstrap.startsWith("5.")) throw Error("Unreviewed embedded framework version");
      const bootstrapLicense = await text(`https://raw.githubusercontent.com/twbs/bootstrap/v${bootstrap}/LICENSE`);
      if (!mitGrant(bootstrapLicense)) throw Error("Bootstrap CSS license not verified");
      files["BOOTSTRAP-LICENSE"] = bootstrapLicense;
      // Do not copy stock photos, avatars, logos, fonts, icon fonts or executable vendors.
      const excludedAssets = tree.filter(entry => entry.type === "blob" && /^dist\//.test(entry.path) && !entries.includes(entry)).map(entry => entry.path);
      const checksums = Object.fromEntries(Object.entries(files).map(([file, content]) => [file, hash(content)]));
      const review: Review = { id, status: "APPROVED", repository, revision, license: "MIT", evidence: `${source}/LICENSE`, author: "Start Bootstrap", checksums, sourceDigest: hash(JSON.stringify(checksums)), bootstrap, excludedAssets, adaptations: ["Original HTML, CSS and author scripts are preserved separately; third-party artwork/fonts/favicon binaries are excluded, not relicensed.", "Runnable edition replaces image references with original MigBits SVG art, removes remote scripts/styles/fonts, and uses original MigBits native motion/navigation/form-demo controllers.", "Bootstrap embedded CSS retains its exact version license. Original external animation/icon/form services are not bundled or executed; preview parity with those services is not claimed."] };
      for (const [file, content] of Object.entries(files)) save(`${folder}/original/${file}`, content);
      json(`${folder}/review.json`, review);
      outcomes.push({ id, status: "source-approved", revision, excludedAssets: excludedAssets.length });
      console.log(`Reviewed ${id}: pinned MIT code, Bootstrap ${bootstrap}, ${excludedAssets.length} excluded asset files`);
    } catch (error) { outcomes.push({ id, status: "held", reason: String(error) }); console.error(`Held ${id}: ${String(error)}`); }
  }
  json("catalog/template-research/selected-source-review.json", outcomes);
}

/** Original demo artwork; no upstream photography is copied. */
function artwork(seed: string, color: string) {
  const n = Number.parseInt(hash(seed).slice(0, 4), 16);
  const hue = n % 360;
  const avatar = /profile|avatar|team|testimonial|headshot|\/\d{1,2}x\d{1,2}\//i.test(seed);
  const svg = avatar
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" rx="80" fill="hsl(${hue} 45% 88%)"/><path d="M120 800V680a280 280 0 0 1 560 0v120" fill="${color}"/><circle cx="400" cy="315" r="160" fill="#e6ba9b"/><path d="M240 310c-30-230 330-250 330 0-150-20-150-110-250-40Z" fill="#17243c"/><path d="M335 330h25m80 0h25m-100 80q35 25 70 0" fill="none" stroke="#17243c" stroke-width="13" stroke-linecap="round"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="hsl(${hue} 45% 14%)"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><rect width="1400" height="900" fill="url(#sky)"/><circle cx="${850 + n % 180}" cy="230" r="125" fill="#e6f0ff" opacity=".7"/><path d="M0 680 340 230 780 900H0Z" fill="#0b162b"/><path d="M1400 480 1010 180 390 900h1010Z" fill="#142a45"/><path d="M0 780Q370 470 770 730T1400 650v250H0" fill="${color}" opacity=".6"/><path d="M-20 860Q400 580 1420 820" stroke="#b7d5ff" stroke-width="3" fill="none" opacity=".5"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
const icon = '<span class="mb-template-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 11h12l-5-5 2-2 9 8-9 8-2-2 5-5H4z"/></svg></span>';
const records: Record<string, unknown>[] = [];
for (const selection of selected) {
  const id = `approved-template-${selection.slug}`;
  const folder = `resources/template-imports/${id}`;
  if (!existsSync(`${folder}/review.json`)) continue;
  const review: Review = read(`${folder}/review.json`);
  if (review.status !== "APPROVED" || review.license !== "MIT" || review.author !== "Start Bootstrap") throw Error(`Unapproved template ${id}`);
  const files: Record<string, string> = {};
  for (const [file, digest] of Object.entries(review.checksums)) {
    const content = readFileSync(`${folder}/original/${file}`, "utf8");
    if (hash(content) !== digest) throw Error(`Changed source ${id}/${file}`);
    files[`upstream/${file}`] = content;
  }
  if (review.sourceDigest !== hash(JSON.stringify(review.checksums))) throw Error("Review digest mismatch");
  const css = files["upstream/dist/css/styles.css"].replace(/url\(\s*(['"]?)(?!data:)([^)'"\s]+)\1\s*\)/gi, (_all, _quote, asset) => `url("${artwork(id + asset, selection.color)}")`);
  const pages = Object.keys(files).filter(file => /^upstream\/dist\/[^/]+\.html$/.test(file));
  const pageUrls = Object.fromEntries(pages.map(file => [path.basename(file), `/library/approved/sites/${id}/${path.basename(file)}`]));
  for (const file of pages) {
    let html = files[file]
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<link\b[^>]*>/gi, "")
      .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
      .replace(/<img\b([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*)>/gi, (_all, before, source, after) => {
        const size = source.match(/dummyimage\.com\/(\d+)x(\d+)/i);
        const dimensions = size && !/\bwidth\s*=/.test(before + after) ? ` width="${size[1]}" height="${size[2]}"` : "";
        return `<img ${before}src="${artwork(id + source, selection.color)}"${dimensions}${after.replace(/\balt\s*=\s*["'][^"']*["']/i, 'alt="Original MigBits demo artwork"')}>`;
      })
      .replace(/<i\b[^>]*>[\s\S]*?<\/i>/gi, icon)
      .replace(/href=["']([^"']+\.(?:png|jpe?g|webp|svg))["']/gi, (_all, image) => `href="#" data-mb-image="${artwork(id + image, selection.color)}"`)
      .replace(/href=["']([^"']+\.html)["']/gi, (_all, page) => `href="${pageUrls[path.basename(page)] || '#'}"`)
      .replace(/\s+data-sb-form-api-token=["'][^"']*["']/gi, "")
      .replace(/<body\b/i, '<body data-mb-template-edition data-preview-state="loading"');
    const safety = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data:;connect-src 'none';font-src 'none';form-action 'none';base-uri 'none'">`;
    html = html.replace(/<head>/i, `<head>${safety}`).replace(/<\/head>/i, `<style>${css.replace(/<\/style/gi, "<\\/style")}${templateMotionCss}</style></head>`).replace(/<\/body>/i, `<script>${templateMotionJs.replace(/<\/script/gi, "<\\/script")}</script></body>`);
    save("public" + pageUrls[path.basename(file)], html);
    // Downloaded edition uses relative page URLs; previews use isolated static routes.
    files[path.basename(file)] = Object.entries(pageUrls).reduce((value, [page, url]) => value.replaceAll(url, page), html);
  }
  files["LICENSE"] = files["upstream/LICENSE"];
  files["BOOTSTRAP-LICENSE"] = files["upstream/BOOTSTRAP-LICENSE"];
  files["MIGBITS-ADAPTATION-LICENSE"] = rootLicense;
  files["MIGBITS-MODIFICATIONS.json"] = JSON.stringify(review, null, 2);
  const usage = ["Extract the ZIP and open index.html. The runnable edition needs no package installation or CDN.", "Original upstream HTML/CSS/scripts are in upstream/. The root pages use separate MigBits motion, navigation and original SVG artwork. Original stock photographs, fonts, favicons and icon libraries are not bundled.", "Forms, purchases and external links are frontend demonstrations. Connect your own production backend and replace the demo content. Preserve LICENSE, BOOTSTRAP-LICENSE and MIGBITS-ADAPTATION-LICENSE.", "Pause motion is available in every adapted page; OS reduced motion is respected. Render checks are not a full accessibility or production-readiness certification."];
  files["README-MIGBITS.md"] = `# ${selection.title} — motion edition\n\nOriginal creator: ${review.author}\nSource: https://github.com/${review.repository}/tree/${review.revision}\n\n${usage.join("\n\n")}\n\n${review.adaptations.join("\n\n")}\n`;
  const downloadUrl = `/library/approved/downloads/${id}.zip`, dataUrl = `/library/approved/data/${id}.json`, licenseUrl = `/library/approved/notices/${id}.txt`;
  save("public" + downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([file, content]) => [file, strToU8(content)])), { level: 6, mtime: new Date("2026-01-01") }));
  const orderedFiles = [["index.html", files["index.html"]], ...Object.entries(files).filter(([file]) => file !== "index.html")];
  json("public" + dataUrl, { files: orderedFiles.map(([path, content]) => ({ path, content, sha256: hash(content) })), installation: usage, resource: { revision: review.revision, dependencies: [`Embedded Bootstrap CSS ${review.bootstrap} — MIT`, "Native browser animation APIs; no installed animation library"] } });
  save("public" + licenseUrl, [files.LICENSE, files["BOOTSTRAP-LICENSE"], files["MIGBITS-ADAPTATION-LICENSE"]].join("\n\n"));
  records.push({ id, name: `${selection.title} — motion edition`, description: `${selection.kind} template by Start Bootstrap, adapted with native motion, self-contained demo artwork and ${pages.length} page${pages.length === 1 ? '' : 's'}. Upstream source stays separate.`, category: "templates", author: review.author, license: "MIT", tags: [selection.kind, "HTML", "CSS", "Bootstrap", "Native motion", "Animated", "Reduced motion", "Full template"], format: "HTML · CSS · JavaScript", previewType: "template", previewUrl: pageUrls["index.html"], image: `/library/approved/thumbnails/${id}.png`, downloadUrl, dataUrl, sourceUrl: `https://github.com/${review.repository}/tree/${review.revision}`, licenseUrl, revision: review.revision, featured: 600, template: { kind: selection.kind, pages: pages.length, motion: true, motionEngine: "Native browser APIs", original: false }, usage, review: { status: "APPROVED", sourceDigest: review.sourceDigest, evidence: review.evidence, notices: ["LICENSE", "BOOTSTRAP-LICENSE", "MIGBITS-ADAPTATION-LICENSE"], preview: "pending", checkedAt: "" } });
  console.log(`Built isolated motion candidate ${id}: ${pages.length} pages, no remote dependencies`);
  if (pages.length > 1) records[records.length - 1].variants = Object.entries(pageUrls).map(([page, previewUrl]) => ({ label: page.replace(".html", "").replaceAll("-", " "), previewUrl, dataUrl, downloadUrl }));
}
json("catalog/template-research/import-candidates.json", records);
console.log(`${records.length} candidates built. Browser validation is required before gallery publication.`);
