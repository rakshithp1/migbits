import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import ts from "typescript";
import type { ImportedFile, ImportedPayload, ImportedResource } from "../lib/import-catalog";

interface Source {
  id: string; website: string; requested: string; status: string; reason: string; evidence: string;
  repo?: string; revision?: string; license?: string; adapter?: string;
  snapshot?: string;
  archiveUrl?: string; repositoryUrl?: string;
}
interface Candidate {
  key: string; name: string; category: string; framework: string; description: string;
  paths: string[]; record?: Record<string, string>; dependencies?: string[];
  registryDependencies?: string[]; installation?: string[];
}
const sources: Source[] = JSON.parse(readFileSync("catalog/import-sources.json", "utf8"));
const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const title = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/\b\w/g, s => s.toUpperCase());
function splitSupport(entries: Record<string, Uint8Array>, common: Record<string, Uint8Array>) {
  const chunks: Uint8Array[] = [];
  const pack = (keys: string[]) => {
    const bytes = zipSync({ ...common, ...Object.fromEntries(keys.map(key => [key, entries[key]])) }, { level: 6, mtime: new Date("2026-01-01T00:00:00Z") });
    if (bytes.length <= 24_000_000) chunks.push(bytes);
    else if (keys.length > 1) { const middle = Math.ceil(keys.length / 2); pack(keys.slice(0, middle)); pack(keys.slice(middle)); }
    else throw new Error("A support asset exceeds the static hosting size limit");
  };
  pack(Object.keys(entries).filter(key => !(key in common)).sort());
  return chunks;
}
function save(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2) + "\n");
  // Windows sync/indexing processes can briefly hold the destination open.
  // Keep the old complete file visible until an atomic replacement succeeds.
  for (let attempt = 0; ; attempt++) {
    try { renameSync(`${file}.tmp`, file); break; }
    catch (error) {
      if (attempt >= 20 || !["EPERM", "EBUSY", "EACCES"].includes((error as NodeJS.ErrnoException).code || "")) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
async function download(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000), headers: { "User-Agent": "Migbits-source-importer" } });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === "," && !quoted) { row.push(field); field = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift()?.map(h => h.replace(/^\uFEFF/, "")) ?? [];
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error("CSV column count mismatch");
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  });
}
function candidatesFor(source: Source, files: Map<string, string>): Candidate[] {
  if (source.adapter === "library-collection") {
    const manifest = files.has("package.json") ? JSON.parse(files.get("package.json")!) : {};
    const paths = ["package.json", "README.md", "src/index.ts", "src/index.tsx", "index.ts"].filter(p => files.has(p));
    return [{ key: "source-collection", name: `${title(source.id.replace("ui-guideline-", ""))} / Source collection`, category: "Design systems", framework: "See upstream package manifests", description: `Complete text source snapshot for ${source.repo}. Browse the original project manifest and download the supporting source collection.`, paths,
      record: { "Source files in support pack": String(files.size), "Repository": source.repositoryUrl || `https://github.com/${source.repo}`, "Package": manifest.name || source.repo!, "Upstream revision": source.revision!, "Scope": "Repository text source. Binary assets and fonts are not included. Individual components have not been independently runtime-validated." },
      dependencies: Object.keys(manifest.peerDependencies || {}), installation: ["Download the support pack to obtain the collection's original source tree and notices. Use the original README and package manifests to build in a separate environment; this is a collection snapshot, not an individually installable component.", "Binary media, fonts and branding assets are outside this text-source pack. Obtain any required assets under their own licenses. Check package-specific licensing and current framework compatibility before consuming a package."],
    }];
  }
  if (source.adapter === "bencho-free") {
    const manifest = JSON.parse(files.get("manifest.json")!);
    return manifest.items.map((item: { id: string; name: string; dependencies: string[]; tokens: string[]; stubs: string[] }) => ({
      key: item.id, name: title(item.name), category: "Interactive components", framework: "React · TypeScript · CSS", description: `Original MIT free-plan Bencho block: ${title(item.name)}.`,
      paths: [`src/blocks/${item.id}.tsx`, `src/blocks/${item.id}.css`], dependencies: item.dependencies,
      record: { "CSS tokens to map": item.tokens.join(", "), "Asset placeholders": item.stubs.join(", ") || "None recorded", "Snapshot payload": manifest.bundleUrl },
      installation: ["Copy TSX and CSS together, install the listed dependencies in your consuming project, and map the recorded CSS tokens to your own theme. Preserve the MIT source notice.", "Replace the documented image stubs with assets you may use. The Bencho photographs, Pro implementations, site interface and brand are not part of this source pack."],
    }));
  }
  if (source.adapter === "threeui-community") {
    return [...files.keys()].filter(p => /^src\/package-components\/[^/]+\.ts$/.test(p)).map(p => {
      const target = /from\s+["']([^"']+)["']/.exec(files.get(p)!)?.[1];
      const resolved = target ? path.posix.normalize(`${path.posix.dirname(p)}/${target}`) : "";
      const implementation = [resolved, `${resolved}.tsx`, `${resolved}.ts`].find(value => files.has(value));
      return { key: path.basename(p, ".ts"), name: title(path.basename(p, ".ts")), category: "3D components & scenes", framework: "React · Three.js · WebGL · CSS", description: `Original ThreeUI Community component: ${title(path.basename(p, ".ts"))}.`,
        paths: [p, ...(implementation ? [implementation] : [])], dependencies: ["@designcodeio/threeui", "react", "react-dom"],
        installation: ["Use the official @designcodeio/threeui package and its style.css, or build the complete Community support pack. Package wrappers depend on renderer source and assets; they are not standalone snippets.", "The support pack includes the public Community code and its bundled MIT/OFL assets with original notices. Remote catalog media, Pro and Beta resources are not included. Verify device support and reduced motion."],
      };
    });
  }
  if (source.adapter === "spline-wrapper") {
    return [...files.keys()].filter(p => /^src\/.*\.[jt]sx?$/.test(p)).map(p => ({
      key: p.replace(/\.[jt]sx?$/, ""), name: `Spline / ${title(path.basename(p).replace(/\.[jt]sx?$/, ""))}`,
      category: "3D integrations", framework: "React · Next.js · TypeScript", description: `Original Spline integration source: ${p}.`, paths: [p],
      dependencies: ["@splinetool/react-spline", "@splinetool/runtime"], installation: ["Use the official @splinetool/react-spline package and its README in the support pack. The runtime has its own license and must be obtained separately.", "Supply a scene you own or have permission to use. No community scene or runtime binary is included. Lazy-load 3D content and provide a reduced-motion fallback."],
    }));
  }
  if (source.adapter === "motion-examples") {
    return [...files.keys()].filter(p => /^dev\/react\/src\/examples\/.*\.tsx$/.test(p)).map(p => ({
      key: p.slice("dev/react/src/examples/".length).replace(/\.tsx$/, ""), name: title(path.basename(p, ".tsx")), category: "Motion examples", framework: "React · TypeScript · Motion",
      description: `Original Motion development example: ${path.basename(p, ".tsx")}. Some examples exercise development-only APIs or regression cases.`, paths: [p], dependencies: ["react", "motion"],
      installation: ["Inspect imports before using this upstream development example. Stable public APIs can use the motion package; development-only APIs may require building the pinned upstream workspace.", "Supporting examples, package manifests and engine source are in the support pack. Third-party images and assets are not included. Validate keyboard, touch and reduced-motion behavior."],
    }));
  }
  if (source.adapter === "registry") {
    const registry = JSON.parse(files.get("apps/www/registry.json")!);
    return registry.items.map((item: { name: string; title?: string; description?: string; type: string; dependencies?: string[]; registryDependencies?: string[]; files: { path: string }[] }) => ({
      key: item.name, name: item.title || title(item.name),
      category: item.type === "registry:example" ? "Examples" : /background|pattern|particles|globe|meteors|retro-grid|ripple/.test(item.name) ? "Backgrounds & effects" : /text|word|typewriter|number/.test(item.name) ? "Typography & text" : item.type === "registry:lib" || item.type === "registry:style" ? "Utilities & styles" : "Components",
      framework: "React · TypeScript · Tailwind", description: item.description || `${title(item.name)} from Magic UI's public registry.`,
      paths: [...item.files.map(file => `apps/www/${file.path}`), ...(files.has(`apps/www/public/r/${item.name}.json`) ? [`apps/www/public/r/${item.name}.json`] : [])],
      record: { "Registry definition": JSON.stringify(item, null, 2) }, dependencies: item.dependencies, registryDependencies: item.registryDependencies,
      installation: [`Use the included registry definition with the shadcn CLI in a separate React/Tailwind project.`, `Resolve registryDependencies and apply css/cssVars from the definition. Media URLs in upstream demos are references; external media is not redistributed.`],
    }));
  }
  if (source.adapter === "shaders") {
    return [...files.keys()].filter(p => /^packages\/core\/src\/shaders\/[^/]+\/index\.ts$/.test(p)).map(p => ({
      key: p.split("/").at(-2)!, name: title(p.split("/").at(-2)!), category: "Shaders & graphics", framework: "WebGPU · React · Vue · Svelte · Solid · JavaScript",
      description: `${title(p.split("/").at(-2)!)} shader definition from the open-source Shaders engine.`, paths: [p],
      dependencies: ["shaders-core", "shaders/react"], installation: ["Use the upstream Shaders framework package and its documented component exports. The definition relies on the engine and is not a standalone React component.", "Supporting engine source and all framework package manifests are in the collection support pack. WebGPU device support is required; provide a static fallback and respect reduced motion."],
    }));
  }
  if (source.adapter === "reference-components") {
    const manifest = JSON.parse(files.get("packages/db/src/reference-components.json")!);
    return manifest.map((item: { id: string; type: string; label: string; note: string; macro: string }) => ({
      key: `${item.type}-${item.id}`, name: `${title(item.type)} / ${item.label}`, category: "Blocks & sections", framework: "React · TypeScript · Tailwind",
      description: item.note, paths: [`apps/web/src/components/reference/${item.type}/${item.id}.tsx`],
      record: { Pattern: item.macro, Type: item.type }, dependencies: ["react", "tailwindcss"],
      installation: ["Copy the original JSX into a React/Tailwind project. Inspect the original imports and CSS variables before use. The support pack includes reference styles and package manifests.", "Replace placeholder links and demonstration content. Runtime, keyboard, contrast and reduced-motion checks remain specific to your integration."],
    }));
  }
  if (source.adapter === "design-data") {
    return [...files.keys()].filter(p => /^src\/ui-ux-pro-max\/data\/.*\.csv$/.test(p)).flatMap(p => {
      const base = path.basename(p, ".csv");
      const category = /color/.test(base) ? "Colors & palettes" : /typography|font/.test(base) ? "Typography & text" : /motion/.test(base) ? "Motion guidance" : /icon/.test(base) ? "Icon guidance" : /landing/.test(base) ? "Layouts & patterns" : /chart/.test(base) ? "Data visualization" : "Design guidance";
      return parseCsv(files.get(p)!).map((record, i) => {
        const meaningful = Object.entries(record).filter(([k, v]) => v && !/^(no\.?|id|#|index)$/i.test(k));
        return { key: `${p.slice("src/ui-ux-pro-max/data/".length).replace(/\.csv$/, "")}-${i + 1}`, name: `${title(base)} / ${meaningful[0]?.[1] || i + 1}`.slice(0, 160), category,
          framework: /\/stacks\//.test(p) ? title(base) : "Framework independent", description: meaningful.slice(1, 3).map(([k, v]) => `${k}: ${v}`).join(" · ").slice(0, 380),
          paths: [], record: { "Original dataset": p, "Data row": String(i + 1), ...record },
          installation: ["This is a design reference record, not executable component code. Use its guidance and verify it against your project's current framework documentation.", "Font and icon names are references; their binaries and external assets are not included or relicensed."],
        };
      });
    });
  }
  if (source.adapter === "design-guides") {
    return [...files.keys()].filter(p => /^\.agents\/skills\/impeccable\/reference\/.*\.md$/.test(p)).map(p => ({
      key: p.slice(".agents/skills/impeccable/reference/".length).replace(/\.md$/, ""), name: title(path.basename(p, ".md")), category: "Design guidance", framework: "Framework independent",
      description: `Original Impeccable design reference: ${title(path.basename(p, ".md"))}.`, paths: [p],
      installation: ["Read as a design reference. This catalog does not install or execute agent skills, commands, or remote binaries."],
    }));
  }
  throw new Error(`No adapter for ${source.id}`);
}

async function main() {
  if (existsSync("catalog/rights-cleanup.json")) {
    console.log("Imports paused by the owner's rights review. Existing reviewed resources are unchanged. Review source and asset rights before explicitly updating the policy and resuming imports.");
    return;
  }
  const index: ImportedResource[] = []; const report: Record<string, unknown>[] = [];
  const selected = process.argv.find(arg => arg.startsWith("--source="))?.split("=")[1];
  const prefix = process.argv.find(arg => arg.startsWith("--source-prefix="))?.split("=")[1];
  const previous: ImportedResource[] = existsSync("catalog/import-index.json") ? JSON.parse(readFileSync("catalog/import-index.json", "utf8")) : [];
  const previousReport: Record<string, unknown>[] = existsSync("catalog/import-report.json") ? JSON.parse(readFileSync("catalog/import-report.json", "utf8")).sources : [];
  for (const source of sources) {
    if ((selected && source.id !== selected) || (prefix && !source.id.startsWith(prefix))) {
      index.push(...previous.filter(item => item.source === source.id));
      const old = previousReport.find(item => item.id === source.id);
      report.push(old ? { ...old, ...source, status: Number(old.imported) > 0 ? old.status : source.status } : { ...source, discovered: null, imported: 0, runtimeValidated: 0, sourceChecked: 0, duplicates: 0, inventoryComplete: false }); continue;
    }
    if ((!source.repo && !source.snapshot) || !source.revision || !source.adapter) { report.push({ ...source, discovered: null, imported: 0, runtimeValidated: 0, sourceChecked: 0, duplicates: 0, inventoryComplete: false }); continue; }
    console.log(`Importing ${source.id} at ${source.revision.slice(0, 8)}`);
    try {
      const cache = `tmp/import-cache/${source.id}-${source.revision}.zip`;
      mkdirSync(path.dirname(cache), { recursive: true });
      if (!existsSync(cache)) writeFileSync(cache, source.snapshot ? readFileSync(source.snapshot) : await download(source.archiveUrl || `https://codeload.github.com/${source.repo}/zip/${source.revision}`));
      const archive = unzipSync(new Uint8Array(readFileSync(cache)), { filter: file => (source.adapter === "threeui-community" || /\.(tsx?|[cm]?jsx?|json|md|mdx|css|scss|sass|less|vue|svelte|csv|txt|ya?ml|toml|wgsl|glsl|html|svg)$|(^|\/)(LICENSE|LICENCE|NOTICE)(\.[^/]*)?$/i.test(file.name)) && file.originalSize < 8_000_000 });
      const textExtensions = /\.(tsx?|[cm]?jsx?|json|md|mdx|css|scss|sass|less|vue|svelte|csv|txt|ya?ml|toml|wgsl|glsl|html|svg)$|(^|\/)(LICENSE|LICENCE|NOTICE)(\.[^/]*)?$/i;
      const rawFiles = new Map(Object.entries(archive).map(([p, bytes]) => [p.slice(p.indexOf("/") + 1), bytes]));
      const files = new Map([...rawFiles].filter(([p]) => textExtensions.test(p)).map(([p, bytes]) => [p, strFromU8(bytes)]));
      const licensePaths = [...files.keys()].filter(p => !p.includes("/") && /^(LICENSE|LICENCE)(\.|$)/i.test(p));
      const licenseText = licensePaths.map(p => {
        const text = files.get(p)!;
        // GitHub archive symlinks are represented as their relative target text.
        const target = path.posix.normalize(text.trim());
        return text.length < 200 && !target.startsWith("../") && files.has(target) ? files.get(target)! : text;
      }).join("\n");
      if (!licenseText || /Commons Clause|NonCommercial|non-commercial|Business Source License|PolyForm/i.test(licenseText) || (source.license === "MIT" && !licenseText.includes("Permission is hereby granted")) || (source.license === "Apache-2.0" && !licenseText.includes("Apache License"))) throw new Error("Root license does not match approved terms");
      const noticePaths = [...files.keys()].filter(p => /(^|\/)(LICENSE|LICENCE|NOTICE)(\.[^/]*)?$|(^|\/)(ASSET-LICENSES|FONT-LICENSES|THIRD_PARTY_NOTICES)\.md$/i.test(p));
      const support = [...files.keys()].filter(p => {
        if (noticePaths.includes(p) || p === "README.md" || /(^|\/)package\.json$/.test(p)) return true;
        if (source.adapter === "registry") return /^apps\/www\/(registry\/|lib\/utils\.|components\/ui\/|hooks\/|config\/|app\/globals\.css|registry\.json)/.test(p);
        if (source.adapter === "shaders") return /^packages\//.test(p) && !/__tests__|\/tests\/|\.snap$/.test(p);
        if (source.adapter === "reference-components") return /^apps\/web\/src\/(components\/reference\/|app\/globals\.css)/.test(p);
        if (source.adapter === "design-data") return /^src\/ui-ux-pro-max\/(data|scripts)\//.test(p);
        if (source.adapter === "spline-wrapper") return /^src\//.test(p);
        if (source.adapter === "motion-examples") return /^(packages\/|dev\/react\/src\/)/.test(p) && !/__tests__|\.test\.|\.spec\./.test(p);
        if (source.adapter === "threeui-community") return /^(src\/|public\/|scripts\/)/.test(p) || /^vite\.|^tsconfig/.test(p);
        if (source.adapter === "bencho-free") return /^src\//.test(p) || p === "manifest.json";
        if (source.adapter === "library-collection") return !/\.svg$/i.test(p) && !/(^|\/)(node_modules|\.github|\.yarn|dist|build|coverage)\//.test(p);
        return /^\.agents\/skills\/impeccable\/reference\//.test(p);
      });
      const supportEntries = Object.fromEntries(support.map(p => [p, strToU8(files.get(p)!)]));
      if (source.adapter === "threeui-community") for (const [p, bytes] of rawFiles) {
        if (/^public\//.test(p) && !supportEntries[p]) supportEntries[p] = bytes;
      }
      supportEntries["MIGBITS-ORIGIN.json"] = strToU8(JSON.stringify({ source, archiveSha256: hash(readFileSync(cache)), licenseSha256: hash(licenseText), files: Object.entries(supportEntries).map(([p, bytes]) => ({ path: p, sha256: hash(bytes) })), scope: source.adapter === "threeui-community" ? "Original Community source and repository-bundled assets retained with MIT/OFL notices. Remote catalog media, Pro and Beta source are excluded." : "Original text source retained. Binary media, fonts and captured third-party websites are not included. Dependency and runtime verification are separate." }, null, 2));
      mkdirSync(`public/imported/${source.id}`, { recursive: true });
      const common = Object.fromEntries(Object.entries(supportEntries).filter(([p]) => noticePaths.includes(p) || p === "MIGBITS-ORIGIN.json"));
      const supportParts = splitSupport(supportEntries, common);
      const supportUrls = supportParts.map((bytes, i) => {
        const url = `/imported/${source.id}/support${i ? `-${i + 1}` : ""}.zip`;
        writeFileSync(`public${url}`, bytes); return url;
      });
      const candidates = candidatesFor(source, files); let checked = 0, duplicates = 0;
      const seen = new Map<string, string>(); const items: Record<string, unknown>[] = [];
      for (const candidate of candidates) {
        const id = `${source.id}--${slug(candidate.key)}`;
        if (index.some(item => item.id === id)) throw new Error(`Duplicate identifier ${id}`);
        const notes: string[] = []; const originalFiles: ImportedFile[] = [];
        for (const p of candidate.paths) {
          if (!files.has(p)) { notes.push(`Upstream file missing: ${p}`); continue; }
          const content = files.get(p)!;
          originalFiles.push({ path: p, content, sha256: hash(content) });
          if (/\.[jt]sx?$/.test(p)) {
            const parsed = ts.transpileModule(content, { fileName: p, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext }, reportDiagnostics: true });
            const errors = parsed.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) || [];
            if (errors.length) notes.push(`Syntax diagnostics in ${p}: ${errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ")}`);
          }
        }
        const digest = hash(JSON.stringify({ files: originalFiles.map(f => [f.path, f.sha256]), record: candidate.record }));
        if (seen.has(digest)) { duplicates++; items.push({ key: candidate.key, status: "duplicate", duplicateOf: seen.get(digest), reason: "Identical source payload and metadata" }); continue; }
        seen.set(digest, id);
        if (!notes.length) checked++;
        const resource: ImportedResource = { id, name: candidate.name, description: candidate.description, source: source.id, sourceName: source.repo?.split("/")[1] || source.id, category: candidate.category, framework: candidate.framework,
          license: source.license!, revision: source.revision, upstream: source.repositoryUrl ? `${source.repositoryUrl}/-/blob/${source.revision}/${candidate.paths[0] || "README.md"}` : source.repo ? `https://github.com/${source.repo}/tree/${source.revision}/${candidate.paths[0] || "src/ui-ux-pro-max/data"}` : `${source.website}/blocks/${candidate.key}#snapshot-${source.revision}`,
          files: originalFiles.length, dependencies: candidate.dependencies || [], registryDependencies: candidate.registryDependencies || [], validation: notes.length ? "needs-review" : "source-checked",
          validationNotes: [...notes, "Pinned source, license and file integrity checked. Runtime, accessibility and dependency compatibility are not yet validated."], digest,
          dataUrl: `/imported/${source.id}/${slug(candidate.key)}.json`, downloadUrl: `/imported/${source.id}/${slug(candidate.key)}.zip`, supportUrls };
        const attributed = [...originalFiles, ...noticePaths.map(p => ({ path: p, content: files.get(p)!, sha256: hash(files.get(p)!) }))].filter((file, i, all) => all.findIndex(f => f.path === file.path) === i);
        const payload: ImportedPayload = { resource, files: attributed, ...(candidate.record ? { record: candidate.record } : {}), installation: candidate.installation || [] };
        save(`public${resource.dataUrl}`, payload);
        const zipEntries = Object.fromEntries(attributed.map(f => [f.path, strToU8(f.content)]));
        zipEntries["MIGBITS-RESOURCE.json"] = strToU8(JSON.stringify(payload, null, 2));
        zipEntries["README-MIGBITS.txt"] = strToU8([...payload.installation, `Supporting files (extract every part into the same folder): ${supportUrls.join(", ")}`, ...resource.validationNotes].join("\n\n"));
        writeFileSync(`public${resource.downloadUrl}`, zipSync(zipEntries, { level: 6, mtime: new Date("2026-01-01T00:00:00Z") }));
        index.push(resource); items.push({ key: candidate.key, id, status: "imported", validation: resource.validation, digest, reason: resource.validationNotes[0] });
      }
      save(`catalog/import-progress/${source.id}.json`, { revision: source.revision, licenseSha256: hash(licenseText), archiveSha256: hash(readFileSync(cache)), items });
      report.push({ ...source, status: "imported", discovered: candidates.length, imported: candidates.length - duplicates, sourceChecked: checked, runtimeValidated: 0, duplicates, inventoryComplete: true, scope: source.reason, supportFiles: support.length, supportUrl: supportUrls[0], supportUrls });
      console.log(`${source.id}: ${candidates.length - duplicates} imported, ${checked} source-checked, ${duplicates} duplicates`);
    } catch (error) {
      index.push(...previous.filter(item => item.source === source.id && !index.some(current => current.id === item.id)));
      report.push({ ...source, status: "blocked", discovered: null, reason: error instanceof Error ? error.message : String(error), inventoryComplete: false });
      console.error(`${source.id}: ${error instanceof Error ? error.message : error}`);
    }
    save("catalog/import-index.json", index.sort((a, b) => a.name.localeCompare(b.name, "en")));
    save("catalog/import-report.json", { schemaVersion: 1, reviewedAt: "2026-10-24", complete: false, sources: report });
  }
  save("catalog/import-index.json", index.sort((a, b) => a.name.localeCompare(b.name, "en")));
  save("catalog/import-report.json", { schemaVersion: 1, reviewedAt: "2026-10-24", complete: false, sources: report });
  console.log(`Catalog contains ${index.length} imported resources. See catalog/import-report.json for scope and blockers.`);
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("/import-open-source.ts")) main().catch(error => { console.error(error); process.exitCode = 1; });
