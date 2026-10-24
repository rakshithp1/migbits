export const taxonomy = [
  { id: "foundations", title: "Foundations" },
  { id: "svg-assets", title: "SVG assets" },
  { id: "backgrounds", title: "Backgrounds" },
  { id: "elements", title: "Elements" },
  { id: "components", title: "Components" },
  { id: "motion", title: "Motion" },
  { id: "blocks", title: "Blocks" },
  { id: "pages", title: "Pages" },
  { id: "templates", title: "Templates" },
] as const;
export type Category = (typeof taxonomy)[number]["id"];
export type ResourceStatus = "draft" | "reviewed" | "published" | "deprecated" | "withdrawn";
export interface Resource {
  id: string; slug: string; category: Category; title: string; summary: string;
  tags: string[]; synonyms: string[]; version: string; schemaVersion: 1; status: ResourceStatus;
  formats: ("react-tsx" | "css" | "svg")[];
  files: { path: string; role: "source" | "styles" | "documentation" }[];
  dependencies: { name: string; testedVersion: string; kind: "peer" | "package" }[];
  resourceDependencies: string[];
  supportedRuntimes: { name: string; version: string; evidence: "website-build" | "consumer-build" | "untested" }[];
  tokenSchema: string; controls: string[]; states: string[]; examples: string[]; fallback: string;
  testEvidence: { check: string; status: "passed" | "pending"; detail: string }[];
  license: { status: "pending-owner-decision" | "approved"; identifier: string | null; notice: string };
  provenance: { author: string; origin: string; modifications: string[]; attribution: string[] };
  accessClass: "public" | "premium";
  changelog: { version: string; changes: string[] }[];
}
