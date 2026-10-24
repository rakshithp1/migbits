import type { Resource } from "./schema";

export const resources: Resource[] = [{
  id: "migbits.profile-settings", slug: "profile-settings", category: "blocks",
  title: "Profile settings", summary: "A considered account settings screen with real form validation, editable brand tokens, and honest state previews.",
  tags: ["settings", "account", "forms", "saas", "profile"],
  synonyms: ["preferences", "identity", "user", "edit account", "configuration", "dashboard"],
  version: "0.1.0-preview.1", schemaVersion: 1, status: "draft",
  formats: ["react-tsx", "css"],
  files: [
    { path: "resources/profile-settings/profile-settings.tsx", role: "source" },
    { path: "resources/profile-settings/profile-settings.css", role: "styles" },
    { path: "resources/profile-settings/model.ts", role: "source" },
    { path: "tokens/preset.ts", role: "source" },
    { path: "resources/profile-settings/README.md", role: "documentation" },
  ],
  dependencies: [{ name: "react", testedVersion: "19.3.0", kind: "peer" }], resourceDependencies: [],
  supportedRuntimes: [
    { name: "Next.js", version: "16.4.2", evidence: "website-build" },
    { name: "Standalone React consumer", version: "React 19.3.0 / TypeScript 5.9.3 / esbuild 0.28.2", evidence: "consumer-build" },
    { name: "Cloudflare Workers adapter", version: "not yet tested", evidence: "untested" },
  ],
  tokenSchema: "migbits.brand-preset@1", controls: ["accent", "radius", "density", "theme"],
  states: ["default", "loading", "error", "empty", "success"],
  examples: ["Personal profile", "Empty profile", "Simulated save failure"],
  fallback: "Semantic form controls remain usable without animation. Persistence is supplied by the host application's onSave callback.",
  testEvidence: [
    { check: "Schema and dependency graph", status: "passed", detail: "Catalog shape, source file existence, and dependency graph validation passed during Phase 1. Re-run npm run validate:catalog after changes." },
    { check: "Preset boundaries and form validation", status: "passed", detail: "Eight foundation tests passed during Phase 1. Re-run npm test after changes. Browser interaction review is separate." },
    { check: "Browser and keyboard review", status: "pending", detail: "No browser review recorded; not a WCAG conformance claim." },
    { check: "Clean consumer installation", status: "passed", detail: "Fresh locked install, strict typecheck, standalone JS/CSS build, and 48 preset SSR markup combinations passed. Browser visual parity remains untested. Run npm run test:consumer." },
  ],
  license: { status: "pending-owner-decision", identifier: null, notice: "Original Migbits draft. Redistribution license has not been selected. Preview is available; public source distribution is deferred." },
  provenance: { author: "Migbits project", origin: "Original source authored in this repository", modifications: [], attribution: [] },
  accessClass: "public",
  changelog: [{ version: "0.1.0-preview.1", changes: ["Initial local preview with shared brand preset, validation, and explicit simulated save states."] }],
}];

export function getResource(slug: string): Resource | undefined { return resources.find(resource => resource.slug === slug); }
export function searchResources(query: string, category = "all"): Resource[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return resources.filter(resource => resource.status !== "withdrawn" && (category === "all" || resource.category === category) && terms.every(term => [resource.title, resource.summary, ...resource.tags, ...resource.synonyms].join(" ").toLowerCase().includes(term)));
}
export function getPublicMetadata() {
  return resources.filter(resource => resource.status === "published").map(({ id, slug, category, title, summary, tags, version, formats, accessClass }) => ({ id, slug, category, title, summary, tags, version, formats, accessClass }));
}
