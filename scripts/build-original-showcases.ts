import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { originalShowcases, originalShowcaseHtml } from "../resources/library/original-showcases";
import type { LibraryResource } from "../lib/resource-library";

export function buildOriginalShowcases(): LibraryResource[] {
  const license = readFileSync("resources/library/LICENSE", "utf8");
  const save = (url: string, content: string | Uint8Array) => { mkdirSync(path.dirname("public" + url), { recursive: true }); writeFileSync("public" + url, content); };
  return originalShowcases.map((definition, index) => {
    const id = `template-${definition.slug}`;
    const previewUrl = `/library/previews/showcases/${definition.slug}.html`;
    const dataUrl = `/library/data/${id}.json`, downloadUrl = `/library/downloads/${id}.zip`;
    const sourceUrl = "https://github.com/rakshithp1/migbits/blob/main/resources/library/original-showcases.ts";
    const usage = ["Extract the ZIP and open index.html. No package installation or network connection is needed.", "PROMPT.md is an original MigBits build brief. Use it to extend or rebuild the design in your preferred framework.", "All names, products, prices and booking times are fictional examples. Forms and cart actions have no backend.", "Keep LICENSE.txt when modifying, distributing or selling copies. Review the final accessibility and connect your own services before production use.", "Use the template colour selector and copy the resulting CSS after the original stylesheet. Original vector artwork and source remain separate from that adaptation."];
    const files = {
      "index.html": originalShowcaseHtml(definition.slug),
      "PROMPT.md": `# ${definition.name}\n\nOriginal MigBits build brief. MIT; preserve LICENSE.txt.\n\n${definition.prompt}\n`,
      "LICENSE.txt": license,
      "README.md": `# ${definition.name}\n\n${definition.description}\n\n${usage.join("\n\n")}\n\n${sourceUrl}\n`,
      "ORIGIN.md": "Original MigBits code, vector artwork and prompt. No GetLayers prompt text, source code, imagery, branding or other third-party template assets are included. Public product types were researched as market references; designs and implementation were written independently. System font names only; no font binaries bundled.\n",
    };
    save(previewUrl, files["index.html"]);
    save(dataUrl, JSON.stringify({ files: Object.entries(files).map(([path, content]) => ({ path, content })), installation: usage }, null, 2) + "\n");
    save(downloadUrl, zipSync(Object.fromEntries(Object.entries(files).map(([p, content]) => [p, strToU8(content)])), { level: 6, mtime: new Date("2026-01-01") }));
    return { id, name: definition.name, description: definition.description, category: "templates", author: "MigBits contributors", license: "MIT", licenseUrl: "/library/LICENSE.txt", sourceUrl, format: "HTML · CSS · JavaScript · SVG", tags: [definition.kind, "Original", "Animated", "Build prompt", "No dependencies", "Colour options", "Reduced motion"], previewType: "template", previewUrl, image: `/library/thumbnails/${id}.png`, dataUrl, downloadUrl, originalPrompt: definition.prompt, revision: "migbits-original-showcases-1.0.0", featured: 2 + index, template: { kind: definition.kind, pages: 1, motion: true, motionEngine: "Native CSS and SVG", original: true }, usage };
  });
}
