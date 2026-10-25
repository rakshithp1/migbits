/** Reviewed, pinned source only. Bootstrap is explicit; normal builds use committed originals. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { build } from "esbuild";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import ts from "typescript";

const root = process.cwd();
const sha = (x: string | Uint8Array) => createHash("sha256").update(x).digest("hex");
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const save = (file: string, content: string | Uint8Array) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, content); };
const write = (file: string, value: unknown) => save(file, JSON.stringify(value, null, 2) + "\n");
const escape = (x: string) => x.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
interface ReviewInput { id: string; status: string; sourceFamily?: string; name: string; snippetId: string; snippetSha256: string; fileSha256: string; file: string; bodySha256: string; closure: { file: string }[]; license: string; revision: string; sourceURL: string; licenseEvidence: string; copyrightHolder?: string }
interface DownloadAsset { id: string; url: string; filename: string; file: string; sha256: string; status: string }
const selected = json("catalog/approved-candidates.json") as { key: string; batch: string; review: ReviewInput }[];
const researchArg = process.argv.indexOf("--research-root");
const research = researchArg < 0 ? undefined : process.argv[researchArg + 1];
const fixture = (name: string) => name === "survey-card" ? '<Demo items={[{itemName:"Clear navigation",vote:42},{itemName:"Useful previews",vote:34},{itemName:"Good documentation",vote:24}]} surveyTitle="What makes a good library?" />'
  : name === "content-scan" ? '<Demo content="A small idea becomes a thoughtful interface. Explore, experiment and make something useful." highlightWords={["thoughtful","useful"]} />'
  : name === "choice-poll" ? '<ChoicePoll.Root defaultValue="preview"><ChoicePoll.Header><ChoicePoll.Title>What should we build next?</ChoicePoll.Title><ChoicePoll.Description>Choose your favorite workflow.</ChoicePoll.Description></ChoicePoll.Header><ChoicePoll.Options>{["preview","design","docs"].map(value=><ChoicePoll.Option key={value} value={value}><ChoicePoll.Indicator/><ChoicePoll.Label>{value}</ChoicePoll.Label></ChoicePoll.Option>)}</ChoicePoll.Options></ChoicePoll.Root>' : '<Demo />';

// Fetching/scanning broad source archives is deliberately not part of this builder.
if (research) {
  const sourceBase = path.join(research, "migbits-phase3-audit-20261025");
  const phase5 = path.join(research, "migbits-phase5-expansion-20261025");
  const notices = json(path.join(sourceBase, "source-license-evidence.json"));
  const illustrations = json(path.join(sourceBase, "illustration-discovery.json")) as { id: string; files: DownloadAsset[] }[];
  const patternsPath = path.join(sourceBase, "sources/patterncraft/src/data/patterns.ts");
  const patternText = readFileSync(patternsPath, "utf8");
  const ast = ts.createSourceFile("patterns.ts", patternText, ts.ScriptTarget.Latest, true);
  const patterns = new Map<string, string>();
  function walk(node: ts.Node) {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText(ast).replaceAll('"', ""), p.initializer]));
      if (fields.id && fields.code && ts.isStringLiteral(fields.id) && ts.isNoSubstitutionTemplateLiteral(fields.code)) patterns.set(fields.id.text, fields.code.text);
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
  for (const entry of selected) {
    const r = entry.review;
    if (r.status !== "APPROVED") throw Error("Unapproved source " + entry.key);
    const id = "approved-" + entry.key.replace(/^p[35]:/, "").replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
    const folder = `resources/approved/${id}`;
    const files: Record<string, string> = {};
    const family = r.sourceFamily || r.id;
    let kind = "tokens";
    let license = "";
    if (family === "patterncraft") {
      const code = patterns.get(r.snippetId);
      if (!code || sha(code) !== r.snippetSha256) throw Error("Snippet digest mismatch " + id);
      files["pattern.tsx"] = code;
      kind = "background";
    } else if (["open-doodles", "open-peeps"].includes(family)) {
      const asset = illustrations.find(x => x.id === family)?.files.find(x => x.url === r.sourceURL);
      if (!asset) throw Error("Missing exact creator-linked asset " + id);
      const content = readFileSync(path.join(sourceBase, "illustrations", asset.filename), "utf8");
      if (sha(content) !== r.fileSha256 || /<script\b|<foreignObject\b|\son\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|data:|\/\/)/i.test(content)) throw Error("Unsafe or changed SVG " + id);
      files["illustration.svg"] = content;
      license = `CC0-1.0\nCreator: Pablo Stanley\nCreator dedication: ${r.licenseEvidence}\nLegal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode.en\nNo modification to the original SVG. Creator credit is appreciated.\n`;
      kind = "illustration";
    } else if (family === "radix-icons") {
      const assets = (json(path.join(phase5, "radix-svg-inventory.json")) as DownloadAsset[]).filter(x => x.status === "APPROVED_SOURCE");
      for (const asset of assets) {
        const content = readFileSync(path.join(phase5, "sources/radix-icons", asset.file), "utf8");
        if (sha(content) !== asset.sha256) throw Error("Changed icon " + asset.id);
        files[`icons/${asset.id}.svg`] = content;
      }
      license = readFileSync(path.join(phase5, "sources/radix-icons/LICENSE"), "utf8");
      kind = "icons";
    } else if (family === "open-color") {
      const content = readFileSync(path.join(phase5, "sources/open-color/open-color.json"), "utf8");
      if (sha(content) !== r.fileSha256) throw Error("Changed Open Color data");
      files["open-color.json"] = content;
      license = readFileSync(path.join(phase5, "sources/open-color/LICENSE"), "utf8");
      kind = "palette";
    } else {
      const paths = family === "radix-colors" ? r.closure.map(f => f.file) : [r.file, ...(family === "open-props" ? (r.closure || []).map(f => f.file) : [])];
      for (const file of [...new Set(paths)] as string[]) {
        const content = readFileSync(path.join(sourceBase, "sources", family, file), "utf8");
        if (file === r.file && sha(content) !== r.fileSha256) throw Error("Changed primary source " + id);
        files[file] = content;
      }
      if (family === "hyperui") { const html=files[r.file]; const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]; if(!body || sha(body)!==r.bodySha256) throw Error("Body scope changed "+id); delete files[r.file]; files["markup.html"]=body; kind="block"; }
      else if (["animata", "kokonut-ui", "cult-ui"].includes(family)) {
        kind = "component";
        if (r.name === "content-scan") files["animata/feature-cards/content-scan.css"] = readFileSync(path.join(sourceBase, "sources/animata/animata/feature-cards/content-scan.css"), "utf8");
      } else if (family === "radix-colors") kind = "palette";
    }
    if (!license) license = notices[family]?.text;
    if (!license) throw Error("Missing reviewed license " + id);
    files["LICENSE"] = license;
    if (kind === "component") {
      const graph = json(path.join(sourceBase, "dependency-license-evidence.json")) as { packages: { name: string; version: string; licenseFiles: { file: string; text: string }[] }[] };
      files["DEPENDENCY_NOTICES.txt"] = graph.packages.flatMap(pkg => pkg.licenseFiles.map(f => `=== ${pkg.name}@${pkg.version} / ${f.file} ===\n${f.text}`)).join("\n\n");
    }
    const digest = sha(JSON.stringify(Object.entries(files).map(([p, text]) => [p, sha(text)]).sort()));
    for (const [p, text] of Object.entries(files)) save(`${folder}/original/${p}`, text);
    write(`${folder}/review.json`, { id, kind, family, name: r.name, primary: kind === "block" ? "markup.html" : r.file, license: r.license.startsWith("MIT") ? "MIT" : r.license, declaredLicense: r.license, revision: r.revision, sourceURL: r.sourceURL, evidence: r.licenseEvidence, author: r.copyrightHolder || (family.startsWith("open-") ? "Pablo Stanley" : family), sourceDigest: digest, files: Object.keys(files), checksums: Object.fromEntries(Object.entries(files).map(([p, text]) => [p, sha(text)])), status: "APPROVED", batch: entry.batch, originalReviewKey: entry.key });
  }
}

const scanner = new Scanner({});
const tailwind = await compile('@import "tailwindcss"; @theme {--color-background:#0b1020;--color-foreground:#e7eeff;--color-card:#121d32;--color-card-foreground:#e7eeff;--color-primary:#72a7ff;--color-primary-foreground:#08101c;--color-secondary:#1c2a43;--color-secondary-foreground:#edf4ff;--color-muted:#1b2941;--color-muted-foreground:#a9bad6;--color-accent:#253c63;--color-accent-foreground:#fff;--color-border:#354560;--color-input:#354560;--color-ring:#72a7ff;--radius:.75rem;}', { base: root, onDependency() {} });
const records: Record<string, unknown>[] = [];
for (const folderName of existsSync("resources/approved") ? readdirSync("resources/approved") : []) {
  const folder = `resources/approved/${folderName}`;
  const review = json(`${folder}/review.json`);
  if (review.status !== "APPROVED") throw Error("Source review missing " + review.id);
  const files: Record<string, string> = {};
  for (const file of review.files) {
    if (file.split("/").some((p: string) => ["..", ""].includes(p)) || file.startsWith("/") || file.includes("\\")) throw Error("Unsafe source path");
    files[file] = readFileSync(`${folder}/original/${file}`, "utf8");
    if (sha(files[file]) !== review.checksums[file]) throw Error("Source changed since review " + review.id);
  }
  const id = review.id;
  let name = review.name.replace(/-/g, " ").replace(/\b\w/g, (x: string) => x.toUpperCase());
  const category = review.kind === "background" ? "backgrounds" : review.kind === "illustration" ? "illustrations" : review.kind === "icons" ? "icons" : review.kind === "palette" ? "colors" : review.kind === "tokens" ? "foundations" : review.kind === "block" ? "blocks" : "components";
  let markup = "", js = "", extraCss = "", colors: Record<string, string> | undefined;
  if (review.kind === "component" || review.kind === "background") {
    const sourceFile = review.kind === "background" ? "pattern.tsx" : review.primary;
    const original = files[sourceFile];
    const code = review.kind === "background" ? `export default function Demo(){return (${original})}` : original;
    const demo = review.kind === "background" ? '<Demo />' : fixture(review.name);
    const resolveDir = path.resolve(`${folder}/original`);
    const result = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Demo${review.name === "choice-poll" ? ",{ChoicePoll}" : ""} from './demo';window.addEventListener('error',()=>document.body.dataset.previewState='error');createRoot(document.getElementById('root')).render(${demo});setTimeout(()=>{if(document.body.dataset.previewState!=='error')document.body.dataset.previewState='rendered'},1000);`, loader: "tsx", resolveDir }, bundle: true, write: false, outfile: "preview.js", minify: true, jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [path.resolve("node_modules")], metafile: true, plugins: [{ name: "reviewed-source", setup(b) {
      b.onResolve({ filter: /^\.\/demo$/ }, () => ({ path: "demo", namespace: "review" }));
      b.onResolve({ filter: /^@\/lib\/utils$/ }, () => ({ path: "utils", namespace: "review" }));
      b.onLoad({ filter: /.*/, namespace: "review" }, (args) => ({ contents: args.path === "utils" ? 'import {clsx} from "clsx";import {twMerge} from "tailwind-merge";export function cn(...x){return twMerge(clsx(x))}' : code + (review.name === "choice-poll" ? '\nexport default ChoicePoll.Root;' : ''), loader: "tsx", resolveDir: args.path === "utils" ? root : path.dirname(path.resolve(`${folder}/original/${sourceFile}`)) }));
    }}] });
    js = result.outputFiles.find(f => f.path.endsWith(".js"))!.text;
    extraCss = result.outputFiles.find(f => f.path.endsWith(".css"))?.text || "";
    const css = tailwind.build(scanner.scanFiles([{ content: code, extension: "tsx" }]));
    extraCss = css + extraCss;
    markup = '<div id="root"></div>';
    // Preserve all bundled installed dependency license files, including nested packages.
    const bundled = new Set<string>();
    for (const input of Object.keys(result.metafile.inputs)) {
      if (!input.includes("node_modules")) continue;
      let dir = path.dirname(path.resolve(input));
      while (dir.startsWith(root) && !existsSync(path.join(dir, "package.json"))) dir = path.dirname(dir);
      if (dir.startsWith(root)) bundled.add(dir);
    }
    let notices = files["DEPENDENCY_NOTICES.txt"] || "";
    for (const dir of bundled) {
      const pkg = json(path.join(dir, "package.json"));
      const licenses = readdirSync(dir).filter(p => /^(licen[sc]e|notice|copying)(\.|$)/i.test(p));
      if (!licenses.length) throw Error(`Bundled dependency lacks exact license: ${pkg.name}@${pkg.version}`);
      for (const file of licenses) notices += `\n=== ${pkg.name}@${pkg.version}/${file} ===\n${readFileSync(path.join(dir, file), "utf8")}`;
    }
    files["PREVIEW_DEPENDENCY_NOTICES.txt"] = notices;
  } else if (review.kind === "block") {
    const html = files[review.primary];
    markup = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
    name = `HyperUI ${review.name.replace(/\.html$/, "").replaceAll("/", " ").replace("-dark", " · Dark")}`;
    extraCss = tailwind.build(scanner.scanFiles([{ content: markup, extension: "html" }]));
    // Original website wrapper, scripts, font imports and links are never executed.
    markup = markup.replace(/<script\b[\s\S]*?<\/script>/gi, "");
    js = "document.addEventListener('submit',e=>e.preventDefault());document.body.dataset.previewState='rendered';";
  } else if (review.kind === "illustration") {
    name = review.family === "open-doodles" ? "Open Doodles · " + review.name.replace(".svg", "").replaceAll("-", " ") : "Open Peeps · " + (review.name.match(/peep-(\d+)/)?.[1] || "Portrait");
    markup = `<div class="illustration">${files["illustration.svg"]}</div>`;
  } else if (review.kind === "icons") {
    name = "Radix Icons · 318 SVGs";
    markup = `<h1>Radix Icons</h1><p>318 non-logo icons · MIT · WorkOS</p><div class="icon-grid">${Object.entries(files).filter(([p]) => p.endsWith(".svg")).slice(0, 60).map(([p, svg]) => `<div title="${escape(p)}">${svg}</div>`).join("")}</div>`;
  } else if (review.kind === "palette") {
    if (review.family === "open-color") { const palette = JSON.parse(files["open-color.json"]); colors = { Primary: palette.blue[6], Secondary: palette.indigo[5], Accent: palette.cyan[5], Background: palette.gray[0], Foreground: palette.gray[9] }; name = "Open Color · Shade scales"; }
    else { const values = files["src/light.ts"].match(/#[a-f0-9]{6}/gi) || []; colors = { Primary: "#3e63dd", Secondary: "#8e4ec6", Accent: "#12a594", Background: values[0] || "#fbfdff", Foreground: "#1c2024" }; name = "Radix Colors · Light & dark scales"; }
    markup = `<h1>${escape(name)}</h1><p>Original palette data and notices in the download.</p><div class="swatches">${Object.entries(colors).map(([key, color]) => `<div style="background:${color}"><span>${key}<br>${color}</span></div>`).join("")}</div>`;
  } else {
    name = "Open Props · " + review.name;
    const definitions = Object.values(files).join("\n").match(/--[a-z0-9-]+\s*:[^;]+;/gi) || [];
    markup = `<h1>${escape(name)}</h1><p>Original CSS foundations · Adam Argyle · MIT</p><div class="tokens">${definitions.slice(0, 18).map((value: string) => `<code>${escape(value)}</code>`).join("")}</div>`;
  }
  const style = `*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;min-height:100vh;padding:40px;background:#0b1020;color:#e7eeff;font:15px/1.6 system-ui}h1{font-size:28px;margin:0 0 8px}p{color:#a8bbd9}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #8ab7ff;outline-offset:4px}#root{min-height:440px;display:flex;align-items:center;justify-content:center}.illustration{display:grid;place-items:center;background:#f1f5fb;border-radius:22px;padding:28px;min-height:480px}.illustration svg{max-width:100%;width:440px;height:440px}.icon-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:10px;margin-top:24px}.icon-grid>div{display:grid;place-items:center;min-height:48px;background:#15223a;border:1px solid #314262;border-radius:10px}.icon-grid svg{width:24px;height:24px}.tokens{display:grid;gap:8px}.tokens code{display:block;padding:8px 14px;background:#14223c;border:1px solid #314262;border-radius:8px;overflow-wrap:anywhere}.swatches{display:flex;height:330px;gap:8px}.swatches>div{flex:1;display:flex;align-items:end;border-radius:12px;padding:12px}.swatches span{font-size:12px;background:#0b1020;color:#fff;padding:8px;border-radius:6px}@media(max-width:600px){body{padding:20px}.icon-grid{grid-template-columns:repeat(5,1fr)}.swatches{height:220px}.swatches>div{padding:3px}.swatches span{font-size:9px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}`;
  const previewUrl = `/library/approved/previews/${id}.html`;
  save("public" + previewUrl, `<!doctype html><html lang="en"${review.name.includes("-dark") ? ' class="dark"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data: blob:;connect-src 'none';form-action 'none';base-uri 'none'"><title>${escape(name)}</title><style>${extraCss.replace(/<\/style/gi, "<\\/style")}${style}</style></head><body data-preview-state="${js ? 'loading' : 'rendered'}">${markup}<script>${js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`);
  save(`public/library/approved/notices/${id}.txt`, Object.entries(files).filter(([p]) => /LICENSE|NOTICES/.test(p)).map(([p, text]) => `=== ${p} ===\n${text}`).join("\n\n"));
  files["ORIGIN.json"] = JSON.stringify({ ...review, adaptations: ["Original source files retained unchanged; MigBits isolated preview scaffold, fixture props and utility wiring are separate adaptations.", "HyperUI body-only preview excludes upstream website wrapper, scripts and fonts. Decorative background names do not imply animation."] }, null, 2);
  files["README-MIGBITS.md"] = `# ${name}\n\nSource: ${review.sourceURL}\nRevision: ${review.revision}\nLicense: ${review.license}\n\nRetain all original source and dependency notices. Original files are unchanged. Previews use separate MigBits fixtures; review original prop interfaces, framework and dependency requirements before use. Native Figma and complete template packages are not implied.\n`;
  const downloadUrl = `/library/approved/downloads/${id}.zip`;
  save("public" + downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([p, text]) => [p, strToU8(text)])), { level: 6, mtime: new Date("2026-01-01") }));
  const dataUrl = `/library/approved/data/${id}.json`;
  write("public" + dataUrl, { files: Object.entries(files).map(([path, content]) => ({ path, content, sha256: sha(content) })), installation: ["Copy the original source files and their required CSS together. Retain LICENSE and all accompanying notices.", "Inspect the original interfaces and install only the dependencies your consuming example uses. Isolated preview validation is not a consumer-project or accessibility certification."], resource: { revision: review.revision } });
  records.push({ id, name, description: review.kind === "background" ? "A static CSS background. Original snippet and MIT notice included; previewed in isolation." : review.kind === "illustration" ? "Creator-linked CC0 illustration by Pablo Stanley. Original SVG preserved for reuse." : `${name}, with pinned upstream source, required notices and an isolated preview.`, category, author: review.family === "open-doodles" || review.family === "open-peeps" ? "Pablo Stanley" : review.family === "radix-icons" || review.family === "radix-colors" ? "WorkOS" : review.family === "open-props" ? "Adam Argyle" : review.family === "open-color" ? "heeyeun" : review.family, license: review.license, tags: [review.family, review.kind, ...(review.kind === "component" ? ["React", "TypeScript", "Tailwind"] : review.kind === "block" ? ["HTML", "Tailwind"] : review.kind === "illustration" || review.kind === "icons" ? ["SVG"] : ["CSS"])], format: review.kind === "component" ? "React · TypeScript · Tailwind" : review.kind === "block" ? "HTML · Tailwind CSS" : review.kind === "illustration" || review.kind === "icons" ? "SVG" : "CSS · source data", previewType: review.kind === "palette" ? "palette" : "block", colors, image: `/library/approved/thumbnails/${id}.png`, previewUrl, downloadUrl, dataUrl, sourceUrl: review.sourceURL, licenseUrl: `/library/approved/notices/${id}.txt`, revision: review.revision, featured: 1200, usage: ["Original source and notices are included in the download.", "This isolated example has fixture data. Review production integration, keyboard behavior, contrast and reduced motion for your application."], review: { status: "APPROVED", sourceDigest: review.sourceDigest, evidence: review.evidence, notices: ["LICENSE"], preview: "pending", checkedAt: "" }, originalReviewKey: review.originalReviewKey });
}
write("catalog/approved-resource-candidates.json", records);
console.log(`Built ${records.length} reviewed candidate previews; none is published until browser validation and thumbnail checks pass.`);
