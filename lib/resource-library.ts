import catalog from "../catalog/library/resources.json";

export const resourceCategories = [
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
      "Complete starting points for landing pages, dashboards and portfolios.",
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
    label: "Colors & theory",
    description:
      "Explore palettes, build color harmonies and check text contrast.",
    icon: "colors",
  },
  {
    id: "illustrations",
    label: "Illustrations",
    description:
      "Original, editable SVGs. Pick a color and make them your own.",
    icon: "illustrations",
  },
  {
    id: "figma",
    label: "Figma UI kits",
    description:
      "Original UI kits, editable vectors and native component generators for Figma.",
    icon: "figma",
  },
] as const;
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
    | "component"
    | "block"
    | "template"
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
}
export const libraryResources = catalog as LibraryResource[];
const sectionOrder = [
  "components",
  "icons",
  "blocks",
  "templates",
  "typography",
  "colors",
  "illustrations",
  "figma",
  "motion",
];
export const librarySections = [
  ...resourceCategories.map((category) => ({
    ...category,
    count: libraryResources.filter((r) => r.category === category.id).length,
  })),
  {
    id: "icons",
    label: "Icons",
    description:
      "Find, customize, copy and download 36 Lucide SVG icons with their notices.",
    icon: "icons",
    count: 36,
  },
  {
    id: "motion",
    label: "Motion & backgrounds",
    description:
      "Two decorative backgrounds and six real animation demos with source and downloads.",
    icon: "motion",
    count: 8,
  },
].sort((a, b) => sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id));
export function findLibraryResources({
  category = "all",
  query = "",
}: { category?: string; query?: string } = {}) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return libraryResources
    .filter(
      (item) =>
        (category === "all" || item.category === category) &&
        words.every((word) =>
          [item.name, item.description, item.author, item.format, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(word),
        ),
    )
    .sort(
      (a, b) =>
        (a.featured ?? 1000) - (b.featured ?? 1000) ||
        a.name.localeCompare(b.name, "en"),
    );
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
