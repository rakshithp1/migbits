import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { ImportedResource } from "../lib/import-catalog";
import type { ImportSourceStatus, ImportPreviewStatus } from "../lib/import-status";

const index: ImportedResource[] = JSON.parse(readFileSync("catalog/import-index.json", "utf8"));
const report: { reviewedAt: string; sources: ImportSourceStatus[] } = JSON.parse(readFileSync("catalog/import-report.json", "utf8"));
const previews: ImportPreviewStatus[] = JSON.parse(readFileSync("catalog/import-previews.json", "utf8"));
if (existsSync("catalog/rights-cleanup.json")) {
  const cleanup = JSON.parse(readFileSync("catalog/rights-cleanup.json", "utf8"));
  const rows = report.sources.map(source => `| ${source.id} | ${source.discovered ?? "Unknown"} | ${source.imported || 0} | ${source.removed || 0} | ${source.status}: ${source.reason.replace(/\|/g, "/")} |`);
  writeFileSync("docs/IMPORT-REPORT.md", [
    "# Current distribution after rights cleanup", "",
    `Reviewed ${cleanup.reviewedAt}. ${index.length} source-checked records remain; ${cleanup.removed.length} records and their generated public files were removed.`, "",
    "React Bits Blur Text and Spotlight Card were removed from the homepage and source tree. Broad source mirrors, scene/runtime packs, brand artwork and unreviewed media are no longer distributed. No third-party Figma kits are imported. Required notices remain with retained MIT source.", "",
    "## Source reconciliation", "",
    "Discovered totals describe the earlier pinned inventory. Removed records are historical discoveries, not current downloads. Retained resources are not all runtime or accessibility validated.", "",
    "| Source | Previously discovered | Retained | Removed | Status / reason |",
    "| --- | ---: | ---: | ---: | --- |", ...rows, "",
    "## Resuming imports", "",
    "The importer is paused while catalog/rights-cleanup.json exists. Explicit source and asset rights review is required before changing that policy. The item-level removal audit is preserved there; catalog/import-progress retains historical discovery evidence.", "",
    "The public branch history was replaced with a clean root snapshot after cleanup. GitHub-managed caches and previously downloaded external copies are outside repository history control. Previous build and deployment evidence in catalog/import-validation.json predates this cleanup unless explicitly marked otherwise.", "",
  ].join("\n"));
  console.log(`Wrote current rights report for ${index.length} retained entries.`);
  process.exit(0);
}
const table = ["| Source | Discovered in pinned scope | Imported, not fully runtime validated | Fully runtime validated | Duplicates | Status / reason |", "| --- | ---: | ---: | ---: | ---: | --- |"];
for (const source of report.sources.filter(item => !item.id.startsWith("ui-guideline-"))) {
  if (source.id === "ui-guideline") {
    const children = report.sources.filter(item => item.id.startsWith("ui-guideline-"));
    table.push(`| uiguideline.com | ${children.length} linked systems | ${children.reduce((n, s) => n + (s.imported || 0), 0)} source collections | 0 | 0 | See per-system table below; collections contain source trees, not individually validated components. |`);
  } else table.push(`| ${source.requested} | ${source.discovered ?? "Unknown"} | ${source.imported || 0} | 0 | ${source.duplicates || 0} | ${source.status}: ${source.reason.replace(/\|/g, "/")} |`);
}
const linked = report.sources.filter(item => item.id.startsWith("ui-guideline-")).map(item => `| ${item.id.replace("ui-guideline-", "")} | ${item.imported || 0} | ${item.status} | ${item.reason.replace(/\|/g, "/")} |`);
const categories = [...new Set(index.map(item => item.category))].sort();
const bencho = JSON.parse(readFileSync("catalog/upstream/bencho.json", "utf8"));
const text = `# Resumable source import report

Reviewed ${report.reviewedAt}. Target project: migbits.com. Work is local unless a separate deployment is recorded.

## Current result

${index.length.toLocaleString("en-US")} imported catalog entries in ${categories.length} categories. Entries include components, development examples, reference blocks, shader definitions, design records, guides and complete source collections. They are **not ${index.length} individually working UI components**.

Browse \`/open-source/imports\` for server-rendered search, collection/category filters and pagination. Detail pages include original source viewing, code copying, dependencies, usage notes, attribution, revision evidence, ZIP downloads and available sandbox previews. The existing 65-component shadcn gallery, six-component Motion Primitives playground and icon explorer remain intact.

All imported entries have pinned provenance and file integrity records. ${previews.filter(item => ["compiled", "render-checked", "runtime-error"].includes(item.status)).length} previews compile; compilation is not a runtime or accessibility audit. ${previews.filter(item => item.status === "render-checked").length} previews passed a browser render check with reduced motion. This does not establish complete keyboard or accessibility coverage. There is no claim that the entire web catalog of any source is exhausted.

## Requested sources

${table.join("\n")}

An unknown discovered total is not zero, and an excluded source is not counted as imported. The total for a repository adapter describes its **defined pinned scope**. UI UX Pro Max counts individual reference data rows; Motion counts public React development examples; Magic UI counts every registry record, including examples, style and utility entries; ThreeUI counts package exports, preserving variants in source rather than multiplying every variant into an entry. Bencho imports all ${bencho.freeIds.length} IDs from its pinned free list; Pro source is excluded and not requested. Its snapshot includes public payload/license hashes.

## UI Guideline's linked systems

These are repository text-source collections. A collection is one entry with its original source tree in the support ZIP, not a count of every component in that library. The published directory's 20 systems were reconciled against individual upstream repositories and rights.

| Linked system | Collections imported | Status | Scope / reason |
| --- | ---: | --- | --- |
${linked.join("\n")}

## Categories

${categories.map(value => `- ${value}: ${index.filter(item => item.category === value).length}`).join("\n")}

## Repeatable workflow

\`\`\`sh
npm run import:open-source
npm run import:open-source -- --source=magic-ui
npm run import:open-source -- --source-prefix=ui-guideline-
node scripts/prepare-import-preview-runtime.mjs
npx tsx scripts/build-import-previews.ts
npx tsx scripts/report-imports.ts
\`\`\`

- \`catalog/import-sources.json\` is the reviewed source configuration, including original/corrected domains, pinned commits and blockers.
- \`catalog/import-progress/\` stores item-level results, archive/license hashes and duplicate decisions. IDs and output paths are deterministic. Reruns resume from cached archives and replace existing entries instead of duplicating them.
- \`catalog/import-index.json\` contains searchable metadata. Original source content is loaded on demand from \`public/imported/\`, keeping it outside the application JavaScript graph.
- Each source has attributed resource ZIPs and a complete support pack. Large support packs are split into parts below the static hosting file limit; extract every part into one folder. No remote source is imported into the server runtime.
- \`catalog/upstream/bencho.zip\` contains only the original source handed out for free blocks, with its MIT notice. The snapshot tool parses literals without evaluating downloaded JavaScript. It needs a fresh rendered official license capture before updating a snapshot. Pro source is never requested.
- Preview-only adaptations include a local class-name utility in place of Magic UI's site/server utilities, a minimal mounting/error boundary, local font fallbacks, and a reduced-motion override. Original source downloads remain unchanged. Frames use an opaque sandbox with scripts allowed, no same-origin grant, no backend/network access and no top-level navigation permission. External media and remote fonts are unavailable in previews.
- Preview dependencies are installed into the ignored \`tmp/import-preview-runtime\` workspace, not the site's dependency tree. Only the build tooling adds direct Tailwind compiler dependencies to this project.
- Inspo's official MCP documentation was reviewed. Its public repository supplied the canonical reference components directly, so no account-wide MCP configuration was needed. Captured third-party screenshots and production-site markup are excluded from the MIT source import.

## Completeness and validation boundaries

This is a reproducible import of the enumerated scopes, not a claim of exhaustive coverage of every website, marketplace submission, paid product or linked external resource. Unclear rights, unresolved domains, unpublished/protected source and per-item licensing remain external blockers. Ballmacui.com could not be reached or reliably corrected. No proprietary content is represented as open source.

Development examples can exercise unpublished APIs, require dependency workspaces or use placeholder assets. Shader definitions depend on their engine and WebGPU support. Spline wrappers do not grant rights to runtime binaries or community scenes. Library source collections need separate consumer builds. Imported entries retain those limitations rather than being labeled ready for production.

Verification commands and browser results are recorded in the implementation summary after the final pass. Do not replace source-check labels with runtime-validated labels merely because TypeScript parsing or a page build passes.
`;
const evidence = existsSync("catalog/import-validation.json") ? JSON.parse(readFileSync("catalog/import-validation.json", "utf8")) : null;
const verification = evidence ? [
  "", "## Verification and deployment", "",
  `Published to ${evidence.productionUrl} on ${evidence.reviewedAt}.`, "",
  `- Production version: ${evidence.deploymentVersion}. Previous version retained for rollback: ${evidence.previousDeploymentVersion}.`,
  `- ${evidence.unitTestsPassed} unit tests, lint, type checks, Next.js production build and Cloudflare adapter build passed.`,
  `- ${evidence.localNextBrowserTestsPassed} Next.js browser tests and ${evidence.localWorkersBrowserTestsPassed} local Workers browser tests passed.`,
  `- ${evidence.liveBrowserTestsPassed} live browser tests and ${evidence.liveHostingCheckGroupsPassed} hosting check groups passed against the custom domain.`,
  `- ${evidence.previewRenderChecksPassed} isolated examples passed basic browser render checks with reduced motion; original source and broader integration checks remain separate.`,
  `- Worker dry run passed at ${evidence.workerGzipKiB} KiB compressed. Imported files and split support archives passed the static file size check.`,
  `- Build environment workaround: ${evidence.buildWorkaround}`, "",
  "Detailed machine-readable evidence is in catalog/import-validation.json. No feedback report was submitted automatically.", "",
].join("\n") : "";
writeFileSync("docs/IMPORT-REPORT.md", text + verification);
console.log(`Wrote report for ${index.length} entries and ${report.sources.length} inventory sources.`);
