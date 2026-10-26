/** Reviewed single-file collection adapter. Never installs or executes upstream build tools. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { templateMotionCss, templateMotionJs } from "../resources/library/template-motion";

const repository = "mmrahmanbappi/100-free-html-templates";
const cache = "tmp/template-collections/" + repository.replace("/", "--");
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const save = (file: string, value: string | Uint8Array) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, value); };
const json = (file: string, value: unknown) => save(file, JSON.stringify(value, null, 2) + "\n");
const summary = read("catalog/template-research/reviewed-single-file-source.json");
const retained = "resources/template-imports/approved-collection-analytics-dashboard/original";
const license = readFileSync(existsSync(cache + "/LICENSE") ? cache + "/LICENSE" : retained + "/LICENSE", "utf8");
if (hash(license) !== summary.licenseSha256) throw Error("Reviewed license hash changed");
if (summary.repository !== repository || summary.treeTruncated || !/Copyright \(c\) 2026 mmrahmanbappi/.test(license) || !/sublicense, and\/or sell/.test(license) || /commons clause|non.?commercial/i.test(license)) throw Error("Collection rights gate failed");
const ownLicense = readFileSync("public/library/LICENSE.txt", "utf8");
const records: object[] = [], inventory: object[] = [];
const structure = new Map<string, string>();
const excluded = new Set(["coming-soon", "error-404", "link-in-bio"]);
function art(seed: string) {
  const n = Number.parseInt(hash(seed).slice(0, 6), 16), hue = n % 360;
  const shapes = Array.from({ length: 7 }, (_, i) => n % 2
    ? `<rect x="${50 + i * 145}" y="${150 + ((n >> i) % 400)}" width="120" height="${180 + i * 25}" rx="${12 + i * 3}" fill="hsl(${(hue + i * 17) % 360} 60% ${35 + i * 6}%)"/>`
    : `<circle cx="${130 + i * 160}" cy="${230 + ((n >> i) % 300)}" r="${55 + i * 12}" fill="hsl(${(hue + i * 23) % 360} 65% ${40 + i * 5}%)" opacity=".8"/>`).join("");
  return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800"><rect width="1280" height="800" fill="hsl(${hue} 25% 12%)"/>${shapes}<path d="M0 700Q450 450 1280 650V800H0" fill="hsl(${hue} 35% 20%)"/></svg>`).toString("base64")}`;
}
for (const sourcePath of summary.htmlFiles as string[]) {
  if (sourcePath.split("/").length !== 3) continue; // Collection navigation is not a template.
  const [kind, slug] = sourcePath.split("/");
  const id = `approved-collection-${slug}`;
  const sourceUrl = `https://github.com/${repository}/blob/${summary.revision}/${sourcePath}`;
  const state = (status: string, reason: string) => inventory.push({ id, repository, revision: summary.revision, path: sourcePath, sourceUrl, status, reason });
  if (excluded.has(slug)) { state("EXCLUDED", "Utility/holding page; does not count as a complete website kit."); continue; }
  const retainedSource = `resources/template-imports/${id}/original/index.html`;
  const input = existsSync(retainedSource) ? retainedSource : cache + "/" + sourcePath;
  if (!existsSync(input)) { state("BLOCKED", "Pinned source has not been downloaded."); continue; }
  const original = readFileSync(input, "utf8");
  if (hash(original) !== summary.sourceSha256[sourcePath]) throw Error("Reviewed source hash changed: " + sourcePath);
  // Only this reviewed dependency-free family is supported. Reject new active dependencies.
  if (/<script\b[^>]*\bsrc\s*=|<(?:iframe|object|embed|video|audio)\b|\b(?:fetch|eval|importScripts)\s*\(|XMLHttpRequest|document\.write|@import\b/i.test(original)) { state("UNVERIFIED", "Active dependency or embed needs separate review."); continue; }
  const css = [...original.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join("\n");
  if (!css || !/<main\b|<section\b/i.test(original)) { state("EXCLUDED", "No complete styled content layout."); continue; }
  const signature = hash(css.replace(/#[a-f0-9]{3,8}\b/gi, "COLOR").replace(/\s+/g, ""));
  if (structure.has(signature)) { state("DUPLICATE", "Identical CSS layout to " + structure.get(signature)); continue; }
  structure.set(signature, id);
  const evidence = `https://raw.githubusercontent.com/${repository}/${summary.revision}/LICENSE`;
  const checksums = { "index.html": hash(original), LICENSE: hash(license) };
  const sourceDigest = hash(JSON.stringify(checksums));
  const adaptations = ["Original single-file HTML/CSS/inline JavaScript retained separately with creator MIT notice.", "Stock photography, external fonts, favicons, metadata and remote services are excluded from the runnable edition; original HTML references are preserved as text only.", "Original MigBits geometric demo artwork and motion controls are separate adaptations. Forms and checkout are frontend demonstrations, not backend services.", "No React conversion is claimed. System font fallback changes the upstream typography. Render validation is not a complete accessibility audit.", "Mobile grid minimum widths and word wrapping are corrected for community-center and nonprofit-charity. Dynamic photo references and initially empty image viewers use original artwork.", "The original download-promotion toolbar is removed from runnable pages; creator attribution and complete copyright notices remain. Photo credit labels reflect the replacement MigBits artwork."];
  const review = { id, status: "APPROVED", repository, revision: summary.revision, license: "MIT", author: "mmrahmanbappi", evidence, checksums, sourceDigest, dependencies: [], excludedAssets: ["Unsplash photographs", "Google Fonts downloads", "Upstream screenshot/branding files"], adaptations };
  const folder = `resources/template-imports/${id}`;
  save(folder + "/original/index.html", original); save(folder + "/original/LICENSE", license); json(folder + "/review.json", review);
  let html = original
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, "")
    .replace(/<div\b[^>]*id=["']template-bar["'][^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/Photos:\s*<a\b[^>]*>Unsplash<\/a>/gi, "Geometric artwork: MigBits")
    .replace(/<meta\b[^>]*(?:property=|name=["'](?:twitter:|robots))[^>]*>/gi, "")
    .replace(/\s(?:srcset|poster)=["'][^"']*["']/gi, "")
    .replace(/<img\b[^>]*>/gi, tag => ( /\bsrc=/.test(tag) ? tag.replace(/\bsrc=["']([^"']*)["']/i, (_m, url) => `src="${art(id + url)}"`) : tag.replace(/<img/i, `<img src="${art(id)}"`) ).replace(/\balt=["'][^"']*["']/i, 'alt="Original MigBits geometric demo artwork"').replace(/\bloading=["']lazy["']/gi, 'loading="eager"'))
    .replace(/https:\/\/images\.unsplash\.com\/[^"'`\s<>\\)]+/gi, url => art(id + url))
    .replace(/url\(\s*(['"]?)(?!data:)([^)'"\s]+)\1\s*\)/gi, (_m, _q, url) => `url("${art(id + url)}")`)
    .replace(/\saction=["'][^"']*["']/gi, 'action="#"')
    .replace(/<body\b/i, '<body data-mb-template-edition data-preview-state="loading"');
  const safety = `<meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data:;connect-src 'none';font-src 'none';form-action 'none';base-uri 'none'">`;
  const motionJs = templateMotionJs.replace("header .container,section .row,article,.card,.portfolio-item", "main>section,header .wrap,article,.card");
  const mobileFix = ["community-center", "nonprofit-charity"].includes(slug) ? "@media(max-width:760px){.wrap>*{min-width:0}h1,h2{overflow-wrap:anywhere}.imp{grid-template-columns:1fr!important}}" : "";
  html = html.replace(/<head\b[^>]*>/i, "$&" + safety).replace(/<\/head>/i, `<style>${templateMotionCss}${mobileFix}</style></head>`).replace(/<\/body>/i, `<script>${motionJs.replace(/<\/script/gi, "<\\/script")}</script></body>`);
  const title = slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const previewUrl = `/library/approved/sites/${id}/index.html`, downloadUrl = `/library/approved/downloads/${id}.zip`, dataUrl = `/library/approved/data/${id}.json`, licenseUrl = `/library/approved/notices/${id}.txt`;
  const usage = ["Extract the ZIP and open index.html. No build, npm dependencies or remote CDN is required.", "The upstream/ folder preserves original source with its MIT notice. Root index.html is the separately documented MigBits adaptation.", "Replace fictional sample business content, connect your own backend and retain the included license notices. Forms, data and payments are demonstrations.", "Use Pause motion or your operating system reduced-motion preference. Full production and accessibility review remains your responsibility."];
  const files: Record<string, string> = { "index.html": html, "upstream/index.html": original, "upstream/LICENSE": license, LICENSE: license, "MIGBITS-ADAPTATION-LICENSE": ownLicense, "MIGBITS-MODIFICATIONS.json": JSON.stringify(review, null, 2), "README-MIGBITS.md": `# ${title}\n\nCreator: mmrahmanbappi\nSource: ${sourceUrl}\n\n${usage.join("\n\n")}\n\n${adaptations.join("\n\n")}` };
  save("public" + previewUrl, html); save("public" + licenseUrl, license + "\n\n" + ownLicense);
  save("public" + downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([p, c]) => [p, strToU8(c)])), { level: 6, mtime: new Date("2026-01-01") }));
  json("public" + dataUrl, { files: Object.entries(files).map(([path, content]) => ({ path, content, sha256: hash(content) })), installation: usage, resource: { revision: summary.revision, dependencies: ["Native browser APIs; no package dependencies"] } });
  records.push({ id, name: title, description: `${title} single-page ${kind.replaceAll("-", " ")} kit by mmrahmanbappi. Native motion edition with original geometric artwork; source and adaptations kept separate.`, category: "templates", author: "mmrahmanbappi", license: "MIT", tags: [kind, "HTML", "CSS", "JavaScript", "Native motion", "Animated", "Reduced motion", "Full template"], format: "HTML · CSS · JavaScript", previewType: "template", previewUrl, image: `/library/approved/thumbnails/${id}.png`, downloadUrl, dataUrl, sourceUrl, licenseUrl, revision: summary.revision, featured: 650, template: { kind: kind.replaceAll("-", " "), pages: 1, motion: true, motionEngine: "Native browser APIs", original: false }, usage, review: { status: "APPROVED", sourceDigest, evidence, notices: ["LICENSE", "MIGBITS-ADAPTATION-LICENSE"], preview: "pending", checkedAt: "" } });
  state("IMPORTED_PENDING_VALIDATION", "Pinned MIT HTML/CSS/inline scripts, no redistributed third-party binaries; browser gate required.");
}
json("catalog/template-research/collection-items.json", inventory);
json("catalog/template-research/collection-import-candidates.json", records);
console.log(JSON.stringify({ candidates: records.length, inventory: inventory.length, excluded: inventory.filter((i) => (i as {status:string}).status === "EXCLUDED").length }));
