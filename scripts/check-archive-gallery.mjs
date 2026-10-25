import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
const root = path.resolve("public");
const server = http.createServer((req, res) => {
  const p = path.resolve(root, "." + new URL(req.url, "http://local").pathname);
  if (!p.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(p, (e, data) => {
    if (e) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      p.endsWith(".html")
        ? "text/html"
        : p.endsWith(".js")
          ? "text/javascript"
          : p.endsWith(".png")
            ? "image/png"
            : "text/plain",
    );
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ channel: "chrome" });
const report = fs.existsSync("catalog/archive-previews/validation.json")
  ? JSON.parse(
      fs.readFileSync("catalog/archive-previews/validation.json", "utf8"),
    )
  : [];
const checked = new Set(report.map((r) => r.id));
try {
  for (const file of ["magic-ui", "shader-candidates"]) {
    const items = JSON.parse(
      fs.readFileSync("catalog/archive-previews/" + file + ".json", "utf8"),
    );
    let cursor = 0;
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        for (;;) {
          const item = items[cursor++];
          if (!item) break;
          if (checked.has(item.id)) continue;
          if (item.status !== "compiled") {
            report.push(item);
            continue;
          }
          const page = await browser.newPage({
            viewport: { width: 640, height: 440 },
            deviceScaleFactor: 1,
          });
          const errors = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.route("**/*", (r) =>
            r
              .request()
              .url()
              .startsWith(origin + "/")
              ? r.continue()
              : r.abort(),
          );
          try {
            await page.goto(origin + "/imported/shaders/previews/index.html");
            await page.setContent(
              '<iframe title="Isolated demo" sandbox="allow-scripts" style="border:0;width:640px;height:440px" src="' +
                origin +
                item.url +
                '"></iframe><style>html,body{margin:0}</style>',
            );
            const frame = page.frameLocator("iframe");
            await frame.locator("body").waitFor();
            await frame
              .locator(
                'body[data-preview-state="rendered"],body[data-preview-state="error"]',
              )
              .waitFor({ timeout: 45000 });
            const state = await frame
              .locator("body")
              .getAttribute("data-preview-state");
            if (state !== "rendered")
              throw Error(
                (await frame.locator("body").getAttribute("data-error")) ||
                  (await frame.locator("body").innerText()),
              );
            if (errors.length) throw Error(errors.join("; "));
            await page.mouse.move(220, 180);
            await page.waitForTimeout(1200);
            const source = file === "magic-ui" ? "magic-ui" : "shaders";
            const thumbnail =
              "/imported/" + source + "/thumbnails/" + item.id + ".png";
            fs.mkdirSync("public/imported/" + source + "/thumbnails", {
              recursive: true,
            });
            const png = await page.screenshot();
            const stats = await sharp(png).stats();
            if (stats.entropy < 0.15)
              throw Error(
                "Preview is blank or contains no meaningful visible output",
              );
            fs.writeFileSync("public" + thumbnail, png);
            report.push({
              ...item,
              status: "validated",
              thumbnail,
              validation:
                "Native Chrome; opaque sandbox; no external requests; visible render. Cross-device and full accessibility review not complete.",
            });
          } catch (e) {
            report.push({
              ...item,
              status: "blocked",
              reason: String(e).slice(0, 900),
            });
          } finally {
            await page.close();
          }
          fs.writeFileSync(
            "catalog/archive-previews/validation.json",
            JSON.stringify(report, null, 2),
          );
          console.log(item.id, report.at(-1).status);
        }
      }),
    );
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
console.log(
  report.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}),
);
