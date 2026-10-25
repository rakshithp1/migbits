import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { zipSync, strToU8 } from "fflate";
import { shadcnCatalog } from "../catalog/shadcn";
import {
  originalIllustrations,
  illustrationSvg,
} from "../lib/original-illustrations";
import {
  templateDefinitions,
  templateHtml,
} from "../resources/library/templates";
import { figmaKits, kitSvg, kitPlugin } from "../resources/library/figma-kits";
import type { LibraryResource } from "../lib/resource-library";
import type { ImportedResource, ImportedPayload } from "../lib/import-catalog";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const save = (p: string, value: string) => {
  mkdirSync(p.slice(0, p.lastIndexOf("/")), { recursive: true });
  writeFileSync(p, value);
};
const json = (p: string, value: unknown) =>
  save(p, JSON.stringify(value, null, 2) + "\n");
const license = readFileSync("resources/library/LICENSE", "utf8");
const list: LibraryResource[] = [];
const curation: { retainedIds: string[] } = read(
  "catalog/library/curation.json",
);
const allowedIds = new Set(curation.retainedIds);
const pack = read("catalog/community/component-pack.json");
function zip(id: string, files: Record<string, string>) {
  const url = `/library/downloads/${id}.zip`;
  mkdirSync("public/library/downloads", { recursive: true });
  writeFileSync(
    "public" + url,
    zipSync(
      Object.fromEntries(
        Object.entries(files).map(([p, t]) => [p, strToU8(t)]),
      ),
      { mtime: new Date("2026-01-01"), level: 6 },
    ),
  );
  return url;
}
save("public/library/LICENSE.txt", license);
for (const [i, item] of shadcnCatalog.entries()) {
  const id = "component-" + item.id;
  if (!allowedIds.has(id)) continue;
  const files = pack.files.filter(
    (f: { path: string }) =>
      f.path === item.sourcePath ||
      f.path === item.examplePath ||
      /LICENSE|NOTICE|ORIGIN/.test(f.path),
  );
  const dataUrl = `/library/data/${id}.json`;
  json("public" + dataUrl, {
    files,
    installation: [
      item.install,
      "Download the complete attributed pack for shared utilities, styles and dependency notices.",
    ],
    original: true,
  });
  list.push({
    id,
    name: item.title,
    description: item.description,
    category: "components",
    author: "shadcn/ui and contributors",
    license: "MIT",
    tags: [item.category, "React", "TypeScript", "Tailwind"],
    format: "React · TypeScript",
    previewType: "component",
    componentId: item.id,
    dataUrl,
    downloadUrl: "/api/open-source/components",
    sourceUrl: item.docs,
    licenseUrl: "/api/open-source/components?format=json",
    image: `/library/thumbnails/${id}.png`,
    featured: i < 6 ? i * 7 : 100 + i,
    usage: [
      item.install,
      "Import the component into a React project configured for shadcn/ui.",
      "The complete pack includes shared files and separate dependency notices. Preserve them when redistributing.",
    ],
  });
}
const imports: ImportedResource[] = read("catalog/import-index.json");
const previews: { id: string; url?: string }[] = read(
  "catalog/import-previews.json",
);
for (const [i, item] of imports.filter((r) => r.source === "inspo").entries()) {
  if (!allowedIds.has(item.id)) continue;
  const preview = previews.find((p) => p.id === item.id);
  if (!preview?.url) continue;
  list.push({
    id: item.id,
    name: item.name.replaceAll(" / ", " · "),
    description: item.description,
    category: "blocks",
    author: "Inspo contributors",
    license: "MIT",
    tags: ["React", "Tailwind", item.name.split("/")[0].trim()],
    format: "React · Tailwind",
    previewType: "block",
    previewUrl: preview.url,
    image: `/library/thumbnails/${item.id}.png`,
    dataUrl: item.dataUrl,
    downloadUrl: item.downloadUrl,
    sourceUrl: item.upstream,
    featured: 10 + i * 7,
    usage: [
      "Download the original source and its MIT notice.",
      "Install the dependencies listed with the original source.",
      "The sandbox is a Migbits preview adaptation. Original files remain in the download.",
    ],
  });
}
for (const [i, t] of templateDefinitions.entries()) {
  if (!allowedIds.has("template-" + t.id)) continue;
  const id = "template-" + t.id,
    html = templateHtml(t.id),
    previewUrl = `/library/previews/templates/${t.id}.html`;
  save("public" + previewUrl, html);
  json(`public/library/data/${id}.json`, {
    files: [
      { path: "index.html", content: html },
      { path: "LICENSE", content: license },
    ],
    installation: [
      "Extract the ZIP and open index.html in a browser.",
      "Forms, carts and checkout are frontend demos. Connect your own backend before production.",
    ],
  });
  list.push({
    id,
    name: t.name + " — " + t.subtitle,
    description: t.description,
    category: "templates",
    author: "Migbits",
    license: "MIT",
    tags: [t.kind, "HTML", "CSS", "JavaScript"],
    format: "HTML · CSS · JavaScript",
    previewType: "template",
    previewUrl,
    image: `/library/thumbnails/${id}.png`,
    downloadUrl: zip(id, {
      "index.html": html,
      LICENSE: license,
      "README.md":
        t.description +
        "\n\nOpen index.html. No build step or external assets required. Forms and carts are frontend demos. Connect production services yourself. Preserve LICENSE when selling or redistributing.",
    }),
    dataUrl: `/library/data/${id}.json`,
    licenseUrl: "/library/LICENSE.txt",
    featured: 1 + i * 7,
  });
}
for (const [i, f] of read("catalog/library/fonts.json").entries()) {
  if (!allowedIds.has(f.id)) continue;
  list.push({
    id: f.id,
    name: f.name,
    description: `${f.classification} type family. Preview your own text, then download the self-hostable font and its OFL notice.`,
    category: "typography",
    author: f.author,
    license: "OFL-1.1",
    tags: [f.classification, f.variable ? "Variable" : "Regular", "Font"],
    format: f.variable ? "Variable TTF" : "TTF",
    previewType: "font",
    family: f.name,
    variable: f.variable,
    downloadUrl: f.download,
    sourceUrl: f.sourceUrl,
    licenseUrl: f.licenseUrl,
    featured: 3 + i * 7,
    usage: [
      "Use in commercial designs, websites and products.",
      "Keep the supplied OFL copyright and license notice.",
      "Font files cannot be sold by themselves. Bundled redistribution must follow OFL; reserved font names also apply.",
    ],
  });
}
for (const [i, item] of imports
  .filter((r) => r.source === "ui-ux-pro-max")
  .entries()) {
  if (!allowedIds.has(item.id)) continue;
  const payload: ImportedPayload & { record: Record<string, string> } = read(
    "public" + item.dataUrl,
  );
  const colors = Object.fromEntries(
    Object.entries(payload.record).filter(([, v]) => /^#[a-f0-9]{6}$/i.test(v)),
  );
  list.push({
    id: item.id,
    name: item.name.replace("Colors / ", ""),
    description:
      "A complete semantic palette with background, text, accent and interface colors. Inspect contrast and copy CSS tokens.",
    category: "colors",
    author: "UI UX Pro Max contributors",
    license: "MIT",
    tags: [
      "Palette",
      "Design tokens",
      payload.record["Product Type"] || "Interface",
    ],
    format: "CSS · JSON",
    previewType: "palette",
    colors,
    dataUrl: item.dataUrl,
    downloadUrl: zip(item.id, {
      "tokens.json": JSON.stringify(colors, null, 2),
      "tokens.css":
        ":root {\n" +
        Object.entries(colors)
          .map(([k, v]) => `  --${k.toLowerCase().replaceAll(" ", "-")}: ${v};`)
          .join("\n") +
        "\n}",
      ...Object.fromEntries(payload.files.map((f) => [f.path, f.content])),
    }),
    sourceUrl: item.upstream,
    featured: 4 + i * 7,
    usage: [
      "Copy the semantic CSS tokens into your stylesheet.",
      "Check foreground/background pairs for your actual text size.",
      "Preserve the upstream license notices when redistributing the token pack.",
    ],
  });
}
for (const [i, [key, name, description]] of originalIllustrations.entries()) {
  if (!allowedIds.has("illustration-" + key)) continue;
  const id = "illustration-" + key,
    svg = illustrationSvg(key).replace(
      "</metadata>",
      "\n" + license + "</metadata>",
    ),
    image = `/library/illustrations/${key}.svg`;
  save("public" + image, svg);
  json(`public/library/data/${id}.json`, {
    files: [
      { path: key + ".svg", content: svg },
      { path: "LICENSE", content: license },
    ],
  });
  list.push({
    id,
    name,
    description,
    category: "illustrations",
    author: "Migbits",
    license: "MIT",
    tags: ["SVG", "Editable", "Original"],
    format: "Editable SVG",
    previewType: "illustration",
    image,
    accent: "#8B6CF8",
    dataUrl: `/library/data/${id}.json`,
    downloadUrl: zip(id, { [key + ".svg"]: svg, LICENSE: license }),
    licenseUrl: "/library/LICENSE.txt",
    featured: 5 + i * 7,
    usage: [
      "Use the SVG as an image, or import it into Figma to edit its vectors.",
      "Change the accent in the preview or your vector editor.",
      "Commercial use and selling copies are permitted with the MIT notice preserved.",
    ],
  });
}
for (const [i, k] of figmaKits.entries()) {
  if (!allowedIds.has("figma-" + k.id)) continue;
  const id = "figma-" + k.id,
    image = `/library/figma/${k.id}.svg`;
  const board = kitSvg(k.id).replace(
    "</metadata>",
    "\n" + license + "</metadata>",
  );
  save("public" + image, board);
  const files = {
    "board.svg": board,
    "code.js": kitPlugin(k.id),
    "manifest.json": JSON.stringify(
      {
        name: "Migbits " + k.name,
        api: "1.0.0",
        main: "code.js",
        editorType: ["figma"],
        documentAccess: "dynamic-page",
        networkAccess: { allowedDomains: ["none"] },
      },
      null,
      2,
    ),
    "tokens.json": JSON.stringify(
      {
        primary: k.accent,
        ink: "#26242C",
        surface: "#FFFFFF",
        background: "#F7F6F3",
      },
      null,
      2,
    ),
    LICENSE: license,
    "README.md":
      "Original Migbits UI kit. MIT.\n\nQUICK IMPORT: Drag board.svg into a Figma Design file for editable vector shapes.\n\nNATIVE COMPONENTS: In the Figma desktop app choose Plugins > Development > New plugin > Figma design > Run once. Keep the generated plugin ID. Replace its code.js with this code.js; copy the other manifest fields while preserving that ID. Run the development plugin in an empty file. It creates button variants, input, badge, card, navigation, hero, pricing, a starter screen and paint styles. No network access.\n\nGenerator syntax and structure are checked. Native execution in your Figma account has not been verified. This package is SVG + plugin source, not a .fig binary. Inter is used by name; font binaries are not bundled. Preserve LICENSE when redistributing or selling copies.",
  };
  const dataUrl = `/library/data/${id}.json`;
  json("public" + dataUrl, {
    files: Object.entries(files).map(([path, content]) => ({ path, content })),
  });
  list.push({
    id,
    name: k.name,
    description: k.description,
    category: "figma",
    author: "Migbits",
    license: "MIT",
    tags: ["Figma", "Components", "Blocks", "Variants", "Design tokens"],
    format: "SVG · Figma generator",
    previewType: "figma",
    image,
    dataUrl,
    downloadUrl: zip(id, files),
    licenseUrl: "/library/LICENSE.txt",
    featured: 6 + i * 7,
    usage: [files["README.md"]],
  });
}
for (const item of list) {
  const first = [
    "inspo--hero-split-screen",
    "template-atlas",
    "component-button",
    "figma-studio",
    "font-inter",
    "ui-ux-pro-max--colors-1",
    "illustration-workspace",
  ].indexOf(item.id);
  item.featured = first >= 0 ? first : (item.featured ?? 1000) + 20;
  item.revision =
    imports.find((r) => r.id === item.id)?.revision ||
    (item.previewType === "component"
      ? JSON.parse(
          pack.files.find(
            (f: { path: string }) => f.path === "components/ui/ORIGIN.json",
          ).content,
        ).revision
      : item.previewType === "font"
        ? read("catalog/library/fonts.json").find(
            (f: { id: string }) => f.id === item.id,
          ).revision
        : "migbits-original-1.0.0");
  if (
    item.downloadUrl?.endsWith(".zip") &&
    !existsSync("public" + item.downloadUrl)
  )
    throw Error("Missing download " + item.id);
}
json("catalog/library/resources.json", list);
json("catalog/library/build-report.json", {
  generatedAt: "2026-10-25",
  total: list.length,
  categories: Object.fromEntries(
    [...new Set(list.map((r) => r.category))].map((c) => [
      c,
      list.filter((r) => r.category === c).length,
    ]),
  ),
  scope:
    "Only reviewed retained imports and original resources. MIT sale permission requires preserving notices. OFL fonts are not standalone resale assets. Native Figma generator execution remains unverified.",
});
console.log("Built " + list.length + " gallery resources.");
