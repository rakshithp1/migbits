import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { themes, themeCSS, siteThemeCSS } from "../lib/themes";
import type { LibraryResource } from "../lib/resource-library";
import review from "../resources/visual/fluent-color/review.json";

const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const hash = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
function save(url: string, content: string | Uint8Array) {
  const p = "public" + url;
  mkdirSync(p.slice(0, p.lastIndexOf("/")), { recursive: true });
  writeFileSync(p, content);
}
function artifacts(id: string, files: Record<string, string>) {
  const dataUrl = `/library/data/${id}.json`,
    downloadUrl = `/library/downloads/${id}.zip`;
  save(
    dataUrl,
    JSON.stringify(
      {
        files: Object.entries(files).map(([path, content]) => ({
          path,
          content,
        })),
        installation: [
          "Extract the archive, retain all notices and follow README.md. No global dependency installation required.",
        ],
      },
      null,
      2,
    ),
  );
  save(
    downloadUrl,
    zipSync(
      Object.fromEntries(
        Object.entries(files).map(([name, text]) => [name, strToU8(text)]),
      ),
      { mtime: new Date("2026-01-01"), level: 6 },
    ),
  );
  return { dataUrl, downloadUrl };
}
export function buildVisualLibrary(): LibraryResource[] {
  if (
    readFileSync("app/library/theme-tokens.css", "utf8").replaceAll(
      "\r\n",
      "\n",
    ) !== siteThemeCSS()
  )
    throw Error(
      "Theme tokens are stale. Run npx tsx scripts/sync-theme-tokens.ts before building.",
    );
  const ownLicense = readFileSync("resources/library/LICENSE", "utf8");
  const list: LibraryResource[] = [];
  for (const theme of themes) {
    const id = `theme-${theme.id}`;
    const css = themeCSS(theme);
    const readme = `# ${theme.name}\n\nOriginal MigBits semantic theme. Light/dark CSS variables, decorative gradient, radius and typography roles.\n\n1. Copy theme.css into your application's global styles.\n2. Map the semantic variables through your existing Tailwind v4/shadcn @theme inline configuration. Add .dark to your theme root for dark mode.\n3. Headings: ${theme.headingFont}; body: ${theme.bodyFont}; code: ${theme.monoFont}. Font binaries are NOT included. Get the individually licensed families at https://migbits.com/library/typography and preserve their OFL notices.\n4. Keep text on opaque semantic backgrounds; the decorative gradient is not a contrast-certified text surface.\n5. Check keyboard focus, forced colors, disabled states and contrast in your final components.\n\nCSS/theme data: MIT; retain LICENSE.txt.\n`;
    const output = artifacts(id, {
      "theme.css": css,
      "theme.json": JSON.stringify(theme, null, 2),
      "README.md": readme,
      "LICENSE.txt": ownLicense,
    });
    const image = `/library/thumbnails/${id}.svg`;
    const t = theme.modes.light;
    save(
      image,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><title>${escape(theme.name)} theme</title><defs><linearGradient id="g"><stop stop-color="${t.primary}"/><stop offset="1" stop-color="${theme.modes.dark.primary}"/></linearGradient></defs><rect width="640" height="420" fill="${t.background}"/><rect width="640" height="125" fill="url(#g)"/><rect x="35" y="65" width="570" height="320" rx="${theme.radiusRem * 18}" fill="${t.card}" stroke="${t.border}"/><text x="64" y="115" fill="${t.foreground}" font-family="${escape(theme.headingFont)},serif" font-size="28">${escape(theme.name)}</text><text x="64" y="145" fill="${t["muted-foreground"]}" font-family="sans-serif" font-size="13">${escape(theme.headingFont)} / ${escape(theme.bodyFont)}</text><rect x="64" y="175" width="290" height="88" rx="12" fill="${t.muted}"/><text x="82" y="212" fill="${t.foreground}" font-family="sans-serif" font-size="22">Make room for good work.</text><rect x="64" y="286" width="165" height="42" rx="8" fill="${t.primary}"/><text x="86" y="312" fill="${t["primary-foreground"]}" font-family="sans-serif" font-size="14">Create something</text>${[t.primary, theme.modes.dark.primary, t.secondary, t.foreground].map((c, i) => `<rect x="${390 + (i % 2) * 82}" y="${178 + Math.floor(i / 2) * 82}" width="64" height="64" rx="16" fill="${c}"/>`).join("")}</svg>`,
    );
    list.push({
      id,
      name: theme.name,
      description: `${theme.style} styling with ${theme.headingFont}, coordinated semantic colors, decorative gradients and complete light/dark tokens.`,
      category: "themes",
      previewType: "theme",
      author: "MigBits contributors",
      license: "MIT",
      licenseUrl: "/library/LICENSE.txt",
      sourceUrl:
        "https://github.com/rakshithp1/migbits/tree/main/resources/library",
      format: "CSS · Tailwind / shadcn",
      tags: [
        "Ready theme",
        theme.style,
        theme.headingFont,
        "Light and dark",
        "Gradients",
      ],
      image,
      ...output,
      revision: "migbits-themes-1.0.0",
      featured: 12,
    });
  }
  const directory = "resources/visual/fluent-color/";
  const license = readFileSync(directory + "LICENSE", "utf8"),
    notice = readFileSync(directory + "NOTICE", "utf8");
  if (
    review.status !== "APPROVED" ||
    review.license !== "MIT" ||
    hash(license) !== review.licenseSHA256 ||
    hash(notice) !== review.noticeSHA256
  )
    throw Error("Color icon license scope changed; re-review required");
  const motion = readFileSync("resources/visual/icon-motion.css", "utf8");
  const files: Record<string, string> = {
    "LICENSE-Microsoft.txt": license,
    "NOTICE-Microsoft.txt": notice,
    "LICENSE-MigBits.txt": ownLicense,
    "icon-motion.css": motion,
    "PROVENANCE.json": JSON.stringify(review, null, 2),
    "README.md":
      "# Color icons and original motion\n\n16 reviewed generic Microsoft Fluent SVGs. Keep Microsoft's MIT license and complete NOTICE. Original upstream SVGs are under original/; attributed copies under icons/ add license metadata. MigBits motion CSS is separate original MIT code. No brand marks are included.\n\nUse an img.migbits-color-glyph inside a container with data-effect=bob|tilt|pulse|turn|pop|swing|none. Set data-playing=true to animate or use a focusable button for hover/focus motion. Include icon-motion.css. Reduced-motion users get static icons.\n",
  };
  let preview = "";
  review.items.forEach((item, i) => {
    const raw = readFileSync(directory + item.file, "utf8");
    if (hash(raw) !== item.sha256) throw Error("Color SVG changed: " + item.id);
    if (
      /<script|<foreignObject|\son\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(
        raw,
      )
    )
      throw Error("Unsafe color SVG: " + item.id);
    const attributed = raw.replace(
      /(<svg\b[^>]*>)/,
      `$1<metadata>${escape(license + "\n" + notice + "\nUpstream: " + item.sourceUrl + "\nAdaptation: license metadata added by MigBits; geometry unmodified.")}</metadata>`,
    );
    save(`/library/icons/fluent/${item.id}.svg`, attributed);
    files[`original/${item.file}`] = raw;
    files[`icons/${item.file}`] = attributed;
    // Prefix gradient IDs when embedding multiple independent SVGs in one thumbnail.
    const embedded = raw
      .replace(/id="([^"]+)"/g, `id="icon${i}-$1"`)
      .replace(/url\(#([^\)]+)\)/g, `url(#icon${i}-$1)`)
      .replace(
        /<svg\b/,
        `<svg x="${42 + (i % 8) * 74}" y="${140 + Math.floor(i / 8) * 100}"`,
      )
      .replace(/width="\d+"/, `width="52"`)
      .replace(/height="\d+"/, `height="52"`);
    preview += embedded;
  });
  const id = "fluent-color-motion";
  const output = artifacts(id, files);
  const image = "/library/thumbnails/fluent-color-motion.svg";
  save(
    image,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><title>Fluent color icons with original MigBits motion</title><rect width="640" height="420" rx="18" fill="#f1f5f9"/><text x="42" y="65" font-family="sans-serif" font-size="26" fill="#0f172a">A little more personality.</text><text x="42" y="95" font-family="sans-serif" font-size="15" fill="#475569">16 color icons · 6 motion recipes</text>${preview}</svg>`,
  );
  save("/library/licenses/fluent-color.txt", license + "\n\n" + notice);
  list.push({
    id,
    name: "Fluent color + motion",
    description:
      "16 multicolor SVGs with six original CSS motion presets. Search, copy attributed SVGs and download the complete source with notices.",
    category: "icons",
    previewType: "icons",
    author: "Microsoft Corporation · motion by MigBits contributors",
    license: "MIT",
    licenseUrl: "/library/licenses/fluent-color.txt",
    sourceUrl: `https://github.com/microsoft/fluentui-system-icons/tree/${review.revision}`,
    revision: review.revision,
    format: "SVG · CSS",
    tags: [
      "Color icons",
      "Animated icons",
      "Reduced motion",
      "SVG",
      "Microsoft Fluent",
    ],
    image,
    ...output,
    featured: 8,
  });
  return list;
}
