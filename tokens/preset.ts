export const accents = { violet: "#7c3aed", blue: "#2563eb", emerald: "#047857", rose: "#be185d" } as const;
export interface BrandPreset { schemaVersion: 1; resourceVersion: "0.1.0-preview.1"; accent: keyof typeof accents; radius: 6 | 12 | 20; density: "comfortable" | "compact"; theme: "light" | "dark" }
export const defaultPreset: BrandPreset = { schemaVersion: 1, resourceVersion: "0.1.0-preview.1", accent: "violet", radius: 12, density: "comfortable", theme: "light" };
export type PresetResult = { ok: true; value: BrandPreset } | { ok: false; error: string };
export function parsePreset(input: unknown): PresetResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Choose a valid Migbits preset object." };
  const p = input as Record<string, unknown>;
  const fields = Object.keys(defaultPreset);
  if (Object.keys(p).some(key => !fields.includes(key))) return { ok: false, error: "Preset contains unsupported fields. Your last valid settings are unchanged." };
  if (p.schemaVersion !== 1 || p.resourceVersion !== defaultPreset.resourceVersion) return { ok: false, error: "This preset uses an unsupported schema or resource version." };
  if (typeof p.accent !== "string" || !Object.hasOwn(accents, p.accent)) return { ok: false, error: "Choose one of the supported accent colors." };
  if (![6, 12, 20].includes(p.radius as number)) return { ok: false, error: "Corner radius must be 6, 12, or 20." };
  if (p.density !== "comfortable" && p.density !== "compact") return { ok: false, error: "Choose a supported density." };
  if (p.theme !== "light" && p.theme !== "dark") return { ok: false, error: "Choose light or dark theme." };
  return { ok: true, value: { schemaVersion: 1, resourceVersion: defaultPreset.resourceVersion, accent: p.accent as BrandPreset["accent"], radius: p.radius as BrandPreset["radius"], density: p.density, theme: p.theme } };
}
export function serializePreset(preset: BrandPreset): string {
  const result = parsePreset(preset);
  if (!result.ok) throw new Error(result.error);
  return JSON.stringify(result.value, null, 2);
}
export function presetVariables(preset: BrandPreset) {
  return { "--resource-accent": accents[preset.accent], "--resource-radius": `${preset.radius}px`, "--resource-space": preset.density === "compact" ? "14px" : "22px" };
}
