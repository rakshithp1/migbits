import catalog from "../catalog/library/resources.json";
import { compareLibraryPresentation } from "./library-display-order";

const categoryDefinitions = [
  { id: "tools", label: "Developer tools", description: "Reviewed source kits and AI development workflows. Installation status is shown explicitly.", icon: "tools" },
  { id: "themes", label: "Themes", description: "Ready light and dark themes, coordinated gradients and typography. Preview, copy and apply.", icon: "themes" },
  { id: "backgrounds", label: "Backgrounds", description: "Static CSS patterns and decorative backgrounds, with original source and notices.", icon: "backgrounds" },
  { id: "foundations", label: "Design tokens", description: "Reusable spacing, typography, shadows and theme foundations.", icon: "foundations" },
  { id: "icons", label: "Icons", description: "Explore coherent SVG collections with their original attribution.", icon: "icons" },
  {
    id: "shaders",
    label: "Shaders",
    description:
      "GPU effects and backgrounds with verified renders. Live previews require WebGPU.",
    icon: "shaders",
  },
  {
    id: "components",
    label: "Components",
    description:
      "Buttons, forms, navigation and the small pieces that make an interface.",
    icon: "components",
  },
  {
    id: "blocks",
    label: "Blocks",
    description:
      "Complete heroes, pricing sections, navigation and more. Ready to compose.",
    icon: "blocks",
  },
  {
    id: "templates",
    label: "Templates",
    description:
      "Website templates, design briefs and reference kits for landing pages, dashboards and portfolios.",
    icon: "templates",
  },
  {
    id: "typography",
    label: "Typography",
    description:
      "Real type specimens and self-hostable fonts, with their original notices.",
    icon: "typography",
  },
  {
    id: "colors",
    label: "Colour theory",
    description:
      "Explore palettes, build color harmonies and check text contrast.",
    icon: "colors",
  },
  {
    id: "illustrations",
    label: "Illustrations",
    description:
      "Editable SVG illustrations with source, creator and license information.",
    icon: "illustrations",
  },
  {
    id: "figma",
    label: "Figma resources",
    description:
      "Original UI kits, editable vectors and native component generators for Figma.",
    icon: "figma",
  },
] as const;
const sectionOrder = ["templates", "blocks", "components", "themes", "typography", "colors", "illustrations", "figma", "icons", "backgrounds", "foundations", "motion", "shaders", "tools"];
export const resourceCategories = [...categoryDefinitions].sort((a, b) => sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id));
export type ResourceCategory = (typeof resourceCategories)[number]["id"];
export interface LibraryResource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  author: string;
  license: string;
  tags: string[];
  format: string;
  previewType:
    | "theme"
    | "motion-example"
    | "source-kit"
    | "icons"
    | "component"
    | "block"
    | "template"
    | "design-prompt"
    | "font"
    | "palette"
    | "illustration"
    | "figma";
  image?: string;
  previewUrl?: string;
  downloadUrl?: string;
  dataUrl?: string;
  sourceUrl?: string;
  componentId?: string;
  family?: string;
  variable?: boolean;
  colors?: Record<string, string>;
  accent?: string;
  featured?: number;
  licenseUrl?: string;
  usage?: string[];
  revision?: string;
  registryItem?: string;
  template?: { kind: string; pages: number; motion: boolean; motionEngine: string; original: boolean };
  originalPrompt?: string;
  prompt?: { upstreamTitle: string; upstreamCategory: string; excerptCount: number; previewMode: "live-adaptation" | "reference" | "unavailable"; implementation: "sandbox-built" | "not-compiled"; media: string[] };
  variants?: { label: string; previewUrl: string; dataUrl: string; downloadUrl: string }[];
  review?: { status: "APPROVED"; sourceDigest: string; evidence: string; notices: string[]; preview: "passed"; checkedAt: string; previewDigests?: Record<string, string> };
}
export const libraryResources = catalog as LibraryResource[];
export const librarySections = [
  ...resourceCategories.map((category) => ({
    ...category,
    count: libraryResources.filter((r) => r.category === category.id).length,
  })),
  {
    id: "motion",
    label: "Motion & backgrounds",
    description:
      "Official Motion example collections, two decorative backgrounds and six animation demos with source and downloads.",
    icon: "motion",
    count: 8 + libraryResources.filter(item => item.previewType === "motion-example").length,
  },
].filter((section) => section.count > 0 || section.id === "icons").sort((a, b) => sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id));

export function resourceUsage(item: Pick<LibraryResource, "license">) {
  if (item.license === "LicenseRef-MotionSites-Distribution") return { saleOfCopies: false, summary: "MotionSites content is distributed with separate permissions administered by MigBits. It is not covered by a general MIT grant. Preserve upstream and adaptation notices; do not assume permission to resell the prompt or media collection." };
  if (item.license === "MIT AND OFL-1.1") return { saleOfCopies: true, summary: "Code and original media: MIT. Bundled unmodified Inter font: SIL OFL 1.1. Redistribute the complete UI with both notices; the font may not be sold by itself." };
  if (item.license === "Unlicense") return { saleOfCopies: true, summary: "Creator code is dedicated to the public domain under the Unlicense, with permission to copy, modify, distribute and sell. Keep the supplied evidence; dependency and trademark rights remain separate." };
  if (item.license === "OFL-1.1") return { saleOfCopies: false, summary: "Commercial design use and redistribution with the OFL notice. Font files cannot be sold by themselves; preserve reserved-name requirements." };
  if (item.license === "CC0-1.0") return { saleOfCopies: true, summary: "Copy, modify and redistribute under the creator’s CC0 dedication. Creator credit is appreciated; trademark and endorsement rights are separate." };
  if (["MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0"].includes(item.license)) return { saleOfCopies: true, summary: "Commercial use, modification and redistribution permitted for the reviewed source. Preserve the complete copyright, license and applicable notices; retain required change notices." };
  return { saleOfCopies: false, summary: "Read this item’s exact license and attribution requirements before redistributing source or assets." };
}
export function findLibraryResources({
  category = "all",
  query = "",
}: { category?: string; query?: string } = {}) {
  const words = query.toLowerCase().replace(/colour/g, "color").replace(/templets?/g, "template").trim().split(/\s+/).filter(Boolean);
  return libraryResources
    .filter(
      (item) =>
        (category === "all" || item.category === category) &&
        words.every((word) =>
          [item.name, item.description, item.category, item.author, item.format, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(word),
        ),
    )
    .sort(compareLibraryPresentation);
}
export function categoryLabel(category: string) {
  return (
    resourceCategories.find((item) => item.id === category)?.label ||
    "All resources"
  );
}
export function relativeLuminance(hex: string) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error("Use a six-digit hex color");
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
export function contrastRatio(a: string, b: string) {
  const first = relativeLuminance(a),
    second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
