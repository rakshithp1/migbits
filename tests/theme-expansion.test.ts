import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import { themes, themeCSS } from "../lib/themes";
import { contrastRatio } from "../lib/color-theory";
import fonts from "../catalog/library/fonts.json";
import review from "../resources/visual/fluent-color/review.json";

test("ready themes preserve readable semantic pairs and reference existing licensed fonts", () => {
  assert.equal(themes.length, 12);
  assert.equal(new Set(themes.map((t) => t.id)).size, 12);
  const fontNames = new Set(fonts.map((f) => f.name));
  const sheet = readFileSync("app/library/theme-tokens.css", "utf8");
  for (const theme of themes) {
    for (const font of [theme.headingFont, theme.bodyFont, theme.monoFont])
      assert.ok(fontNames.has(font), `Missing licensed font: ${font}`);
    assert.ok(themeCSS(theme).includes(".dark"));
    for (const mode of ["light", "dark"] as const) {
      assert.ok(
        sheet.includes(
          `html[data-mb-theme="${theme.id}"][data-mb-appearance="${mode}"]`,
        ),
      );
      const colors: Record<string, string> = theme.modes[mode];
      for (const [fg, bg] of [
        ["foreground", "background"],
        ["card-foreground", "card"],
        ["primary-foreground", "primary"],
        ["secondary-foreground", "secondary"],
        ["muted-foreground", "muted"],
        ["accent-foreground", "accent"],
        ["destructive-foreground", "destructive"],
      ])
        assert.ok(
          contrastRatio(colors[fg], colors[bg]) >= 4.5,
          `${theme.id}/${mode}/${fg} contrast`,
        );
    }
    const archive = unzipSync(
      new Uint8Array(
        readFileSync(`public/library/downloads/theme-${theme.id}.zip`),
      ),
    );
    assert.ok(archive["LICENSE.txt"]);
    assert.ok(archive["theme.css"]);
    assert.ok(archive["README.md"]);
    assert.ok(
      !Object.keys(archive).some((file) => /\.(ttf|woff2?)$/.test(file)),
      "Do not silently bundle fonts under theme MIT license",
    );
  }
});
test("color icon exports retain pinned geometry and complete notices", () => {
  assert.equal(review.items.length, 16);
  const license = readFileSync("resources/visual/fluent-color/LICENSE", "utf8"),
    notice = readFileSync("resources/visual/fluent-color/NOTICE", "utf8");
  const archive = unzipSync(
    new Uint8Array(
      readFileSync("public/library/downloads/fluent-color-motion.zip"),
    ),
  );
  const decode = (file: string) => new TextDecoder().decode(archive[file]);
  assert.equal(decode("LICENSE-Microsoft.txt"), license);
  assert.equal(decode("NOTICE-Microsoft.txt"), notice);
  for (const icon of review.items) {
    const raw = readFileSync(
      `resources/visual/fluent-color/${icon.file}`,
      "utf8",
    );
    assert.equal(createHash("sha256").update(raw).digest("hex"), icon.sha256);
    assert.equal(decode(`original/${icon.file}`), raw);
    const copy = readFileSync(
      `public/library/icons/fluent/${icon.id}.svg`,
      "utf8",
    );
    assert.match(copy, /<metadata>[\s\S]*MIT License/);
    assert.ok(copy.includes("Microsoft Corporation"));
    assert.equal(
      copy.replace(/<metadata>[\s\S]*?<\/metadata>/, ""),
      raw,
      "Attribution adapter must not alter source geometry",
    );
    assert.ok(!/<script|<foreignObject|\son\w+\s*=/i.test(copy));
  }
});
