import { writeFileSync } from "node:fs";
import { siteThemeCSS } from "../lib/themes";
writeFileSync("app/library/theme-tokens.css", siteThemeCSS());
console.log(
  "Synced site theme roles from the reviewed original theme presets.",
);
