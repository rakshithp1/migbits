import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tmp/**",
    "public/imported/**/previews/**",
    // Immutable upstream snapshots are linted in their own environments, not
    // rewritten to match the host application's React compiler conventions.
      "resources/approved/**/original/**",
      "resources/template-imports/**/original/**",
  ]),
]);

export default eslintConfig;
