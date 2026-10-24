import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";
import type { ImportPreviewStatus } from "../lib/import-status";

const previews: ImportPreviewStatus[] = JSON.parse(readFileSync("catalog/import-previews.json", "utf8"));
for (const source of ["inspo", "magic-ui"]) {
  const archive = unzipSync(new Uint8Array(readFileSync(`public/imported/${source}/support.zip`)));
  const notices: Record<string, string> = {};
  for (const [name, bytes] of Object.entries(archive)) if (/(^|\/)(LICENSE|LICENCE|NOTICE)(\.|$)/i.test(name)) notices[`upstream/${name}`] = strFromU8(bytes);
  const sourcePreviews = previews.filter(item => item.id.startsWith(`${source}--`) && item.url);
  for (const preview of sourcePreviews) {
    const html = readFileSync(`public${preview.url}`, "utf8");
    const packageNames = new Set([...html.matchAll(/node_modules\/((?:@[^/\s]+\/)?[^/\s]+)\//g)].map(match => match[1]));
    for (const name of packageNames) {
      if (!/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)) continue;
      const folder = [path.resolve("tmp/import-preview-runtime/node_modules", name), path.resolve("node_modules", name)].find(p => existsSync(path.join(p, "package.json")));
      if (!folder) continue;
      for (const file of readdirSync(folder).filter(name => /^(LICENSE|LICENCE|NOTICE|COPYING)(\.|$)/i.test(name))) {
        try { notices[`${name}/${file}`] = readFileSync(path.join(folder, file), "utf8"); } catch { /* Some packages use a license directory. */ }
      }
    }
  }
  const noticeUrl = `/imported/${source}/previews/LICENSES.txt`;
  writeFileSync(`public${noticeUrl}`, Object.entries(notices).map(([name, text]) => `===== ${name} =====\n${text}`).join("\n\n"));
  for (const preview of sourcePreviews) {
    const file = `public${preview.url}`; let html = readFileSync(file, "utf8");
    if (!html.includes('name="source-license-notices"')) {
      html = html.replace("</head>", `<meta name="source-license-notices" content="${noticeUrl}"></head>`);
      writeFileSync(file, html);
    }
  }
  console.log(`${source}: license notices retained for ${sourcePreviews.length} preview bundles.`);
}
