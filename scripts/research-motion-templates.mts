/** Read-only discovery. Repository search and SPDX metadata never authorize publication. */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const directory = "catalog/template-research";
mkdirSync(directory, { recursive: true });
mkdirSync("tmp/template-research", { recursive: true });
const write = (file: string, value: unknown) => {
  const content = JSON.stringify(value, null, 2) + "\n";
  for (let attempt = 0; ; attempt++) {
    try { writeFileSync(file, content); return; }
    catch (error) {
      // Synced Windows folders can briefly lock a progress file.
      if (attempt >= 9 || !["EBUSY", "EPERM", "EACCES", "UNKNOWN"].includes((error as NodeJS.ErrnoException).code || "")) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
};
function api(args: string[]) {
  const response = spawnSync("gh", ["api", ...args], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  if (response.status !== 0) throw Error(response.stderr);
  return JSON.parse(response.stdout);
}
interface Candidate {
  repository: string; url: string; owner: string; branch?: string; stars?: number; topics: string[];
  discovery: string[]; spdxHint: string | null; status: string; reason: string; imported: boolean;
  revision?: string; licenseFile?: string; licenseURL?: string; codeLicenseVerified?: boolean;
  licenseSha256?: string;
  public?: boolean;
  motion: string; templateScope: string;
}
const file = path.join(directory, "candidates.json");
const candidates = new Map<string, Candidate>((existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) as Candidate[] : []).map(row => [row.repository.toLowerCase(), row]));
const queries = [
  "template motion in:readme language:TypeScript license:mit fork:false archived:false stars:>100",
  "template motion in:readme language:TypeScript license:mit fork:false archived:false stars:6..100",
  "animated template license:mit fork:false archived:false",
  "landing-page template animation in:readme license:mit fork:false archived:false stars:>5",
];
const manifest = [];
if (!process.argv.includes("--licenses-only") && !process.argv.includes("--verify-visibility")) for (const query of queries) {
  let fetched = 0, total = 0;
  for (let page = 1; page <= 10; page++) {
    const response = api(["search/repositories", "-X", "GET", "-f", `q=${query}`, "-f", "per_page=100", "-f", `page=${page}`, "-f", "sort=stars", "-f", "order=desc"]);
    total = response.total_count;
    for (const item of response.items) {
      if (item.private !== false) continue;
      const key = item.full_name.toLowerCase();
      const old = candidates.get(key);
      if (old) { if (!old.discovery.includes(query)) old.discovery.push(query); continue; }
      candidates.set(key, { repository: item.full_name, public: true, url: item.html_url, owner: item.owner.login, branch: item.default_branch, stars: item.stargazers_count, topics: item.topics, spdxHint: item.license?.spdx_id || null, discovery: [query], status: "UNVERIFIED", reason: "Search candidate only. Verify creator, actual license, complete-template scope, animation, dependency/artwork rights, uniqueness and isolated build before import.", imported: false, motion: "unverified", templateScope: "unverified" });
    }
    fetched += response.items.length;
    write(file, [...candidates.values()]);
    console.log(`Discovery page ${page}: ${candidates.size} distinct repositories; ${fetched}/${total} query results`);
    if (response.items.length < 100 || fetched >= total) break;
  }
  manifest.push({ query, total, fetched, capped: fetched < total });
}
if (manifest.length) write(path.join(directory, "search-manifest.json"), { checkedAt: new Date().toISOString(), source: "https://docs.github.com/en/rest/search/search#search-repositories", queries: manifest, warning: "Candidate repositories are not counts of complete, animated, redistributable templates. GitHub search is bounded and changes over time." });
if (process.argv.includes("--verify-license-files") || process.argv.includes("--licenses-only")) {
  const pending = [...candidates.values()].filter(row => !row.revision);
  for (let offset = 0; offset < pending.length; offset += 20) {
    const batch = pending.slice(offset, offset + 20);
    const fragments = batch.map((row, i) => {
      const [owner, name] = row.repository.split("/");
      return `r${i}:repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name)}){defaultBranchRef{target{...on Commit{oid}}} a:object(expression:"HEAD:LICENSE"){...on Blob{text}} b:object(expression:"HEAD:LICENSE.md"){...on Blob{text}} c:object(expression:"HEAD:LICENSE.txt"){...on Blob{text}} d:object(expression:"HEAD:license"){...on Blob{text}}}`;
    });
    const result = api(["graphql", "-f", `query={${fragments.join("\n")}}`]);
    for (const [index, row] of batch.entries()) {
      const evidence = result.data[`r${index}`];
      if (!evidence) { row.reason = "Repository inaccessible during source verification; no import."; continue; }
      row.revision = evidence.defaultBranchRef?.target?.oid;
      const match = [["LICENSE", evidence.a], ["LICENSE.md", evidence.b], ["LICENSE.txt", evidence.c], ["license", evidence.d]].find(([, object]) => object?.text);
      const text = match?.[1]?.text || "";
      row.licenseFile = match?.[0];
      row.licenseURL = match ? `${row.url}/blob/${row.revision}/${row.licenseFile}` : undefined;
      row.codeLicenseVerified = /Permission is hereby granted, free of charge/i.test(text) && /sublicense,? and\/or sell/i.test(text) && /copyright notice and this permission notice/i.test(text) && !/commons clause|non.?commercial|may not (?:sell|resell|redistribute)|not allowed to (?:sell|resell|redistribute)|no redistribution/i.test(text);
      row.reason = row.codeLicenseVerified ? "Actual pinned license contains the MIT grant. Still UNVERIFIED for publication: creator provenance, dependency/artwork scope, complete-template and motion verification remain required." : "Missing, custom or noncanonical primary license; manual review required. No import.";
      write(`tmp/template-research/${row.repository.replaceAll("/", "--")}-license.json`, { repository: row.repository, revision: row.revision, path: row.licenseFile, text });
    }
    write(file, [...candidates.values()]);
    console.log(`License-file pass: ${Math.min(offset + batch.length, pending.length)}/${pending.length}`);
  }
}
if (process.argv.includes("--verify-visibility")) {
  const rows = [...candidates.values()].filter(row => row.public !== true);
  for (let offset = 0; offset < rows.length; offset += 40) {
    const batch = rows.slice(offset, offset + 40);
    const query = batch.map((row, index) => { const [owner, name] = row.repository.split("/"); return `r${index}:repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name)}){isPrivate}`; });
    const result = api(["graphql", "-f", `query={${query.join("\n")}}`]);
    for (const [index, row] of batch.entries()) {
      if (!result.data[`r${index}`] || result.data[`r${index}`].isPrivate) candidates.delete(row.repository.toLowerCase());
      else row.public = true;
    }
    write(file, [...candidates.values()]);
    console.log(`Public visibility verified: ${Math.min(offset + 40, rows.length)}/${rows.length}`);
  }
}
if (existsSync("catalog/approved-templates.json")) {
  const imported = JSON.parse(readFileSync("catalog/approved-templates.json", "utf8"));
  for (const item of imported) {
    const review = JSON.parse(readFileSync(`resources/template-imports/${item.id}/review.json`, "utf8"));
    const old = candidates.get(review.repository.toLowerCase());
    candidates.set(review.repository.toLowerCase(), { ...old, repository: review.repository, public: true, url: `https://github.com/${review.repository}`, owner: review.repository.split("/")[0], topics: old?.topics || ["website-template"], spdxHint: "MIT", discovery: old?.discovery || ["Official creator repository; individual scope review"], status: "IMPORTED_VALIDATED", reason: "Exact author source and Bootstrap CSS licenses retained. Original photographs/fonts/vendor assets excluded; separately attributed native-motion and original-artwork adaptation passed isolated page checks.", imported: true, revision: review.revision, licenseFile: "LICENSE", licenseURL: review.evidence, licenseSha256: review.checksums.LICENSE, codeLicenseVerified: true, motion: "Native MigBits adaptation verified; upstream code preserved separately", templateScope: `Complete template kit, ${item.template.pages} pages` });
  }
}
const rows = [...candidates.values()];
for (const row of rows) {
  const snapshot = `tmp/template-research/${row.repository.replaceAll("/", "--")}-license.json`;
  if (existsSync(snapshot)) {
    const evidence = JSON.parse(readFileSync(snapshot, "utf8"));
    if (evidence.text) row.licenseSha256 = createHash("sha256").update(evidence.text).digest("hex");
  }
}
write(file, rows);
const gallery = existsSync("catalog/library/resources.json") ? JSON.parse(readFileSync("catalog/library/resources.json", "utf8")) as { category: string; template?: { pages: number } }[] : [];
const templates = gallery.filter(item => item.category === "templates");
write(path.join(directory, "progress.json"), { checkedAt: new Date().toISOString(), targetPublishedTemplates: 1000, targetUnit: "Complete template kits; individual pages and source repositories do not count as extra templates", discoveredRepositories: rows.length, licenseFilesWithMitGrant: rows.filter(row => row.codeLicenseVerified).length, importedFromThisResearch: rows.filter(row => row.imported).length, galleryTemplateCount: templates.length, includedPages: templates.reduce((total, item) => total + (item.template?.pages || 1), 0), remainingToTarget: Math.max(0, 1000 - templates.length), pendingVerification: rows.filter(row => row.status === "UNVERIFIED").length, source: "GitHub official search/API plus individually reviewed creator repositories; pagination recorded separately", coverage: "Research candidates only. No claim that these are 1,000 distinct complete animated templates. No candidate is published automatically." });
