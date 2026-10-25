import fs from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
const results = JSON.parse(
  fs.readFileSync("catalog/archive-previews/shaders.json", "utf8"),
);
const hashes = new Map();
for (const r of results.filter((r) => r.status === "render-checked")) {
  const hash = createHash("sha256")
    .update(fs.readFileSync("public" + r.thumbnail))
    .digest("hex");
  hashes.set(hash, [...(hashes.get(hash) || []), r.id]);
}
const duplicates = new Set(
  [...hashes.values()].filter((v) => v.length > 1).flat(),
);
const report = [];
for (const r of results) {
  if (duplicates.has(r.id)) {
    report.push({
      ...r,
      status: "blocked",
      reason:
        "Neutral default produces an identical checkerboard; needs a meaningful effect preset before promotion.",
    });
    continue;
  }
  if (r.status !== "render-checked") {
    report.push(r);
    continue;
  }
  const url = "/imported/shaders/previews/" + r.id + ".html";
  fs.writeFileSync(
    "public" + url,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'self' 'unsafe-inline';style-src 'unsafe-inline';img-src 'self' data: blob:;connect-src 'none';worker-src 'none';base-uri 'none';form-action 'none'"><meta name="source-license-notices" content="/imported/shaders/previews/LICENSES.txt"><title>${r.definition} — WebGPU preview</title><style>html,body{margin:0;background:#080b14;color:white;font:13px system-ui}canvas{display:block;width:100%;height:auto;aspect-ratio:640/440}#error{padding:16px;white-space:pre-wrap}button{position:fixed;right:12px;bottom:12px;padding:8px 14px;background:#171c2b;color:white;border:1px solid #68738d;border-radius:8px}button:focus-visible{outline:3px solid #c4b5fd}</style></head><body data-preview-state="loading"><canvas aria-label="${r.definition} decorative shader"></canvas><div id="error" role="status">Requires a WebGPU-capable browser and GPU.</div><button id="play" disabled>Play animation</button><script src="runtime.js"></script><script>let running=false;const play=document.getElementById('play');runShader(${JSON.stringify(r.definition)},${JSON.stringify(r.preset.components[0].props)}).then(()=>{document.getElementById('error').textContent='';play.disabled=false}).catch(e=>{document.getElementById('error').textContent='Live WebGPU preview unavailable on this device. The gallery thumbnail shows a verified render. '+e.message});play.onclick=()=>{running=!running;play.textContent=running?'Pause animation':'Play animation';if(running)tick()};async function tick(){if(!running)return;try{await window.advanceShader();setTimeout(tick,33)}catch(e){running=false;play.textContent='Preview unavailable';document.getElementById('error').textContent=e.message}}document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;play.textContent='Play animation'}});</script></body></html>`,
  );
  report.push({ ...r, status: "compiled", url });
}
const runtime = path.resolve(
  process.env.ARCHIVE_RUNTIME_DIR ||
    path.join(homedir(), ".codex/tmp/migbits-archive-runtime-20261025"),
);
const notices = [
  JSON.parse(
    fs.readFileSync("public/imported/shaders/angularblur.json", "utf8"),
  ).files.find((f) => f.path === "LICENSE").content,
];
function scan(dir, prefix = "") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("@")) scan(p, prefix + e.name + "/");
      else {
        const licenses = fs
          .readdirSync(p)
          .filter((n) => /^(LICENSE|LICENCE|NOTICE|COPYING)(\.|$)/i.test(n));
        for (const n of licenses)
          if (fs.statSync(path.join(p, n)).isFile())
            notices.push(
              prefix +
                e.name +
                "/" +
                n +
                "\n" +
                fs.readFileSync(path.join(p, n), "utf8"),
            );
      }
    }
  }
}
scan(path.join(runtime, "node_modules"));
fs.writeFileSync(
  "public/imported/shaders/previews/LICENSES.txt",
  notices.join("\n\n"),
);
fs.copyFileSync(
  path.join(runtime, "package-lock.json"),
  "catalog/archive-previews/shader-runtime-lock.json",
);
fs.writeFileSync(
  "catalog/archive-previews/shader-candidates.json",
  JSON.stringify(report, null, 2),
);
console.log(
  "Shader candidates",
  report.filter((r) => r.status === "compiled").length,
  "held",
  report.filter((r) => r.status !== "compiled").length,
);
