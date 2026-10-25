import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { unzipSync, strFromU8 } from "fflate";
const root = path.resolve(
  process.env.ARCHIVE_RUNTIME_DIR ||
    path.join(homedir(), ".codex/tmp/migbits-archive-runtime-20261025"),
);
mkdirSync(root, { recursive: true });
const files = unzipSync(readFileSync("public/imported/shaders/support.zip"));
for (const [name, bytes] of Object.entries(files)) {
  const target = path.resolve(root, name);
  if (!target.startsWith(root + path.sep)) throw Error("Unsafe upstream path");
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, bytes);
}
writeFileSync(
  path.join(root, "package.json"),
  JSON.stringify(
    {
      name: "migbits-isolated-archive-previews",
      private: true,
      type: "module",
      dependencies: {
        "colorjs.io": "0.5.2",
        typegpu: "0.12.3",
        "unplugin-typegpu": "0.12.2",
        esbuild: "0.28.2",
      },
    },
    null,
    2,
  ),
);
console.log("Isolated runtime:", root);
for (const name of [
  "packages/core/vite.config.ts",
  "packages/js/src/createShader.ts",
  "packages/core/src/shaderRegistry.ts",
]) {
  const text = files[name] ? strFromU8(files[name]) : "";
  console.log(name, text.slice(0, 900));
}
