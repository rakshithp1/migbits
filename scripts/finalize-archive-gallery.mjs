import fs from "node:fs";
import { createHash } from "node:crypto";
const audit = JSON.parse(
  fs.readFileSync("catalog/archive-previews/validation.json", "utf8"),
);
const hashes = new Map();
const promoted = [];
const retainedShaders = new Set(JSON.parse(fs.readFileSync("catalog/library/shader-presentation-policy.json", "utf8")).retained);
const needsBetterFixture = new Set(
  [
    "backlight",
    "blur-fade",
    "confetti",
    "cool-mode",
    "glare-hover",
    "lens",
    "line-shadow-text",
    "magic-card",
    "neon-gradient-card",
    "orbiting-circles",
    "scroll-based-velocity",
    "scroll-progress",
    "text-reveal",
    "text-animate",
    "typing-animation",
  ].map((s) => "magic-ui--" + s),
);
for (const item of audit) {
  if (item.id.startsWith("shaders--") && !retainedShaders.has(item.id.replace("shaders--", ""))) { item.status="excluded"; item.reason="Removed by gallery presentation policy"; continue; }
  if (item.status !== "validated") continue;
  if (needsBetterFixture.has(item.id)) {
    item.status = "blocked";
    item.reason =
      "Render runs, but visual review found a generic, low-contrast or incomplete interaction fixture. Held until a meaningful demonstration is verified.";
    continue;
  }
  const hash = createHash("sha256")
    .update(fs.readFileSync("public" + item.thumbnail))
    .digest("hex");
  if (hashes.has(hash)) {
    item.status = "duplicate";
    item.reason = "Identical rendered preview to " + hashes.get(hash);
    continue;
  }
  hashes.set(hash, item.id);
  promoted.push(item);
}
const sourceCounts = Object.fromEntries(
  ["shaders", "magic-ui"].map((source) => {
    const entries = audit.filter((r) => r.id.startsWith(source + "--"));
    return [
      source,
      {
        discovered: entries.length,
        promoted: entries.filter((r) => r.status === "validated").length,
        duplicate: entries.filter((r) => r.status === "duplicate").length,
        held: entries.filter((r) => r.status === "blocked").length,
      },
    ];
  }),
);
fs.writeFileSync(
  "catalog/archive-previews/promotion.json",
  JSON.stringify(promoted, null, 2) + "\n",
);
fs.writeFileSync(
  "catalog/archive-previews/reconciliation.json",
  JSON.stringify(
    {
      date: "2026-10-25",
      sourceCounts,
      scope:
        "All 200 retained shader definitions and 70 retained Magic UI components. Render validation in native Chrome within opaque allow-scripts sandbox. Full cross-browser, GPU-device and accessibility validation not claimed.",
      entries: audit,
    },
    null,
    2,
  ) + "\n",
);
console.log(sourceCounts);
