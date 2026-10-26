import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import type { LibraryResource } from "../lib/resource-library";

/** Conservative: identical structure AND CSS after colour normalization, not shared artwork. */
export function consolidateTemplateColors(items: LibraryResource[]) {
  const fingerprints = new Map<string, LibraryResource>();
  const aliases: { id: string; canonicalId: string; reason: string }[] = [];
  for (const item of items.filter(r => r.category === "templates" && r.previewUrl)) {
    const html = readFileSync("public" + item.previewUrl, "utf8");
    const normalize = (s: string) => s.replace(/#[a-f0-9]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)/gi, "COLOR").replace(/\s+/g, "");
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => normalize(m[1])).join("");
    const body = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/\s(?:href|src|alt|title|aria-label)=["'][^"']*["']/gi, "").replace(/>[^<]+</g, "><");
    const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join("\n");
    const key = createHash("sha256").update(css + normalize(body) + scripts).digest("hex");
    const canonical = fingerprints.get(key);
    if (!canonical) fingerprints.set(key, item);
    else aliases.push({ id: item.id, canonicalId: canonical.id, reason: "Identical template structure and styles after colour/content normalization; use canonical colour selector." });
  }
  writeFileSync("catalog/library/template-consolidation.json", JSON.stringify({ checked: fingerprints.size + aliases.length, unique: fingerprints.size, aliases, rule: "Shared decorative artwork alone is not proof of a duplicate layout." }, null, 2) + "\n");
  return items.filter(item => !aliases.some(alias => alias.id === item.id));
}
