/** Pinned source-only imports; neither upstream hooks nor project builds are executed. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { build } from "esbuild";
import { zipSync, strToU8 } from "fflate";

const hash = (s: string | Uint8Array) => createHash("sha256").update(s).digest("hex");
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const save = (p: string, s: string | Uint8Array) => { mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, s); };
const json = (p: string, v: unknown) => save(p, JSON.stringify(v, null, 2) + "\n");
const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
interface Snapshot { repository: string; revision: string; license: string; licenseEvidence: string; licenseFile: string; sourceArchiveSha256: string; checksums: Record<string, string>; excludedFiles: string[] }
const snapshots = new Map<string, { meta: Snapshot; files: Record<string, string> }>();
for (const key of ["motiondivision--motion", "textura-agency--next16-claude-starter", "textura-agency--ai-design-vault", "motiondivision--ai-kit"]) {
  const folder = `resources/partner-imports/${key}`;
  if (!existsSync(folder + "/snapshot.json")) continue;
  const meta: Snapshot = read(folder + "/snapshot.json");
  if (hash(readFileSync(folder + "/source-files.json")) !== meta.sourceArchiveSha256) throw Error("Snapshot archive changed " + key);
  const files: Record<string, string> = read(folder + "/source-files.json");
  for (const [file, digest] of Object.entries(meta.checksums)) if (hash(files[file]) !== digest) throw Error("Changed pinned source " + file);
  const grant = files[meta.licenseFile];
  if (meta.license === "MIT" ? !/Permission is hereby granted[\s\S]*and\/or sell/.test(grant) : meta.license !== "Unlicense" || !/free and unencumbered software released into the public domain/.test(grant)) throw Error("Unapproved primary grant");
  snapshots.set(key, { meta, files });
}
const candidates: Record<string, unknown>[] = [];
const inventory: Record<string, unknown>[] = [];
const commonCss = `*{box-sizing:border-box}body{margin:0!important;background:#10182c;color:#e9f0ff;font:15px/1.6 system-ui}.partner-header{padding:24px 32px;border-bottom:1px solid #52648755;background:#10182c;color:#e9f0ff;position:relative;z-index:100}.partner-header h1{font:600 24px/1.3 system-ui;margin:0 0 8px}.partner-header p{max-width:75ch;color:#bfd0ee;margin:0}.board{min-height:420px;overflow:auto;padding:30px;position:relative}#root{min-height:380px}.partner-toolbar{position:fixed;bottom:14px;right:14px;z-index:2147483647;display:flex;gap:8px}.partner-toolbar button{font:13px system-ui;border:1px solid #a7bbd8;background:#e8f1ff;color:#10213d;padding:10px 16px;border-radius:24px;cursor:pointer}:focus-visible{outline:3px solid #5ebfff!important;outline-offset:4px}html[data-partner-motion=paused] *,html[data-partner-motion=paused] *::before,html[data-partner-motion=paused] *::after{animation-play-state:paused!important;transition:none!important}a{color:#8dccff}.kit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:28px}.kit-grid article{padding:20px;border:1px solid #52648755;border-radius:18px;background:#17243c}.kit-grid h2{font-size:18px}.kit-grid p{color:#b6c8e6}.kit-grid code{font:13px ui-monospace;overflow-wrap:anywhere}.kit-status{margin:20px 28px;padding:16px;border:1px solid #6683aa;border-radius:14px;color:#c7dcf7}@media(max-width:600px){.partner-header{padding:20px}.board{padding:20px}.partner-toolbar{bottom:8px;right:8px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}`;
const csp = `default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data:;connect-src 'none';font-src 'none';form-action 'none';base-uri 'none'`;
const viewportCss = `html:has(.board){width:100%;overflow-x:hidden}body:has(.board){width:100%;max-width:100%;height:100dvh;display:flex;flex-direction:column;overflow:hidden}.partner-header{flex:none;min-width:0}.partner-header h1{overflow-wrap:anywhere}.board{flex:1;min-width:0;min-height:0;padding:20px 20px 64px;overflow-x:hidden}#root{min-width:0;min-height:100%}#root>div,#root>main{max-width:100%}.board img,.board svg{max-width:100%}`;
function documentHtml(title: string, description: string, body: string, js: string) { return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="${csp}"><title>${esc(title)}</title><style>${commonCss}${viewportCss}</style></head><body data-preview-state="loading"><header class="partner-header"><h1>${esc(title)}</h1><p>${esc(description)}</p></header>${body}<script>${js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`; }
function artifacts(id: string, files: Record<string, string>) {
  const downloadUrl = `/library/approved/downloads/${id}.zip`, dataUrl = `/library/approved/data/${id}.json`, licenseUrl = `/library/approved/notices/${id}.txt`;
  save("public" + downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([p, s]) => [p, strToU8(s)])), { level: 6, mtime: new Date("2026-01-01") }));
  save("public" + licenseUrl, Object.entries(files).filter(([p]) => /(?:LICENSE|NOTICES)/.test(p)).map(([p, s]) => `=== ${p} ===\n${s}`).join("\n\n"));
  json("public" + dataUrl, { files: Object.entries(files).map(([path, content]) => ({ path, content, sha256: hash(content) })), installation: files["README-MIGBITS.md"].split("\n\n"), resource: { kind: "Reviewed upstream source; adaptations separate" } });
  return { downloadUrl, dataUrl, licenseUrl };
}
function baseRecord(id: string, title: string, meta: Snapshot, sourceDigest: string) {
  return { id, name: title, category: "components", author: meta.repository.startsWith("textura") ? "Textura" : "Motion B.V.", license: meta.license, format: "React · TypeScript · Motion", previewType: "motion-example", image: `/library/approved/thumbnails/${id}.png`, sourceUrl: `https://github.com/${meta.repository}/tree/${meta.revision}`, revision: meta.revision, featured: 750, review: { status: "APPROVED", sourceDigest, evidence: meta.licenseEvidence, notices: ["LICENSE.md", "DEPENDENCY_NOTICES.txt"], preview: "pending", checkedAt: "" } };
}
function family(file: string) {
  if (/^AnimatePresence/.test(file)) return "presence";
  if (/^(?:Layout|Shared-layout|Animation-layout)/.test(file)) return "layout";
  if (/^Drag/.test(file)) return "drag";
  if (/^Events/.test(file)) return "gestures";
  if (/^SVG/.test(file)) return "svg";
  if (/^Reorder/.test(file)) return "reorder";
  if (/^WAAPI/.test(file)) return "waapi";
  if (/^LazyMotion/.test(file)) return "lazy-loading";
  if (/^Animation/.test(file)) return "animation";
  if (/^use/.test(file)) return "hooks";
  return "configuration";
}
const motion = snapshots.get("motiondivision--motion");
if (!motion) throw Error("Motion snapshot missing");
for (const [file, source] of Object.entries(motion.files).filter(([p]) => /^dev\/react\/src\/examples\/[^/]+\.tsx$/.test(p))) {
  const name = path.basename(file), id = "approved-motion-" + name.replace(/\.tsx$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const status = (value: string, reason: string) => inventory.push({ id, repository: motion.meta.repository, revision: motion.meta.revision, file, status: value, reason, sourceUrl: `https://github.com/${motion.meta.repository}/blob/${motion.meta.revision}/${file}` });
  if (/^_|stress|benchmark|memory|race|^Prop-|^motion-custom|^MotionConfig|^transition-arc/i.test(name)) { status("EXCLUDED", "Internal, stress, benchmark, diagnostic or experimental fixture; not a reusable gallery example."); continue; }
  const auditedSource = source.replaceAll("http://www.w3.org/2000/svg", "").replaceAll("http://www.w3.org/1999/xlink", "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const replaceMedia = ["AnimatePresence-image-gallery.tsx", "WAAPI-interrupt.tsx"].includes(name);
  if ((/https?:\/\//.test(auditedSource) && !replaceMedia) || /\bfetch\s*\(|XMLHttpRequest/.test(auditedSource)) { status("BLOCKED", "External media/network provenance needs separate review; not bundled or executed."); continue; }
  if (name === "LazyMotion-async.tsx") { status("EXCLUDED", "Diagnostic fixture deliberately rejects the feature-loading promise after a timer; not a working reusable example."); continue; }
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]);
  if (imports.some(p => !["framer-motion", "framer-motion/dom", "motion/react", "react"].includes(p) && !(/^\.\/[^/]+\.css$/.test(p) && motion.files[path.posix.join(path.posix.dirname(file), p)]))) { status("BLOCKED", "Unsupported dependency or module closure: " + imports.join(", ")); continue; }
  const exported = /export (?:const|function) App\b/.test(source) ? "App" : /export (?:const|function) Example\b/.test(source) ? "Example" : "";
  if (!exported) { status("EXCLUDED", "No standalone example entry export."); continue; }
  try {
    let adapted = '"use client";\n' + source.replaceAll('from "framer-motion"', 'from "motion/react"').replaceAll('from "framer-motion/dom"', 'from "motion"');
    if (replaceMedia) adapted = adapted.replace(/(["'])https:\/\/[^"']+\1/g, url => {
      const hue = Number.parseInt(hash(url).slice(0, 4), 16) % 360;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="hsl(${hue} 40% 13%)"/><circle cx="880" cy="240" r="180" fill="hsl(${hue} 65% 65%)"/><path d="M0 800V500L350 180 780 800Z" fill="hsl(${(hue + 90) % 360} 55% 45%)"/><path d="M220 800 900 300 1200 560V800Z" fill="hsl(${(hue + 180) % 360} 45% 32%)"/></svg>`;
      return JSON.stringify("data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"));
    });
    const entry = `import React from 'react';import {createRoot} from 'react-dom/client';import {MotionConfig} from 'motion/react';import {${exported} as Demo} from './demo';
window.addEventListener('error',()=>document.body.dataset.previewState='error');window.addEventListener('unhandledrejection',()=>document.body.dataset.previewState='error');
class Boundary extends React.Component{state={error:false};static getDerivedStateFromError(){document.body.dataset.previewState='error';return {error:true}}render(){return this.state.error?<p role="alert">Example runtime failed</p>:this.props.children}}
const host=document.getElementById('root'),media=matchMedia('(prefers-reduced-motion:reduce)');let root,paused=false,ready=false,timer;const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed','false');const bar=document.createElement('div');bar.className='partner-toolbar';bar.append(button);document.body.append(bar);
function mount(){host.inert=false;host.replaceChildren();root=createRoot(host);root.render(<Boundary><MotionConfig reducedMotion="user"><Demo/></MotionConfig></Boundary>)}
function freeze(){if(!root)return;const snapshot=host.cloneNode(true);root.unmount();root=null;host.replaceChildren(...snapshot.childNodes);host.inert=true;host.getAnimations({subtree:true}).forEach(a=>a.cancel())}
function policy(){const stop=paused||media.matches;document.documentElement.dataset.partnerMotion=stop?'paused':'running';button.textContent=media.matches?'Reduced motion':paused?'Resume motion':'Pause motion';button.disabled=media.matches;button.setAttribute('aria-pressed',String(stop));if(ready){if(stop)freeze();else if(!root)mount()}}
button.onclick=()=>{paused=!paused;policy()};media.addEventListener('change',policy);mount();policy();timer=setTimeout(()=>{host.querySelectorAll('svg').forEach(svg=>{const w=Number(svg.getAttribute('width')),h=Number(svg.getAttribute('height'));if(!svg.hasAttribute('viewBox')&&w>0&&h>0){svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.style.height='auto'}});host.querySelectorAll('img:not([alt])').forEach(img=>img.alt='Original MigBits demo artwork');host.querySelectorAll('.next,.prev').forEach(control=>{control.setAttribute('role','button');control.tabIndex=0;control.setAttribute('aria-label',control.classList.contains('next')?'Next image':'Previous image');control.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();control.click()}}});const rgb=getComputedStyle(document.body).backgroundColor.match(/\\d+/g);if(rgb&&rgb.length>=3&&rgb.slice(0,3).reduce((sum,n)=>sum+Number(n),0)>540)document.body.style.color='#17243c';ready=true;policy();if(document.body.dataset.previewState!=='error')document.body.dataset.previewState='rendered'},800);`;
    const cssFiles: Record<string, string> = {};
    const result = await build({ stdin: { contents: entry, loader: "tsx", resolveDir: process.cwd() }, bundle: true, write: false, outfile: "preview.js", jsx: "automatic", minify: true, define: { "process.env.NODE_ENV": '"production"' }, metafile: true, logLevel: "silent", plugins: [{ name: "pinned-motion-example", setup(b) {
      b.onResolve({ filter: /^\.\/demo$/ }, () => ({ path: "demo", namespace: "reviewed" }));
      b.onLoad({ filter: /.*/, namespace: "reviewed" }, () => ({ contents: adapted, loader: "tsx", resolveDir: process.cwd() }));
      b.onResolve({ filter: /^\.\/[^/]+\.css$/ }, args => {
        const relative = path.posix.join(path.posix.dirname(file), args.path);
        if (!motion.files[relative] || /@import|url\(/i.test(motion.files[relative])) throw Error("Unreviewed CSS dependency");
        cssFiles[path.basename(relative)] = motion.files[relative];
        return { path: relative, namespace: "reviewed-css" };
      });
      b.onLoad({ filter: /.*/, namespace: "reviewed-css" }, args => ({ contents: motion.files[args.path], loader: "css" }));
    } }] });
    const packageDirs = new Set<string>();
    for (const input of Object.keys(result.metafile!.inputs)) {
      if (!input.includes("node_modules")) continue;
      let dir = path.dirname(path.resolve(input));
      while (dir.startsWith(process.cwd()) && !existsSync(path.join(dir, "package.json"))) dir = path.dirname(dir);
      if (existsSync(path.join(dir, "package.json"))) packageDirs.add(dir);
    }
    let notices = "";
    const dependencies: Record<string, string> = {};
    for (const dir of packageDirs) {
      const pkg = read(path.join(dir, "package.json"));
      const noticePath = ["LICENSE", "LICENSE.md", "LICENSE.txt"].map(p => path.join(dir, p)).find(existsSync);
      if (pkg.license !== "MIT" || !noticePath) throw Error("Unreviewed bundled dependency " + pkg.name);
      const grant = readFileSync(noticePath, "utf8");
      if (!/Permission is hereby granted[\s\S]*and\/or sell/.test(grant) || /commons clause|no redistribution|non.?commercial/i.test(grant)) throw Error("Actual dependency grant is not the reviewed MIT permission: " + pkg.name);
      dependencies[pkg.name] = pkg.version;
      notices += `\n\n${pkg.name}@${pkg.version}\n${grant}`;
    }
    const title = name.replace(/\.tsx$/, "").replaceAll("-", " ");
    const previewUrl = `/library/approved/previews/${id}.html`;
    const html = documentHtml("Motion · " + title, "Official MIT source example. Interact inside the canvas. Pause freezes the demo; reduced motion starts frozen. Some upstream click/drag examples need accessibility work before production use.", '<div class="board"><div id="root"></div></div>', result.outputFiles.find(f => f.path.endsWith(".js"))!.text).replace("</head>", `<style>${(result.outputFiles.find(f => f.path.endsWith(".css"))?.text || "").replace(/<\/style/gi, "<\\/style")}</style></head>`);
    const fittedHtml = name === "AnimatePresence-image-gallery.tsx" ? html.replace("</head>", `<style>.board{overflow:hidden;display:flex}#root{width:100%;height:100%;min-height:0}.example-container{width:100%!important;height:100%!important;overflow:hidden;border-radius:16px}.example-container img{width:100%;height:100%;max-width:100%!important;object-fit:contain}.example-container .prev,.example-container .next{color:#183153;top:calc(50% - 20px)}</style></head>`) : html;
    save("public" + previewUrl, fittedHtml);
    const usage = [`Install React, React DOM and motion in your consuming project. The preview uses motion ${dependencies.motion}; original code imports framer-motion.`, `Copy Example.tsx into a client component and render its ${exported} export. Review fixed sizing, keyboard controls and reduced motion before production use.`, "Original source is unchanged under upstream/. Example.tsx only adds the Next client boundary and current motion/react import. The separate MigBits preview adds pause/reduced-motion handling; that wrapper is not silently claimed to be part of the upstream source.", "No Motion+ components, website screenshots, photos or paid examples are included. The source is a technical example, not a complete application."];
    if (replaceMedia) usage.push("Adapted Example.tsx also replaces upstream photo URLs with original MigBits SVG geometry. No external photograph is downloaded or redistributed. Original URL references remain text in upstream/Example.tsx; preserve MIGBITS-ADAPTATION-LICENSE for the replacement artwork.");
    const files: Record<string, string> = { "upstream/Example.tsx": source, "Example.tsx": adapted, "LICENSE.md": motion.files[motion.meta.licenseFile], "DEPENDENCY_NOTICES.txt": notices, "README-MIGBITS.md": usage.join("\n\n"), "MIGBITS-MODIFICATIONS.json": JSON.stringify({ original: file, revision: motion.meta.revision, dependencies, adaptations: usage }, null, 2) };
    for (const [file, css] of Object.entries(cssFiles)) { files[file] = css; files["upstream/" + file] = css; }
    if (replaceMedia) files["MIGBITS-ADAPTATION-LICENSE"] = readFileSync("resources/library/LICENSE", "utf8");
    const urls = artifacts(id, files);
    candidates.push({ ...baseRecord(id, "Motion · " + title, motion.meta, motion.meta.sourceArchiveSha256), ...urls, description: "Official Motion MIT example with separately adapted client source, isolated preview and dependency notices.", tags: ["Motion", "React", "TypeScript", family(name), "Animation", "Technical example"], previewUrl, family: family(name), usage, validationScope: "Individual Chrome render and source checks; full production and accessibility review remain separate." });
    status("IMPORTED_PENDING_VALIDATION", "MIT creator code and bundled MIT dependencies verified; browser validation required.");
  } catch (error) { status("BLOCKED", "Current installed runtime/build compatibility: " + String(error)); }
}
for (const [key, name] of [["textura-agency--next16-claude-starter", "Textura · Next.js animation starter"], ["textura-agency--ai-design-vault", "Textura · AI design vault"], ["motiondivision--ai-kit", "Motion · AI Kit source"]]) {
  const snapshot = snapshots.get(key);
  if (!snapshot) continue;
  const id = "approved-partner-" + key.replaceAll("--", "-");
  const usage = ["Source kit only. The preview is a documentation overview; upstream installation, hooks, CMS, environment integration and package builds have not been executed or certified.", "Download into a separate project, inspect the README and pinned package manifests, then install only the dependencies you intend to use. Existing project AGENTS.md, skills and hooks must not be overwritten automatically.", `Original ${snapshot.meta.license} grant and creator provenance are preserved. Dependencies and any assets you add retain their own licenses. Public branding/image binaries are excluded.`, "Source files are original; the MigBits overview and packaging are separate adaptations. This is not a rendered website template and does not count toward the 500-template target."];
  const files = { ...snapshot.files, "README-MIGBITS.md": usage.join("\n\n"), "MIGBITS-EXCLUDED-FILES.json": JSON.stringify(snapshot.meta.excludedFiles, null, 2), "MIGBITS-ORIGIN.json": JSON.stringify(snapshot.meta, null, 2) };
  const urls = artifacts(id, files);
  const previewUrl = `/library/approved/previews/${id}.html`;
  const folders = [...new Set(Object.keys(snapshot.files).map(p => p.includes("/") ? p.split("/")[0] : "Root files"))];
  save("public" + previewUrl, documentHtml(name, "Reviewed, pinned developer source kit. Documentation preview only; install/build execution remains unverified.", `<div class="kit-status">${snapshot.meta.license} · ${Object.keys(snapshot.files).length} source files · No hooks or install scripts executed</div><div class="kit-grid">${folders.map(f => `<article><h2>${esc(f)}</h2><p>${Object.keys(snapshot.files).filter(p => f === "Root files" ? !p.includes("/") : p.startsWith(f + "/")).length} source files</p><code>${esc(snapshot.meta.repository)}</code></article>`).join("")}<article><h2>Keep original notices</h2><p>Source, dependency requirements and exclusions remain visible in the download.</p></article><article><h2>Review before running</h2><p>Backend, agent hooks and development tools are not installed into MigBits.</p></article></div>`, "document.body.dataset.previewState='rendered'"));
  const record = baseRecord(id, name, snapshot.meta, snapshot.meta.sourceArchiveSha256);
  record.review.notices = [snapshot.meta.licenseFile];
  candidates.push({ ...record, ...urls, category: "tools", format: key.includes("starter") ? "Next.js · React · TypeScript source kit" : "Developer tools · Markdown · source", previewType: "source-kit", description: `${snapshot.meta.repository} developer source kit with ${Object.keys(snapshot.files).length} original text files. Documentation preview; installation is not verified.`, tags: ["Developer tools", "Source kit", snapshot.meta.license, key.includes("starter") ? "Next.js" : "AI workflows"], previewUrl, family: "source-kits", usage, validationScope: "Source/notice integrity and overview render only. Upstream installation/build not executed." });
  inventory.push({ id, repository: snapshot.meta.repository, revision: snapshot.meta.revision, status: "SOURCE_IMPORTED_INSTALL_UNVERIFIED", sourceFiles: Object.keys(snapshot.files).length, excludedFiles: snapshot.meta.excludedFiles.length, reason: usage[0] });
}
json("catalog/partner-imports/candidates.json", candidates);
json("catalog/partner-imports/inventory.json", inventory);
console.log(JSON.stringify({ built: candidates.length, inventory: inventory.length, readyForBrowser: candidates.filter(r => r.previewType === "motion-example").length }));
