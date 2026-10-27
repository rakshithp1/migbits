import type { LibraryResource } from "./resource-library";

/** Editorial visual order, not a popularity or licensing score. */
const showcase = [
  "template-relay-software", "template-velocity-running", "template-squeeze-citrus", "template-cascade-automation", "template-concrete-sneakers", "template-popwave-soda", "template-prism-analytics", "template-form-footwear", "template-stillwater-tea", "template-haven-security", "template-syntax-api", "template-papertrail-knowledge",
  "template-coral-horizon", "template-orbit-cloud", "template-folio-studio", "template-signal-developer", "template-afterhours-release", "template-monument-spaces",
  "template-atlas", "template-coral-signup", "template-sonic", "template-margin", "template-stride", "template-gather", "theme-ocean", "magic-ui--globe",
  "approved-collection-travel-agency", "template-pulse", "fluent-color-motion", "theme-electric-mint",
  "shaders--boids", "approved-collection-productivity-app", "theme-indigo-editorial", "shaders--aurora",
  "approved-template-modern-business", "approved-template-agency", "inspo--hero-split-screen", "inspo--features-bento",
  "approved-kokonut-ui-liquid-slider", "approved-kokonut-ui-wheel-picker", "magic-ui--bento-grid",
  "magic-ui--terminal", "magic-ui--shimmer-button", "magic-ui--animated-list", "magic-ui--code-comparison",
];
const positions = new Map(showcase.map((id, index) => [id, index]));
const motionOrder = ["layout", "presence", "reorder", "svg", "drag", "gestures", "animation", "hooks", "waapi", "lazy-loading"];
export function visualPriority(item: LibraryResource) {
  const picked = positions.get(item.id);
  if (picked !== undefined) return picked;
  if (["templates", "themes", "illustrations", "icons"].includes(item.category)) return 100;
  if (item.category === "blocks") return 200;
  if (item.id.startsWith("magic-ui--") || item.id.startsWith("approved-kokonut")) return 250;
  if (item.category === "shaders") return 300;
  if (item.previewType === "motion-example") { const index = motionOrder.indexOf(item.family || ""); return 600 + (index < 0 ? 100 : index); }
  if (item.previewType === "source-kit") return 800;
  return 500;
}
export function compareLibraryPresentation(a: LibraryResource, b: LibraryResource) {
  return visualPriority(a) - visualPriority(b) || (a.featured ?? 1000) - (b.featured ?? 1000) || a.name.localeCompare(b.name, "en");
}
