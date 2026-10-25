import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
const publicRoot = path.resolve("public");
const server = http.createServer((req, res) => {
  const target = path.resolve(
    publicRoot,
    "." + new URL(req.url, "http://local").pathname,
  );
  if (!target.startsWith(publicRoot + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(target, (err, data) => {
    if (err) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      target.endsWith(".js")
        ? "text/javascript"
        : target.endsWith(".html")
          ? "text/html"
          : "application/octet-stream",
    );
    res.end(data);
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 640, height: 440 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const selected = process.argv
  .find((a) => a.startsWith("--names="))
  ?.slice(8)
  .split(",");
const results =
  selected && fs.existsSync("catalog/archive-previews/shaders.json")
    ? JSON.parse(
        fs.readFileSync("catalog/archive-previews/shaders.json", "utf8"),
      )
    : [];
try {
  await page.goto(
    "http://127.0.0.1:" +
      server.address().port +
      "/imported/shaders/previews/index.html",
  );
  await page.waitForFunction(() => typeof window.runShader === "function");
  const defs = await page.evaluate(() => window.shaderDefinitions);
  fs.mkdirSync("catalog/archive-previews", { recursive: true });
  fs.writeFileSync(
    "catalog/archive-previews/shader-definitions.json",
    JSON.stringify(defs, null, 2),
  );
  const items = JSON.parse(
    fs.readFileSync("catalog/import-index.json", "utf8"),
  ).filter((r) => r.source === "shaders");
  fs.mkdirSync("public/imported/shaders/thumbnails", { recursive: true });
  for (const item of items) {
    const def = defs.find(
      (d) => d.name.toLowerCase() === item.id.replace("shaders--", ""),
    );
    if (selected && !selected.includes(def?.name)) continue;
    const old = results.findIndex((r) => r.id === item.id);
    if (old >= 0) results.splice(old, 1);
    errors.length = 0;
    let result;
    try {
      if (!def) throw Error("Shader definition missing from pinned registry");
      let timer;
      try {
        result = await Promise.race([
          page.evaluate((name) => window.runShader(name), def.name),
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(Error("GPU render exceeded 45 seconds")),
              45000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      if (errors.length) throw Error(errors.join("; ").slice(0, 1400));
      const data = await page.evaluate(() =>
        document.querySelector("canvas").toDataURL("image/png"),
      );
      const png = Buffer.from(data.split(",")[1], "base64");
      const stats = await sharp(png).stats();
      if (stats.channels[3] && stats.channels[3].max === 0)
        throw Error(
          "Transparent output: a different input or configuration is required",
        );
      const thumbnail = "/imported/shaders/thumbnails/" + item.id + ".png";
      await page.locator("canvas").screenshot({ path: "public" + thumbnail });
      results.push({
        id: item.id,
        status: "render-checked",
        thumbnail,
        definition: def.name,
        role: def.role,
        preset: result.preset,
        backend: "Native Chromium WebGPU",
        notes:
          "Pinned upstream renderer. Five deterministic frames; GPU validation and visible output checked. Full accessibility and cross-device testing remain separate.",
      });
    } catch (error) {
      results.push({
        id: item.id,
        status: "blocked",
        reason: error.message.slice(0, 1800),
      });
    }
    fs.writeFileSync(
      "catalog/archive-previews/shaders.json",
      JSON.stringify(results, null, 2) + "\n",
    );
    console.log(item.id, results.at(-1).status, results.at(-1).reason || "");
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}),
);
