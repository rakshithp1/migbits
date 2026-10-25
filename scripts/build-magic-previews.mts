import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import ts from "typescript";
const items = JSON.parse(
  readFileSync("catalog/import-index.json", "utf8"),
).filter((r: { source: string }) => r.source === "magic-ui");
const files = new Map<string, string>();
for (const item of items)
  for (const f of JSON.parse(readFileSync("public" + item.dataUrl, "utf8"))
    .files)
    files.set(f.path, f.content);
files.set(
  "apps/www/lib/utils.ts",
  'import {clsx} from "clsx";import {twMerge} from "tailwind-merge";export function cn(...x){return twMerge(clsx(x))}',
);
files.set(
  "apps/www/components/ui/button.tsx",
  'import React from "react";export function Button({children,asChild,...props}){return asChild?React.cloneElement(children,props):<button {...props}>{children}</button>}',
);
files.set(
  "apps/www/components/ui/scroll-area.tsx",
  'import React from "react";export function ScrollArea({children,...props}){return <div {...props} style={{overflow:"auto",maxHeight:340}}>{children}</div>}',
);
const runtime = path.resolve("tmp/import-preview-runtime");
const scanner = new Scanner({});
const tw = await compile(
  '@import "tailwindcss"; @theme {--color-background:#09090b;--color-foreground:#fafafa;--color-primary:#a78bfa;--color-muted:#27272a;--color-muted-foreground:#a1a1aa;--color-border:#3f3f46;--color-card:#18181b;--color-accent:#818cf8;}',
  { base: process.cwd(), onDependency() {} },
);
let css = tw.build(
  scanner.scanFiles(
    [...files.values()].map((content) => ({ content, extension: "tsx" })),
  ),
);
function cssRules(r: Record<string, unknown>): string {
  return Object.entries(r)
    .map(([k, v]) =>
      typeof v === "object" && v !== null
        ? `${k}{${cssRules(v as Record<string, unknown>)}}`
        : `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v};`,
    )
    .join("");
}
for (const [p, s] of files)
  if (p.endsWith(".json")) {
    try {
      const registry = JSON.parse(s);
      if (registry.css) css += cssRules(registry.css);
      if (registry.cssVars?.theme)
        css +=
          ":root{" +
          Object.entries(registry.cssVars.theme)
            .map(([k, v]) => `--${k}:${v};`)
            .join("") +
          "}";
    } catch {}
  }
const props: Record<string, string> = {
  "animated-circular-progress-bar":
    'value={74} max={100} min={0} gaugePrimaryColor="#a78bfa" gaugeSecondaryColor="#27272a"',
  "number-ticker": "value={128}",
  "word-rotate": 'words={["Design","Build","Create"]}',
  "morphing-text": 'texts={["Design","Build","Create"]}',
  "kinetic-text": 'text="Create something"',
  "text-3d-flip": 'text="Create"',
  "spinning-text": "radius={6}",
  "code-comparison":
    'beforeCode="const color = \'purple\';" afterCode="const color = \'violet\';" language="typescript" filename="theme.ts" lightTheme="github-light" darkTheme="github-dark"',
  highlighter: 'action="highlight" color="#7c3aed"',
  "typing-animation": "duration={80}",
  confetti: "",
  "icon-cloud":
    'icons={[<span key="a">✦</span>,<span key="b">◈</span>,<span key="c">●</span>,<span key="d">◆</span>]}',
  "dotted-map": "height={300}",
};
const prefer: Record<string, string> = {
  "animated-list": "AnimatedList",
  "bento-grid": "BentoGrid",
  confetti: "ConfettiButton",
  dock: "Dock",
  "file-tree": "Tree",
  "scroll-based-velocity": "ScrollVelocityContainer",
  terminal: "Terminal",
  "rainbow-button": "RainbowButton",
};
const report = [];
const notices = new Map<string, string>();
notices.set("Magic UI / LICENSE.md", files.get("LICENSE.md")!);
for (const item of items) {
  try {
    if (
      ["client-tweet-card", "video-text"].includes(
        item.id.replace("magic-ui--", ""),
      )
    )
      throw Error(
        "Requires an independently licensed media fixture or external service; no external content copied.",
      );
    const payload = JSON.parse(readFileSync("public" + item.dataUrl, "utf8"));
    const primary = payload.files.find((f: { path: string }) =>
      f.path.endsWith(".tsx"),
    );
    const ast = ts.createSourceFile(
      primary.path,
      primary.content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const names: string[] = [];
    for (const st of ast.statements) {
      if (
        ts.canHaveModifiers(st) &&
        ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        if (ts.isFunctionDeclaration(st) && st.name) names.push(st.name.text);
        if (ts.isVariableStatement(st))
          for (const d of st.declarationList.declarations)
            names.push(d.name.getText(ast));
      }
      if (
        ts.isExportDeclaration(st) &&
        st.exportClause &&
        ts.isNamedExports(st.exportClause)
      )
        names.push(...st.exportClause.elements.map((e) => e.name.text));
    }
    const slug = item.id.replace("magic-ui--", "");
    const name = prefer[slug] || names.find((n) => /^[A-Z]/.test(n));
    if (!name) throw Error("No exported component");
    let children = "Create something beautiful";
    if (
      /background|pattern|grid|particles|rays|meteors|ripple|border-beam|shine-border|globe|pointer|cursor|noise|progressive-blur/.test(
        slug,
      )
    )
      children = "";
    if (slug === "animated-list")
      children =
        '<div className="sample-card">Project published</div><div className="sample-card">New collection</div><div className="sample-card">Ready to build</div>';
    if (slug === "bento-grid")
      children =
        '<Demo.BentoCard name="Build" className="col-span-3" Icon={()=> <span>✦</span>} description="Start with a clear idea" href="#" cta="Explore" background={<div style={{background:"radial-gradient(circle,#7c3aed,transparent)",height:180}}/>}/>';
    if (slug === "file-tree")
      children =
        '<Demo.Folder element="src" value="src"><Demo.File value="app">app.tsx</Demo.File><Demo.File value="style">style.css</Demo.File></Demo.Folder>';
    if (slug === "dock")
      children =
        "<Demo.DockIcon><span>⌂</span></Demo.DockIcon><Demo.DockIcon><span>✦</span></Demo.DockIcon><Demo.DockIcon><span>◈</span></Demo.DockIcon>";
    if (slug === "marquee")
      children =
        '<div className="sample-card">Design</div><div className="sample-card">Build</div><div className="sample-card">Create</div>';
    if (slug === "text-reveal")
      children =
        "Good design makes complex things feel simple. Build thoughtful interfaces with clear typography and meaningful motion.";
    const jsx =
      "<Demo." +
      name +
      " " +
      (props[slug] || "") +
      ">" +
      children +
      "</Demo." +
      name +
      ">";
    const result = await build({
      stdin: {
        contents: `import React from 'react';import {createRoot} from 'react-dom/client';import * as Demo from '${primary.path}';class Boundary extends React.Component{state={error:null};static getDerivedStateFromError(e){return{error:String(e)}}componentDidCatch(e){document.body.dataset.previewState='error';document.body.dataset.error=String(e)}render(){return this.state.error?<p>{this.state.error}</p>:this.props.children}}window.addEventListener('error',e=>{document.body.dataset.previewState='error';document.body.dataset.error=e.message});window.addEventListener('unhandledrejection',e=>{document.body.dataset.previewState='error';document.body.dataset.error=String(e.reason)});createRoot(document.getElementById('root')).render(<Boundary><div className="stage">${jsx}</div></Boundary>);setTimeout(()=>{if(document.body.dataset.previewState!=='error')document.body.dataset.previewState='rendered'},1800);`,
        loader: "tsx",
        resolveDir: runtime,
      },
      bundle: true,
      metafile: true,
      write: false,
      outfile: "preview.js",
      minify: true,
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      nodePaths: [
        path.resolve("node_modules"),
        path.join(runtime, "node_modules"),
      ],
      logLevel: "silent",
      plugins: [
        {
          name: "original-source",
          setup(b) {
            b.onResolve({ filter: /^react(?:-dom)?(?:\/|$)/ }, (a) => {
              if (a.pluginData?.resolved) return;
              return b.resolve(a.path, {
                resolveDir: process.cwd(),
                kind: a.kind,
                pluginData: { resolved: true },
              });
            });
            b.onResolve({ filter: /.*/ }, (a) => {
              let p = a.path;
              if (p.startsWith("@/")) p = "apps/www/" + p.slice(2);
              else if (p.startsWith(".") && a.namespace === "upstream")
                p = path.posix.normalize(
                  path.posix.dirname(a.importer) + "/" + p,
                );
              else if (!p.startsWith("apps/")) return;
              const f = [p, p + ".tsx", p + ".ts", p + "/index.tsx"].find((p) =>
                files.has(p),
              );
              return f
                ? { path: f, namespace: "upstream" }
                : { errors: [{ text: "Missing preview dependency " + p }] };
            });
            b.onLoad({ filter: /.*/, namespace: "upstream" }, (a) => ({
              contents: files.get(a.path),
              loader: a.path.endsWith(".tsx") ? "tsx" : "ts",
              resolveDir: runtime,
            }));
          },
        },
      ],
    });
    const js = result.outputFiles
      .find((f) => f.path.endsWith(".js"))!
      .text.replace(/<\/script/gi, "<\\/script");
    for (const input of Object.keys(result.metafile!.inputs)) {
      if (!input.includes("node_modules/")) continue;
      let folder = path.dirname(path.resolve(input));
      while (
        folder !== path.dirname(folder) &&
        !existsSync(path.join(folder, "package.json"))
      )
        folder = path.dirname(folder);
      if (!existsSync(path.join(folder, "package.json"))) continue;
      const pkg = JSON.parse(
        readFileSync(path.join(folder, "package.json"), "utf8"),
      );
      for (const n of readdirSync(folder).filter((n) =>
        /^(LICENSE|LICENCE|NOTICE|COPYING)(\.|$)/i.test(n),
      ))
        if (statSync(path.join(folder, n)).isFile())
          notices.set(
            pkg.name + "/" + n,
            readFileSync(path.join(folder, n), "utf8"),
          );
    }
    // esbuild keeps legally significant comments; also retain complete package notices.
    for (const match of js.matchAll(
      /node_modules\/((?:@[^/\s]+\/)?[a-zA-Z0-9._-]+)\//g,
    )) {
      const name = match[1];
      const folder = [
        path.join(runtime, "node_modules", name),
        path.resolve("node_modules", name),
      ].find((p) => existsSync(path.join(p, "package.json")));
      if (folder)
        for (const n of readdirSync(folder).filter((n) =>
          /^(LICENSE|LICENCE|NOTICE|COPYING)(\.|$)/i.test(n),
        ))
          if (statSync(path.join(folder, n)).isFile())
            notices.set(
              name + "/" + n,
              readFileSync(path.join(folder, n), "utf8"),
            );
    }
    const url = "/imported/magic-ui/previews/" + item.id + ".html";
    mkdirSync("public/imported/magic-ui/previews", { recursive: true });
    writeFileSync(
      "public" + url,
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';img-src data: blob:;connect-src 'none';font-src data:;base-uri 'none';form-action 'none'"><title>${item.name}</title><style>${css}body{margin:0;background:#09090b;color:#fafafa;font:600 28px system-ui}.stage{position:relative;min-height:440px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:40px}.sample-card{padding:24px;background:#27272a;border:1px solid #52525b;border-radius:12px;margin:12px}button{cursor:pointer}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}</style><body data-preview-state="loading"><div id="root"></div><script>${js}</script></body></html>`,
    );
    report.push({
      id: item.id,
      status: "compiled",
      url,
      export: name,
      adaptation:
        "Migbits sample props and standalone Tailwind theme; original source preserved in download.",
    });
  } catch (e) {
    report.push({
      id: item.id,
      status: "blocked",
      reason: String(e).slice(0, 600),
    });
  }
}
mkdirSync("catalog/archive-previews", { recursive: true });
writeFileSync(
  "catalog/archive-previews/magic-ui.json",
  JSON.stringify(report, null, 2),
);
writeFileSync(
  "public/imported/magic-ui/previews/LICENSES.txt",
  [...notices].map(([n, s]) => n + "\n" + s).join("\n\n"),
);
console.log(
  JSON.stringify(
    report.reduce(
      (a: Record<string, number>, r) => (
        (a[r.status] = (a[r.status] || 0) + 1),
        a
      ),
      {},
    ),
  ),
);
