import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import pack from "../catalog/community/component-pack.json";
import motionPack from "../catalog/community/motion-pack.json";
async function verifyPack(
  pack: { components: string[]; files: { path: string; content: string }[] },
  folder: string,
) {
  const root = resolve(folder);
  mkdirSync(root, { recursive: true });
  for (const file of pack.files) {
    const target = resolve(root, file.path);
    if (!target.startsWith(root + "/") && !target.startsWith(root + "\\"))
      throw new Error("Unsafe pack path");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
  const exportPaths = pack.files
    .filter(
      (file) =>
        file.path.startsWith("components/") && file.path.endsWith(".tsx"),
    )
    .map((file) => file.path.replace(/\.tsx$/, ""));
  const imports = exportPaths
    .map((path, i) => `import * as C${i} from './${path}';`)
    .join("\n");
  writeFileSync(
    resolve(root, "entry.ts"),
    imports +
      "\nexport const components=[" +
      exportPaths.map((_, i) => `C${i}`).join(",") +
      "];\n",
  );
  await build({
    entryPoints: [resolve(root, "entry.ts")],
    bundle: true,
    platform: "browser",
    format: "esm",
    jsx: "automatic",
    outfile: resolve(root, "dist/components.js"),
    logLevel: "warning",
  });
  console.log(
    `All ${exportPaths.length} ZIP component, example and recipe modules bundled outside Next.js. Dependencies resolved from the workspace install; this is not a fresh-install or browser interaction claim.`,
  );
}
async function main() {
  await verifyPack(pack, "tmp/community-pack-verification");
  await verifyPack(motionPack, "tmp/motion-pack-verification");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
