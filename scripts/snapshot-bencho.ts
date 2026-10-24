import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { zipSync, strToU8 } from "fflate";
import ts from "typescript";

// Parse only literal data from the site's public Code-pane payload. Never evaluate
// the downloaded JavaScript, contact account APIs, or request Pro implementation.
function literal(node: ts.Expression): unknown {
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) return !literal(node.operand);
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "split" && ts.isStringLiteralLike(node.expression.expression) && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) return node.expression.expression.text.split(node.arguments[0].text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(value => literal(value as ts.Expression));
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(property => {
    if (!ts.isPropertyAssignment(property) || !property.name || ts.isComputedPropertyName(property.name)) throw new Error("Unexpected nonliteral source property");
    const key = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : "";
    if (!key || key === "__proto__") throw new Error("Invalid source property");
    return [key, literal(property.initializer)];
  }));
  throw new Error(`Unexpected executable expression in source data: ${ts.SyntaxKind[node.kind]} ${node.getText().slice(0, 80)}`);
}
async function get(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Bencho HTTP ${response.status}`);
  return response.text();
}
async function main() {
  const bundleUrl = "https://bencho.dev/assets/blocks-AqfnMsHN.js";
  const freeListUrl = "https://bencho.dev/assets/free-CS27mm_V.js";
  const [source, freeSource] = await Promise.all([get(bundleUrl), get(freeListUrl)]);
  const freeIds = /^var e=`([^`]+)`\.split\(`\.`\)/.exec(freeSource)?.[1].split(".");
  if (!freeIds?.length) throw new Error("Free-plan eligibility list changed; manual review required");
  const ast = ts.createSourceFile("blocks.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const statement = ast.statements.find(ts.isVariableStatement);
  const initializer = statement?.declarationList.declarations[0].initializer;
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) throw new Error("Source payload shape changed");
  const blocks = literal(initializer) as Record<string, { name: string; tsx: string; css: string; pro?: boolean; deps: string[]; tokens: string[]; stubs: string[] }>;
  // Full MIT text is captured from the rendered official license page, not from
  // third-party directory descriptions (which can lag behind the free/Pro split).
  const renderedTerms = readFileSync("tmp/bencho.dev-terms.txt", "utf8");
  const start = renderedTerms.indexOf("MIT License\n"), end = renderedTerms.indexOf("Something here unclear", start);
  if (start < 0 || end < 0 || !renderedTerms.includes("Free blocks: MIT")) throw new Error("Capture the rendered official license page before snapshotting");
  const license = renderedTerms.slice(start, end).trim() + "\n";
  const entries: Record<string, Uint8Array> = { "bencho/LICENSE": strToU8(license) };
  const manifest = { bundleUrl, freeListUrl, licenseUrl: "https://bencho.dev/licence", bundleSha256: createHash("sha256").update(source).digest("hex"), freeListSha256: createHash("sha256").update(freeSource).digest("hex"), licenseSha256: createHash("sha256").update(license).digest("hex"), discovered: Object.keys(blocks).length, excludedPro: Object.keys(blocks).filter(id => !freeIds.includes(id)).length, freeIds, items: [] as { id: string; name: string; dependencies: string[]; tokens: string[]; stubs: string[]; status: string }[] };
  for (const id of freeIds) {
    const block = blocks[id];
    if (!block || block.pro || !block.tsx) throw new Error(`Free block source missing or protected: ${id}`);
    entries[`bencho/src/blocks/${id}.tsx`] = strToU8(block.tsx);
    entries[`bencho/src/blocks/${id}.css`] = strToU8(block.css);
    manifest.items.push({ id, name: block.name, dependencies: block.deps, tokens: block.tokens, stubs: block.stubs, status: "license-verified" });
  }
  entries["bencho/manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));
  mkdirSync("catalog/upstream", { recursive: true });
  writeFileSync("catalog/upstream/bencho.zip", zipSync(entries, { level: 6, mtime: new Date("2026-01-01T00:00:00Z") }));
  writeFileSync("catalog/upstream/bencho.json", JSON.stringify(manifest, null, 2) + "\n");
  const sources = JSON.parse(readFileSync("catalog/import-sources.json", "utf8"));
  Object.assign(sources.find((item: { id: string }) => item.id === "bencho"), { status: "ready", snapshot: "catalog/upstream/bencho.zip", revision: createHash("sha1").update(source).digest("hex"), revisionType: "public-payload-sha1", license: "MIT", adapter: "bencho-free", reason: "Import every block on the pinned free-plan list using the public Code-pane source. Pro blocks, photographs and site application code are excluded. CSS tokens and image stubs require integration." });
  writeFileSync("catalog/import-sources.json", JSON.stringify(sources, null, 2) + "\n");
  console.log(`Snapshotted ${manifest.items.length} MIT free blocks; no Pro implementation requested.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
