import { buildCoralCta } from "./build-coral-cta";
import { buildFullscreenTemplates } from "./build-fullscreen-templates";
import { buildScrollExperiences } from "./build-scroll-experiences";
import { buildOriginalShowcases } from "./build-original-showcases";
import { consolidateTemplateColors } from "./consolidate-template-colors";
import { customizeTemplatePreviews } from "./customize-template-previews";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { zipSync, strToU8, unzipSync } from "fflate";
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
import { createHash } from "node:crypto";
import { validateLibrary } from "../lib/library-validation";
import { buildVisualLibrary } from "./build-visual-library";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const save = (p: string, value: string) => {
  mkdirSync(p.slice(0, p.lastIndexOf("/")), { recursive: true });
  writeFileSync(p, value);
};
const json = (p: string, value: unknown) =>
  save(p, JSON.stringify(value, null, 2) + "\n");
const license = readFileSync("resources/library/LICENSE", "utf8");
json("catalog/library/original-license.json", { text: license });
let list: LibraryResource[] = [];
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
    revision: "migbits-original-1.1.0",
    template: { kind: t.kind, pages: 1, motion: true, motionEngine: "Native browser APIs", original: true },
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
// Only items that passed the isolated browser audit may leave the internal archive.
const archiveValidation = existsSync("catalog/archive-previews/promotion.json")
  ? (read("catalog/archive-previews/promotion.json") as {
      id: string;
      thumbnail: string;
      url: string;
      validation: string;
    }[])
  : [];
for (const tested of archiveValidation) {
  if (list.some((r) => r.id === tested.id)) continue;
  const upstream = imports.find((r) => r.id === tested.id);
  if (!upstream || upstream.license !== "MIT")
    throw Error("Unreviewed promotion " + tested.id);
  const shader = upstream.source === "shaders";
  if (shader && !read("catalog/library/shader-presentation-policy.json").retained.includes(upstream.id.replace("shaders--", ""))) continue;
  list.push({
    id: upstream.id,
    name: upstream.name,
    description: upstream.description,
    category: shader ? "shaders" : "components",
    author: shader ? "Shader Effects Inc." : "Magic UI",
    license: upstream.license,
    tags: [shader ? "WebGPU" : "React", upstream.category, "Render checked"],
    format: upstream.framework,
    previewType: "block",
    image: tested.thumbnail,
    previewUrl: tested.url,
    dataUrl: upstream.dataUrl,
    sourceUrl: upstream.upstream,
    downloadUrl: upstream.downloadUrl,
    licenseUrl: `/imported/${upstream.source}/previews/LICENSES.txt`,
    featured: 2000,
    usage: [
      tested.validation,
      "Original upstream source is preserved in the source download; Migbits preview fixtures and standalone styling are separate adaptations.",
      `Download the original source and supporting engine or collection files: /imported/${upstream.source}/support.zip . Preserve all copyright and license notices.`,
      shader
        ? "Requires WebGPU. The preview starts automatically when motion is allowed. Supply a static fallback on unsupported devices. This definition needs the upstream engine; it is not a standalone React component."
        : "Use the included registry definition in a separate React/Tailwind project. Apply its CSS, variables and registry dependencies; review keyboard interaction, contrast and reduced motion in your app.",
    ],
  });
}
// Exact, reviewed source and browser evidence are required for every new item.
const approved = existsSync("catalog/approved-resources.json") ? read("catalog/approved-resources.json") as (LibraryResource & { originalReviewKey: string })[] : [];
for (const item of approved) {
  const sourceReview = read(`resources/approved/${item.id}/review.json`);
  if (sourceReview.status !== "APPROVED" || sourceReview.sourceDigest !== item.review?.sourceDigest || item.review?.preview !== "passed") throw Error("Unreviewed source/preview " + item.id);
  const expectedDigest = (item.review as LibraryResource["review"] & { previewDigest: string }).previewDigest;
  if (!item.previewUrl || createHash("sha256").update(readFileSync("public" + item.previewUrl)).digest("hex") !== expectedDigest) throw Error("Stale preview validation " + item.id);
  if (!item.image || !existsSync("public" + item.image)) throw Error("Missing approved thumbnail " + item.id);
  if (sourceReview.kind === "component" && existsSync("catalog/approved-registry-validation.json")) {
    const validation = read("catalog/approved-registry-validation.json");
    const name = `migbits-${sourceReview.name}`;
    const file = `public/r/${name}.json`;
    if (validation.typecheck === "passed" && validation.bundle === "passed" && existsSync(file) && validation.artifactDigests?.[name] === createHash("sha256").update(readFileSync(file)).digest("hex")) {
      item.registryItem = name;
      item.usage = [`npx shadcn@4.22.1 add https://migbits.com/r/${name}.json`, "Tested in a React 19.3 / TypeScript ES2022 consumer. Keep all included copyright and dependency notices.", ...(item.usage || [])];
    }
  }
  for (const [file, digest] of Object.entries(sourceReview.checksums)) {
    if (createHash("sha256").update(readFileSync(`resources/approved/${item.id}/original/${file}`)).digest("hex") !== digest) throw Error("Source changed since approval " + item.id);
  }
  // Light/dark variants keep their source, evidence and downloads but share a card.
  if (item.originalReviewKey.includes("-dark.html")) continue;
  const family = sourceReview.family;
  if (["open-doodles", "open-peeps"].includes(family)) {
    const members = approved.filter(r => r.originalReviewKey.startsWith(`p3:${family}:`));
    if (members[0].id !== item.id) continue;
    item.name = family === "open-doodles" ? "Open Doodles · 6 illustration poses" : "Open Peeps · 6 portrait variants";
    item.description = "A creator-linked CC0 illustration collection by Pablo Stanley. Choose an individual variant, inspect its original SVG or download all six with provenance.";
    item.variants = members.map(r => ({ label: r.name.replace(/^Open (Doodles|Peeps) · /, ""), previewUrl: r.previewUrl!, dataUrl: r.dataUrl!, downloadUrl: r.downloadUrl! }));
    const collectionFiles: Record<string, string> = {};
    for (const member of members) {
      const archive = unzipSync(new Uint8Array(readFileSync("public" + member.downloadUrl)));
      for (const [file, content] of Object.entries(archive)) collectionFiles[`${member.id}/${file}`] = new TextDecoder().decode(content);
    }
    collectionFiles["SOURCE_COLLECTION.json"] = JSON.stringify(members.map(r => ({ id: r.id, source: r.sourceUrl, revision: r.revision, review: r.review })), null, 2);
    item.downloadUrl = zip(item.id + "-collection", collectionFiles);
  }
  const dark = item.originalReviewKey.endsWith(".html") ? approved.find((r) => r.originalReviewKey === item.originalReviewKey.replace(".html", "-dark.html")) : undefined;
  if (dark) item.variants = [item, dark].map((r, i) => ({ label: i ? "Dark" : "Light", previewUrl: r.previewUrl!, dataUrl: r.dataUrl!, downloadUrl: r.downloadUrl! }));
  list.push(item);
}
// Complete template kits require independent source and preview approval.
const templateImports: LibraryResource[] = existsSync("catalog/approved-templates.json") ? read("catalog/approved-templates.json") : [];
for (const item of templateImports) {
  const review = read(`resources/template-imports/${item.id}/review.json`);
  if (review.status !== "APPROVED" || review.license !== "MIT" || review.sourceDigest !== item.review?.sourceDigest || item.review?.preview !== "passed") throw Error("Unapproved template " + item.id);
  const artifacts = (item.review as LibraryResource["review"] & { artifactDigests: Record<string, string> }).artifactDigests;
  for (const url of [item.image, item.dataUrl, item.downloadUrl, item.licenseUrl]) {
    if (!url || createHash("sha256").update(readFileSync("public" + url)).digest("hex") !== artifacts?.[url]) throw Error("Changed template artifact " + item.id);
  }
  const digest = (item.review as LibraryResource["review"] & { previewDigest: string }).previewDigest;
  if (!item.previewUrl || createHash("sha256").update(readFileSync("public" + item.previewUrl)).digest("hex") !== digest) throw Error("Stale template render " + item.id);
  for (const variant of item.variants || []) {
    if (createHash("sha256").update(readFileSync("public" + variant.previewUrl)).digest("hex") !== item.review?.previewDigests?.[variant.previewUrl]) throw Error("Stale template page " + variant.previewUrl);
  }
  for (const [file, expected] of Object.entries(review.checksums)) {
    if (createHash("sha256").update(readFileSync(`resources/template-imports/${item.id}/original/${file}`)).digest("hex") !== expected) throw Error("Changed template source " + item.id);
  }
  if (!item.image || !existsSync("public" + item.image) || !item.downloadUrl || !existsSync("public" + item.downloadUrl)) throw Error("Missing template artifact " + item.id);
  list.push(item);
}
// Partner scopes are pinned data, never active agent instructions or installed upstream projects.
const partnerImports: (LibraryResource & { partner: { repositoryKey: string }; review: NonNullable<LibraryResource["review"]> & { artifactDigests: Record<string, string>; previewDigest: string } })[] = existsSync("catalog/approved-partner-resources.json") ? read("catalog/approved-partner-resources.json") : [];
for (const item of partnerImports) {
  const folder = `resources/partner-imports/${item.partner.repositoryKey}`;
  const snapshot = read(folder + "/snapshot.json");
  const digest = createHash("sha256").update(readFileSync(folder + "/source-files.json")).digest("hex");
  if (!["MIT", "Unlicense"].includes(snapshot.license) || digest !== snapshot.sourceArchiveSha256 || digest !== item.review.sourceDigest || item.review.status !== "APPROVED" || item.review.preview !== "passed") throw Error("Unapproved partner scope " + item.id);
  const originals = read(folder + "/source-files.json");
  for (const [file, expected] of Object.entries(snapshot.checksums)) if (createHash("sha256").update(originals[file]).digest("hex") !== expected) throw Error("Changed partner source " + file);
  for (const [url, expected] of Object.entries(item.review.artifactDigests)) if (!url.startsWith("/library/approved/") || url.includes("..") || createHash("sha256").update(readFileSync("public" + url)).digest("hex") !== expected) throw Error("Stale partner artifact " + url);
  for (const url of [item.previewUrl, item.image, item.dataUrl, item.downloadUrl, item.licenseUrl]) if (!url || !item.review.artifactDigests[url]) throw Error("Missing partner proof " + item.id);
  if (createHash("sha256").update(readFileSync("public" + item.previewUrl)).digest("hex") !== item.review.previewDigest) throw Error("Stale partner preview " + item.id);
  for (const variant of item.variants || []) for (const url of [variant.previewUrl, variant.dataUrl, variant.downloadUrl]) if (!item.review.artifactDigests[url]) throw Error("Missing partner variant proof " + item.id);
  list.push(item);
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
  item.revision ||=
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
list.push(...buildVisualLibrary());
list.push(...buildOriginalShowcases());
list.push(buildCoralCta());
list.push(...buildFullscreenTemplates());
list.push(...buildScrollExperiences());
// Publisher sample imports are sealed against source and browser proofs; pending candidates stay out.
if (existsSync("catalog/motionsites-resources.json") && existsSync("catalog/motionsites-preview-validation.json")) {
  const candidates: LibraryResource[] = read("catalog/motionsites-resources.json");
  const proofs: { id: string; status: string; artifacts: Record<string, string> }[] = read("catalog/motionsites-preview-validation.json");
  for (const item of candidates) {
    const proof = proofs.find(p => p.id === item.id && p.status === "passed");
    if (!proof) continue;
    for (const url of [item.previewUrl, item.image, item.dataUrl, item.downloadUrl, item.licenseUrl]) if (!url || proof.artifacts[url] !== createHash("sha256").update(readFileSync("public" + url)).digest("hex")) throw Error("Unsealed MotionSites artifact " + item.id);
    list.push(item);
  }
}
list = consolidateTemplateColors(list);
customizeTemplatePreviews(list);
const libraryErrors = validateLibrary(list);
if (libraryErrors.length) throw Error(libraryErrors.join("\n"));
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
    "Reviewed retained imports, original resources and separately licensed MotionSites prompt kits. Preserve upstream and adaptation notices. Prompt references are not complete template kits. OFL fonts are not standalone resale assets. Native Figma generator execution remains unverified.",
});
console.log("Built " + list.length + " gallery resources.");
