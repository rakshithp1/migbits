import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const sources = read("catalog/approved-resources.json") as { id: string; review: { status: string; preview: string; sourceDigest: string }; originalReviewKey: string }[];
const items = [];
mkdirSync("public/r", { recursive: true });
for (const resource of sources) {
  const dir = `resources/approved/${resource.id}`;
  const review = read(`${dir}/review.json`);
  if (review.kind !== "component") continue;
  if (resource.review.status !== "APPROVED" || resource.review.preview !== "passed" || resource.review.sourceDigest !== review.sourceDigest) throw Error("Unapproved registry item");
  const name = `migbits-${review.name}`;
  const destination = `components/migbits/${review.name}`;
  const dependencies = new Set(["clsx@2.1.1", "tailwind-merge@3.7.0"]);
  const files = [];
  for (const originalPath of review.files as string[]) {
    const content = readFileSync(`${dir}/original/${originalPath}`, "utf8");
    if (createHash("sha256").update(content).digest("hex") !== review.checksums[originalPath]) throw Error("Changed registry source");
    for (const [needle, dependency] of [["motion/react", "motion@14.6.0"], ["lucide-react", "lucide-react@1.61.0"], ["@radix-ui/react-use-controllable-state", "@radix-ui/react-use-controllable-state@1.3.0"], ["class-variance-authority", "class-variance-authority@0.7.1"]]) if (content.includes(needle)) dependencies.add(dependency);
    const basename = path.basename(originalPath);
    if (!/\.(tsx|css)$/.test(basename) && !/LICENSE|NOTICES/.test(basename)) continue;
    files.push({ path: `${name}/${basename}`, type: "registry:file", target: `${destination}/${basename}`, content: /\.tsx$/.test(basename) ? '"use client";\n// MigBits installation adaptation: scoped cn import; original source is preserved in the ZIP.\n' + content.replaceAll('"use client";', "").replaceAll('"@/lib/utils"', '"./utils"') : content });
  }
  files.push({ path: `${name}/utils.ts`, type: "registry:file", target: `${destination}/utils.ts`, content: 'import {clsx,type ClassValue} from "clsx";import {twMerge} from "tailwind-merge";export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs))}\n' });
  const item = { $schema: "https://ui.shadcn.com/schema/registry-item.json", name, type: "registry:component", title: review.name, description: "Reviewed upstream component with scoped MigBits installation adaptation. Preserve the included copyright and dependency notices.", author: review.author, dependencies: [...dependencies].sort(), files, meta: { migbits: { resourceId: resource.id, sourceDigest: review.sourceDigest, source: review.sourceURL, upstreamRevision: review.revision, license: "MIT", adaptations: ["Client directive and scoped cn helper import for consumer installation; original bytes remain in source ZIP."] } }, docs: `Import ${review.name === "choice-poll" ? "{ChoicePoll}" : "the default component"} from ${destination}/${path.basename(review.primary)}. Read the original prop interfaces before use. CSS files must remain adjacent. No server backend or accessibility certification is implied.` };
  writeFileSync(`public/r/${name}.json`, JSON.stringify(item, null, 2) + "\n");
  items.push(item);
}
writeFileSync("public/r/registry.json", JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry.json", name: "migbits", homepage: "https://migbits.com", items }, null, 2) + "\n");
console.log(`Generated ${items.length} scoped standard registry items.`);
