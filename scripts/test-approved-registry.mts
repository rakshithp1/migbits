import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const workspace = path.resolve("tmp/approved-registry-consumer");
mkdirSync(path.join(workspace, "src"), { recursive: true });
const registry = JSON.parse(readFileSync("public/r/registry.json", "utf8"));
const items: { name: string; files: { target: string; content: string }[] }[] = registry.items;
const npmCli = process.env.npm_execpath;
if (!npmCli) throw Error("Run using npm run test:approved-registry");
writeFileSync(path.join(workspace, "package.json"), JSON.stringify({ name: "migbits-registry-consumer", private: true, type: "module", dependencies: { react: "19.3.0", "react-dom": "19.3.0" }, devDependencies: { typescript: "5.9.3", "@types/react": "19.2.17", "@types/react-dom": "19.2.3", esbuild: "0.28.2" } }, null, 2));
writeFileSync(path.join(workspace, "components.json"), JSON.stringify({ $schema: "https://ui.shadcn.com/schema.json", style: "new-york", rsc: false, tsx: true, tailwind: { config: "", css: "src/styles.css", baseColor: "neutral", cssVariables: true }, aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" } }, null, 2));
writeFileSync(path.join(workspace, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["DOM", "DOM.Iterable", "ES2022"], module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", skipLibCheck: true, strict: true, noEmit: true, baseUrl: ".", paths: { "@/*": ["./*"] } }, include: ["**/*.ts", "**/*.tsx"], exclude: ["node_modules"] }, null, 2));
writeFileSync(path.join(workspace, "src/styles.css"), "/* Consumer fixture; resources include their own styles. */\n");
function npm(args: string[]) { const r = spawnSync(process.execPath, [npmCli!, ...args], { cwd: workspace, stdio: "inherit", env: { ...process.env, CI: "1" } }); if (r.status !== 0) throw Error("Consumer command failed: " + args.join(" ")); }
npm(["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
const origin = process.env.APPROVED_PREVIEW_ORIGIN || "http://127.0.0.1:3212";
npm(["exec", "--yes", "--package=shadcn@4.22.1", "--", "shadcn", "add", ...items.map(item => `${origin}/r/${item.name}.json`), "--yes", "--overwrite"]);
const imports: string[] = [];
const modules: string[] = [];
for (const item of items) {
  for (const file of item.files) {
    const target = [path.resolve(workspace, file.target), path.resolve(workspace, "src", file.target)].find(p => existsSync(p));
    if (!target || !target.startsWith(workspace + path.sep)) throw Error("Missing/unsafe installed registry target " + file.target);
    // shadcn may format/import-normalize source, but notices must survive intact.
    if (/LICENSE|NOTICES/.test(file.target) && !readFileSync(target, "utf8").includes(file.content.trim())) throw Error("Lost installed license notice " + file.target);
    if (file.target.endsWith(".tsx")) {
      const name = `Example${modules.length}`;
      modules.push(name);
      imports.push(`import * as ${name} from './${path.relative(workspace, target).replaceAll(path.sep, "/").replace(/\.tsx$/, "")}';`);
    }
  }
}
writeFileSync(path.join(workspace, "consumer.ts"), imports.join("\n") + `\nexport const examples=[${modules.join(",")}];\n`);
const require = createRequire(path.join(workspace, "package.json"));
const tsc = spawnSync(process.execPath, [require.resolve("typescript/bin/tsc"), "--noEmit"], { cwd: workspace, stdio: "inherit" });
if (tsc.status !== 0) throw Error("Installed registry source failed consumer types");
const esbuild = require("esbuild");
await esbuild.build({ entryPoints: [path.join(workspace, "consumer.ts")], bundle: true, outfile: path.join(workspace, "dist/consumer.js"), jsx: "automatic", logLevel: "warning" });
const report = { checkedAt: new Date().toISOString(), cli: "shadcn@4.22.1", items: items.map(item => item.name), artifactDigests: Object.fromEntries(items.map(item => [item.name, createHash("sha256").update(readFileSync(`public/r/${item.name}.json`)).digest("hex")])), installed: items.length, typecheck: "passed", bundle: "passed", noticeRetention: "passed", scope: "Disposable React 19.3/TypeScript ES2022 consumer; not universal framework/accessibility validation" };
writeFileSync("catalog/approved-registry-validation.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
