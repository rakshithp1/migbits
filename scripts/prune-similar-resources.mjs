import {
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  statSync,
} from "node:fs";
import path from "node:path";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const save = (p, data) =>
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
const catalog = read("catalog/library/resources.json");
const policyPath = "catalog/library/curation.json";
let policy;
if (existsSync(policyPath)) policy = read(policyPath);
else {
  const blocks = new Set(
    [
      "cta-banded",
      "cta-form-led",
      "faq-accordion",
      "features-bento",
      "features-alternating",
      "features-workbench",
      "footer-sitemap",
      "hero-split-screen",
      "hero-manifesto",
      "pricing-three-card",
      "pricing-toggle",
      "stat-bar-chart",
      "stat-before-after",
      "testimonial-cinematic",
      "testimonial-mosaic",
    ].map((id) => "inspo--" + id),
  );
  const helpers = new Set(
    [
      "aspect-ratio",
      "direction",
      "kbd",
      "label",
      "marker",
      "separator",
      "field",
      "button-group",
      "native-select",
      "sonner",
      "collapsible",
      "message",
      "typography",
    ].map((id) => "component-" + id),
  );
  const templates = new Set([
    "template-atlas",
    "template-pulse",
    "template-gather",
  ]);
  const palettes = catalog.filter((r) => r.category === "colors");
  const channels = (r) =>
    ["Primary", "Secondary", "Accent", "Background", "Foreground"].flatMap(
      (k) =>
        [1, 3, 5].map((i) => parseInt(r.colors[k].slice(i, i + 2), 16) / 255),
    );
  const distance = (a, b) =>
    Math.sqrt(
      channels(a).reduce((sum, n, i) => sum + (n - channels(b)[i]) ** 2, 0) /
        15,
    );
  const selected = [
    palettes.find((p) => p.id === "ui-ux-pro-max--colors-1") || palettes[0],
  ];
  while (selected.length < 16) {
    const candidates = palettes.filter(
      (p) => !selected.some((s) => s.colors.Primary === p.colors.Primary),
    );
    const next = candidates
      .map((p) => ({ p, d: Math.min(...selected.map((s) => distance(p, s))) }))
      .sort((a, b) => b.d - a.d || a.p.id.localeCompare(b.p.id))[0];
    if (!next) break;
    selected.push(next.p);
  }
  const paletteIds = new Set(selected.map((r) => r.id)),
    removed = [],
    retained = [];
  const exact = new Map();
  for (const item of catalog) {
    let reason = "",
      replacementId;
    if (item.category === "blocks" && !blocks.has(item.id))
      reason =
        "Visually repetitive reference block: same cream editorial treatment or a sparse preview. Keep structurally distinct representatives.";
    if (item.category === "components" && helpers.has(item.id)) {
      reason =
        "Helper-only or overlapping component demo; keep the stronger standalone pattern. Source dependencies remain in the complete attributed component pack.";
      replacementId =
        item.id === "component-sonner"
          ? "component-toast"
          : item.id === "component-collapsible"
            ? "component-accordion"
            : item.id === "component-native-select"
              ? "component-select"
              : item.id === "component-message"
                ? "component-bubble"
                : item.id === "component-field"
                  ? "component-form"
                  : undefined;
    }
    if (item.category === "templates" && !templates.has(item.id)) {
      reason =
        "Repeats the same two-column illustration hero and card layout as Atlas; retain distinct dashboard, SaaS and dark event starting points.";
      replacementId = "template-atlas";
    }
    if (item.category === "figma" && item.id !== "figma-studio") {
      reason =
        "Same SVG board and native component structure with different names and accent colors.";
      replacementId = "figma-studio";
    }
    if (item.category === "colors") {
      const signature = JSON.stringify(item.colors),
        duplicate = exact.get(signature);
      if (!duplicate) exact.set(signature, item.id);
      if (!paletteIds.has(item.id)) {
        const closest = selected
          .map((p) => ({ p, d: distance(item, p) }))
          .sort((a, b) => a.d - b.d)[0];
        reason = duplicate
          ? "Exact duplicate semantic color tokens; category names do not create a distinct palette."
          : "Near-duplicate color family. Keep a diverse representative set with unique primary colors.";
        replacementId = closest.p.id;
      }
    }
    if (reason)
      removed.push({
        ...item,
        reason,
        ...(replacementId ? { replacementId } : {}),
      });
    else retained.push(item.id);
  }
  policy = {
    reviewedAt: "2026-10-25",
    method:
      "Manual contact-sheet review of block, component, template, illustration and Figma previews. Palettes: exact token duplicate checks and a deterministic farthest-first spread across five visible colors, with unique primary colors. Different fonts, illustration subjects and meaningful interactions remain distinct.",
    originalCount: catalog.length,
    retainedIds: retained,
    removed,
    originalCounts: Object.fromEntries(
      [...new Set(catalog.map((r) => r.category))].map((c) => [
        c,
        catalog.filter((r) => r.category === c).length,
      ]),
    ),
  };
  save(policyPath, policy);
}
const allowed = new Set(policy.retainedIds),
  removedIds = new Set(policy.removed.map((r) => r.id));
const keep = catalog.filter((r) => allowed.has(r.id));
const shared = new Set(
  keep
    .flatMap((r) => [r.image, r.dataUrl, r.downloadUrl, r.previewUrl])
    .filter(Boolean),
);
const roots = ["public/library", "public/imported"].map((p) => path.resolve(p));
function remove(url) {
  if (!url || shared.has(url) || !/^\/(library|imported)\//.test(url)) return;
  const target = path.resolve("public" + url);
  if (!roots.some((root) => target.startsWith(root + path.sep)))
    throw Error("Deletion outside generated assets");
  if (existsSync(target)) {
    if (!statSync(target).isFile()) throw Error("Expected individual file");
    unlinkSync(target);
  }
}
for (const item of policy.removed)
  for (const key of ["image", "dataUrl", "downloadUrl", "previewUrl"])
    remove(item[key]);
const imports = read("catalog/import-index.json"),
  retainedImports = imports.filter((r) => !removedIds.has(r.id));
for (const item of imports.filter((r) => removedIds.has(r.id))) {
  remove(item.dataUrl);
  remove(item.downloadUrl);
}
const previews = read("catalog/import-previews.json");
for (const preview of previews.filter((p) => removedIds.has(p.id))) {
  remove(preview.url);
  if (preview.url) remove(preview.url.replace(/\.html$/, ".LICENSES.txt"));
}
save("catalog/import-index.json", retainedImports);
save(
  "catalog/import-previews.json",
  previews.filter((p) => !removedIds.has(p.id)),
);
const report = read("catalog/import-report.json");
for (const source of report.sources) {
  const count = retainedImports.filter((r) => r.source === source.id).length;
  const delta = imports.filter((r) => r.source === source.id).length - count;
  if (delta) {
    source.removed = (source.removed || 0) + delta;
    source.imported = count;
    source.sourceChecked = count;
    source.reason =
      "Retained after rights review and visual similarity curation; repetitive records removed from current delivery.";
  }
}
save("catalog/import-report.json", report);
save("catalog/library/resources.json", keep);
if (existsSync("catalog/library/preview-validation.json"))
  save(
    "catalog/library/preview-validation.json",
    read("catalog/library/preview-validation.json").filter((p) =>
      allowed.has(p.id),
    ),
  );
console.log(
  "Retained " +
    keep.length +
    " distinct resources; removed " +
    policy.removed.length +
    ".",
);
