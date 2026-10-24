import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { shadcnCatalog } from "../catalog/shadcn";
import { strToU8, zipSync, type Zippable } from "fflate";

const read = (path: string) =>
  readFileSync(path, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
const hash = (content: string) =>
  createHash("sha256").update(content).digest("hex");
const names = shadcnCatalog
  .filter((item) => item.kind === "component")
  .map((item) => item.id);
const files: { path: string; content: string }[] = [];
const sourcePaths = [
  ...readdirSync("components/ui")
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => `components/ui/${name}`),
  ...readdirSync("components/examples")
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => `components/examples/${name}`),
  ...readdirSync("components/patterns")
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => `components/patterns/${name}`),
  "hooks/use-mobile.ts",
  "lib/utils.ts",
  "lib/icon-placeholder.tsx",
  "lib/preview-link.tsx",
];
const origin = JSON.parse(read("components/ui/ORIGIN.json"));
for (const path of sourcePaths) {
  const content = read(path);
  files.push({ path, content });
  const record = origin.files.find(
    (entry: { path: string }) => entry.path === path,
  );
  if (record) record.sha256 = hash(content);
  else
    origin.files.push({
      path,
      sha256: hash(content),
      origin:
        "Migbits portable composition/helper for the MIT shadcn/ui collection",
    });
}
origin.modifications = [
  "Added client boundaries and preserved MIT attribution.",
  "Converted registry/Next.js aliases to portable relative imports.",
  "Composed focused local previews without AI services, accounts, external photos, or server actions.",
  "Mapped registry icon placeholders to Lucide; added scoped theme tokens for current base components.",
];
origin.files.sort((a: { path: string }, b: { path: string }) =>
  a.path.localeCompare(b.path, "en"),
);
writeFileSync(
  "components/ui/ORIGIN.json",
  JSON.stringify(origin, null, 2) + "\n",
);
for (const path of ["components/ui/LICENSE", "components/ui/ORIGIN.json"])
  files.push({ path, content: read(path) });
files.push({ path: "styles/ui-theme.css", content: read("app/ui-theme.css") });
const dependencies = new Set<string>();
for (const file of files) {
  for (const match of file.content.matchAll(/from\s+["']([^"']+)["']/g)) {
    const imported = match[1];
    if (imported.startsWith(".") || imported.startsWith("node:")) continue;
    const name = imported.startsWith("@")
      ? imported.split("/").slice(0, 2).join("/")
      : imported.split("/")[0];
    if (!["react", "react-dom"].includes(name)) dependencies.add(name);
  }
}
dependencies.add("tailwindcss");
dependencies.add("tw-animate-css");
const versions: Record<string, string> = {};
for (const name of [...dependencies].sort()) {
  const directory = join(process.cwd(), "node_modules", name);
  const pkg = JSON.parse(read(join(directory, "package.json")));
  versions[name] = pkg.version;
  const license = readdirSync(directory).find((file) =>
    /^licen[sc]e(?:\.|$)/i.test(file),
  );
  const fallback = `docs/licenses/${name.replaceAll("/", "-")}.txt`;
  if (!license && !existsSync(fallback))
    throw Error(`Missing dependency license: ${name}`);
  files.push({
    path: `licenses/${name.replaceAll("/", "-")}.txt`,
    content: read(license ? join(directory, license) : fallback),
  });
}
files.push({
  path: "styles/globals.css",
  content: '@import "tailwindcss";\n@import "./ui-theme.css";\n',
});
files.push({
  path: "package.json",
  content:
    JSON.stringify(
      {
        name: "migbits-open-source-ui-pack",
        private: true,
        version: "2.0.0",
        description:
          "65 MIT shadcn/ui modules, complete previews and 3 composition recipes",
        peerDependencies: { react: "19.3.0", "react-dom": "19.3.0" },
        dependencies: versions,
      },
      null,
      2,
    ) + "\n",
});
files.push({
  path: "README.md",
  content: `# Migbits — the complete shadcn collection\n\n65 shadcn/ui component modules, 65 runnable preview examples, and three compositions (date picker, TanStack data table, typography). Upstream source and examples are MIT licensed; retain components/ui/LICENSE and ORIGIN.json. Runtime dependency notices are in licenses/. The original Migbits profile-settings resource and the rest of the website are not relicensed by this pack.\n\n## Setup\n\nMerge the exact dependencies in package.json into your React application's package.json and install them. React 19.3.0 and React DOM 19.3.0 were used for validation. Preserve components/, hooks/, lib/, and styles/. Import styles/globals.css once in a Tailwind CSS v4 project. No Next.js runtime is needed. This is source code, not precompiled CSS.\n\nImport a module: import { Button } from './components/ui/button'.\nImport a working example: import Example from './components/examples/dialog'.\nImport a composition: import DataTable from './components/patterns/data-table'.\n\n## Preview theme\n\nWrap examples with className="oss-kit" and data-appearance="dark" or "light". For portalled surfaces to share the theme, set document.body.dataset.componentTheme to the selected appearance while your preview is mounted, and remove it on cleanup. Add className="dark" to the preview wrapper for dark utilities. The theme's variables are in styles/ui-theme.css. Typography and surface values remain yours to customize.\n\nSome demo links open the original shadcn documentation. Demonstration forms, chat elements, attachments, and notifications are local examples, not account, payment, upload, messaging, or AI backends. Replace sample handlers with your own authenticated integration when appropriate.\n\n## Provenance\n\nImported source is pinned to upstream revision ${origin.revision}. Relative imports, local example compositions, icon mapping, and theme changes are recorded in ORIGIN.json. Original source hashes are retained alongside final exported hashes. Browser accessibility and visual review are separate from source/bundle verification.\n`,
});
files.sort((a, b) => a.path.localeCompare(b.path, "en"));
const checksums = Object.fromEntries(
  files.map((file) => [file.path, hash(file.content)]),
);
const snapshot = {
  version: "2.0.0",
  title: "Migbits complete open-source shadcn collection",
  components: names,
  patterns: shadcnCatalog
    .filter((item) => item.kind === "pattern")
    .map((item) => item.id),
  dependencies: versions,
  sourceDigest: hash(JSON.stringify(checksums)),
  checksums,
  files,
};
writeFileSync(
  "catalog/community/component-pack.json",
  JSON.stringify(snapshot, null, 2) + "\n",
);
// Compress at build time so public downloads do not spend Workers CPU zipping 164 files.
const archive: Zippable = {};
for (const file of files)
  archive[file.path] = [strToU8(file.content), { mtime: new Date(1980, 0, 1) }];
const { files: omitted, ...manifest } = snapshot;
void omitted;
archive["manifest.json"] = [
  strToU8(JSON.stringify(manifest, null, 2) + "\n"),
  { mtime: new Date(1980, 0, 1) },
];
const compressed = zipSync(archive, { level: 6 });
writeFileSync(
  "catalog/community/component-archive.json",
  JSON.stringify({
    version: snapshot.version,
    sourceDigest: snapshot.sourceDigest,
    base64: Buffer.from(compressed).toString("base64"),
  }) + "\n",
);
console.log(
  `Generated licensed source pack: ${names.length} components, 3 recipes, ${files.length} files.`,
);
