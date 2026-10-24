import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import ts from "typescript";
import { strFromU8, unzipSync } from "fflate";
import type { ImportedPayload, ImportedResource } from "../lib/import-catalog";

async function main() {
const resources: ImportedResource[] = JSON.parse(readFileSync("catalog/import-index.json", "utf8"));
const selectedIds = process.argv.find(arg => arg.startsWith("--ids="))?.slice(6).split(",");
const report: { id: string; status: string; url?: string; reason?: string }[] = selectedIds ? JSON.parse(readFileSync("catalog/import-previews.json", "utf8")).filter((item: { id: string }) => !selectedIds.includes(item.id)) : [];
const htmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const scanner = new Scanner({});
const runtimeDir = existsSync("tmp/import-preview-runtime/node_modules") ? path.resolve("tmp/import-preview-runtime") : process.cwd();
for (const source of ["inspo", "magic-ui"]) {
  const archive = unzipSync(new Uint8Array(readFileSync(`public/imported/${source}/support.zip`)));
  const files = new Map(Object.entries(archive).map(([p, bytes]) => [p, strFromU8(bytes)]));
  const base = source === "inspo" ? "apps/web/src" : "apps/www";
  if (source === "magic-ui") files.set("apps/www/lib/utils.ts", 'import {clsx} from "clsx";import {twMerge} from "tailwind-merge";export function cn(...inputs){return twMerge(clsx(inputs))}');
  const originalCss = files.get(`${base}/app/globals.css`) || "";
  // Original styles remain in downloads. Only local rules are used by the sandbox;
  // remote fonts, @imports and framework-only directives are excluded here.
  const localCss = originalCss.replace(/@import[^;]+;/g, "").replace(/@font-face\s*\{[^}]*\}/g, "");
  const tailwind = await compile('@import "tailwindcss";\n' + localCss, { base: process.cwd(), onDependency() {} });
  const candidates = scanner.scanFiles([...files.entries()].filter(([p]) => /\.[jt]sx?$/.test(p)).map(([, content]) => ({ content, extension: "tsx" })));
  const css = tailwind.build(candidates);
  const collection = resources.filter(item => item.source === source && (source === "inspo" || item.category === "Examples") && (!selectedIds || selectedIds.includes(item.id)));
  for (const item of collection) {
    try {
      const payload: ImportedPayload = JSON.parse(readFileSync(`public${item.dataUrl}`, "utf8"));
      const primary = payload.files.find(f => /\.tsx$/.test(f.path));
      if (!primary) throw new Error("No TSX example entry point");
      const ast = ts.createSourceFile(primary.path, primary.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let exported = "";
      for (const statement of ast.statements) {
        if (ts.isExportAssignment(statement)) { exported = "default"; break; }
        if (ts.canHaveModifiers(statement)) {
          const mods = ts.getModifiers(statement);
          if (mods?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) { exported = "default"; break; }
          if (ts.isFunctionDeclaration(statement) && statement.name && mods?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) { exported = statement.name.text; break; }
        }
      }
      if (!exported) throw new Error("No standalone exported example component");
      const result = await build({
        stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import * as Demo from '${primary.path}';class Boundary extends React.Component{state={error:null};static getDerivedStateFromError(error){return {error:String(error)}}componentDidCatch(){document.body.dataset.previewState='error'}render(){return this.state.error?React.createElement('p',{role:'alert'},this.state.error):this.props.children}}window.addEventListener('error',()=>document.body.dataset.previewState='error');window.addEventListener('unhandledrejection',()=>document.body.dataset.previewState='error');createRoot(document.getElementById('root')).render(React.createElement(Boundary,null,React.createElement(Demo[${JSON.stringify(exported)}])));setTimeout(()=>{if(document.body.dataset.previewState!=='error')document.body.dataset.previewState='rendered'},500);`, loader: "tsx", resolveDir: runtimeDir },
        bundle: true, write: false, outfile: "preview.js", format: "iife", platform: "browser", target: "es2020", jsx: "automatic", minify: true, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent",
        plugins: [{ name: "upstream-files", setup(builder) {
          builder.onResolve({ filter: /^next\/(link|image)$/ }, args => ({ path: args.path, namespace: "preview-adapter" }));
          builder.onLoad({ filter: /.*/, namespace: "preview-adapter" }, args => ({ contents: args.path === "next/link" ? 'import React from "react";export default function Link({href,children,...props}){return React.createElement("a",{...props,href:typeof href === "string"?href:"#"},children)}' : 'import React from "react";export default function Image({src,alt,fill,priority,loader,quality,unoptimized,placeholder,blurDataURL,...props}){return React.createElement("img",{...props,src:typeof src === "string"?src:src?.src,alt})}', loader: "jsx", resolveDir: runtimeDir }));
          builder.onResolve({ filter: /^react(?:-dom)?(?:\/|$)/ }, args => {
            if (args.pluginData?.resolvedReact) return undefined;
            return builder.resolve(args.path, { resolveDir: process.cwd(), kind: args.kind, pluginData: { resolvedReact: true } });
          });
          builder.onResolve({ filter: /.*/ }, args => {
            let p = args.path;
            if (p.startsWith(".") && args.namespace !== "upstream") return undefined;
            if (p.startsWith("@/")) p = `${base}/${p.slice(2)}`;
            else if (p.startsWith(".")) p = path.posix.normalize(`${path.posix.dirname(args.importer)}/${p}`);
            else if (!p.startsWith("apps/")) return undefined;
            const match = [p, `${p}.tsx`, `${p}.ts`, `${p}/index.tsx`, `${p}/index.ts`].find(value => files.has(value));
            if (!match) return { errors: [{ text: `Missing collection dependency: ${p}` }] };
            return { path: match, namespace: "upstream" };
          });
          builder.onLoad({ filter: /.*/, namespace: "upstream" }, args => ({ contents: files.get(args.path)!, loader: args.path.endsWith(".tsx") ? "tsx" : "ts", resolveDir: runtimeDir }));
        } }],
      });
      const js = result.outputFiles.find(file => file.path.endsWith(".js"))!.text.replace(/<\/script/gi, "<\\/script");
      const extraCss = result.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
      const url = `/imported/${source}/previews/${item.id}.html`;
      mkdirSync(`public/imported/${source}/previews`, { recursive: true });
      writeFileSync(`public${url}`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>${htmlEscape(item.name)} preview</title><style>${(css + extraCss).replace(/<\/style/gi, "<\\/style")}</style><style>${localCss.replace(/<\/style/gi, "<\\/style")}body{margin:0;padding:24px;background:#f7f4ed;color:#201e19;font-family:Arial,sans-serif}#root{min-height:240px}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #7652bf;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}</style></head><body data-preview-state="loading"><div id="root"></div><script>${js}</script></body></html>`);
      report.push({ id: item.id, status: "compiled", url });
    } catch (error) {
      const reason = error instanceof Error ? error.message.split("\n").slice(0, 4).join(" ") : String(error);
      report.push({ id: item.id, status: "blocked", reason });
    }
  }
  console.log(`${source}: ${report.filter(p => p.id.startsWith(source + "--") && p.status === "compiled").length}/${collection.length} previews compiled`);
}
writeFileSync("catalog/import-previews.json", JSON.stringify(report, null, 2) + "\n");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
