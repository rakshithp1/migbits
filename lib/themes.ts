import presets from "../resources/library/theme-presets.json";

export const themes = presets;
export type Theme = (typeof themes)[number];
export type ThemeMode = "light" | "dark";
export function siteThemeCSS() {
  return (
    "/* Original MigBits theme roles. Generated from resources/library/theme-presets.json. */\n" +
    themes
      .flatMap((theme) =>
        (["light", "dark"] as const).map(
          (mode) =>
            `html[data-mb-theme="${theme.id}"][data-mb-appearance="${mode}"]{${Object.entries(
              theme.modes[mode],
            )
              .map(([key, value]) => `--mb-theme-${key}:${value};`)
              .join(
                "",
              )}--mb-theme-heading:"${theme.headingFont}",serif;--mb-theme-body:"${theme.bodyFont}",sans-serif;--mb-theme-gradient:${theme.gradient};--mb-theme-radius:${theme.radiusRem}rem;}\n`,
        ),
      )
      .join("")
  );
}
export function findTheme(id: string) {
  return themes.find((theme) => theme.id === id) || themes[0];
}
export function themeCSS(theme: Theme) {
  return [
    "/* Original MigBits theme. MIT; preserve LICENSE.txt. Fonts are separate OFL resources. */",
    ...(["light", "dark"] as const).map(
      (mode) =>
        `${mode === "light" ? ":root" : ".dark"} {\n${Object.entries(
          theme.modes[mode],
        )
          .map(([key, value]) => `  --${key}: ${value};`)
          .join(
            "\n",
          )}\n  --radius: ${theme.radiusRem}rem;\n  --font-heading: "${theme.headingFont}", serif;\n  --font-body: "${theme.bodyFont}", sans-serif;\n  --font-mono: "${theme.monoFont}", monospace;\n  --decorative-gradient: ${theme.gradient};\n}`,
    ),
    "/* Tailwind v4 / shadcn: map these semantic variables in your existing @theme inline block. Keep text on semantic surfaces, not on the decorative gradient. */",
  ].join("\n\n");
}
export function themeStyle(theme: Theme, mode: ThemeMode) {
  return Object.fromEntries([
    ...Object.entries(theme.modes[mode]).map(([key, value]) => [
      `--${key}`,
      value,
    ]),
    ["--theme-gradient", theme.gradient],
    ["--theme-heading", `"${theme.headingFont}",serif`],
    ["--theme-body", `"${theme.bodyFont}",sans-serif`],
    ["--theme-radius", `${theme.radiusRem}rem`],
  ]);
}
