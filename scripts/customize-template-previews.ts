import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { templateColorRuntime } from "../lib/template-colors";
import type { LibraryResource } from "../lib/resource-library";

/** Derive display-only editions after original source/hash verification. Downloads remain upstream editions. */
export function customizeTemplatePreviews(items: LibraryResource[]) {
  const report: { id: string; pages: number; status: string; artifacts: { url: string; sha256: string; originalUrl: string; originalSha256: string }[] }[] = [];
  for (const item of items.filter(item => item.previewType === "template")) {
    const mobileFixes: Record<string, string> = {
      "approved-collection-hr-dashboard": ".leave{flex-wrap:wrap}.leave .acts{flex-wrap:wrap;max-width:100%}",
      "approved-collection-web-development-agency": ".rings{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px}.ring{min-width:0;padding:20px 12px}.ring svg{max-width:100%;height:auto}",
      "approved-collection-university": ".hc{min-width:0;max-width:100%}.hs input{min-width:0;width:100%}",
      "approved-collection-cafe-coffee-shop": ".loyal{padding:20px!important}.loyal>*{min-width:0}.stamps{grid-template-columns:repeat(5,minmax(0,1fr))!important}.stamps button{width:100%;max-width:100%}",
    };
    const pages = new Map<string, string>();
    const artifacts: { url: string; sha256: string; originalUrl: string; originalSha256: string }[] = [];
    for (const url of [item.previewUrl, ...(item.variants || []).map(v => v.previewUrl)]) {
      if (!url || pages.has(url)) continue;
      const html = readFileSync("public" + url, "utf8");
      const target = `/library/customized/${item.id}/${path.basename(url)}`;
      mkdirSync(path.dirname("public" + target), { recursive: true });
      const mobile = mobileFixes[item.id] ? `<style>@media(max-width:480px){${mobileFixes[item.id]}}</style>` : "";
      writeFileSync("public" + target, html.replace(/<\/body>/i, `${mobile}<script>${templateColorRuntime}</script></body>`));
      artifacts.push({ url: target, sha256: createHash("sha256").update(readFileSync("public" + target)).digest("hex"), originalUrl: url, originalSha256: createHash("sha256").update(html).digest("hex") });
      pages.set(url, target);
    }
    if (item.previewUrl) item.previewUrl = pages.get(item.previewUrl)!;
    item.variants = item.variants?.map(v => ({ ...v, previewUrl: pages.get(v.previewUrl)! }));
    report.push({ id: item.id, pages: pages.size, artifacts, status: "derived from approved preview; original source and downloads preserved" });
  }
  writeFileSync("catalog/library/template-color-previews.json", JSON.stringify(report, null, 2) + "\n");
}
