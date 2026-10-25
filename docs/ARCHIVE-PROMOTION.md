# Archive review — 25 October 2026

The public Source archive has been retired. Its index redirects to `/library`; old detail links redirect only when the resource is in the reviewed library. Other details return 404. Original attributed source packages remain available to the importer.

All 270 retained records requiring previews were attempted: 200 Shaders definitions and 70 Magic UI components. The other 31 archive records (15 Inspo blocks and 16 palettes) were already incorporated into the library. No previously retired resource was restored.

| Source   | Checked | Added to library | Held |
| -------- | ------: | ---------------: | ---: |
| Shaders  |     200 |              171 |   29 |
| Magic UI |      70 |               29 |   41 |

The library now contains 314 resources. Each new entry has an actual browser-captured thumbnail, isolated lazy preview, upstream revision, original source download, setup notes and notices. Shaders have their own category. Live GPU previews require WebGPU and start paused. Unsupported devices retain the gallery thumbnail.

## Validation boundaries

Native Chrome rendered previews inside an opaque `sandbox="allow-scripts"` frame. Network requests outside the local preview origin were blocked, and each preview has a restrictive CSP. Shader GPU validation, visible output and screenshot duplication were checked. A visual review held incomplete, low-contrast and generic Magic UI fixtures even when they ran without an exception. Nineteen neutral shader presets yielded the same unchanged checkerboard and were held, rather than promoted as distinct demonstrations. Camera, remote media and experimental HTML capture examples remain held.

These are render and visual checks, not full cross-browser, GPU-device, keyboard or accessibility certification. Upstream source is preserved separately from preview fixtures. Review accessibility and reduced motion when integrating a component. Runtime bundles are lazy static assets and do not add their dependencies to the main application.

## Persistent records and repeatability

- `catalog/archive-previews/shaders.json`: initial per-shader GPU attempt.
- `shader-candidates.json`: meaningful, unique shader candidates.
- `magic-ui.json`: per-component compilation results.
- `validation.json`: resumable isolated browser results.
- `reconciliation.json`: final per-entry disposition and reason.
- `promotion.json`: explicit passing allowlist consumed by the catalog builder.
- `shader-runtime-lock.json`: exact isolated shader dependency versions.

Run `node scripts/prepare-archive-runtime.mjs`, install its exact isolated dependencies, then `node scripts/build-shader-previews.mjs`, `node scripts/check-shader-previews.mjs`, `node scripts/prepare-shader-gallery.mjs`, `npx tsx scripts/build-magic-previews.mts`, `node scripts/check-archive-gallery.mjs`, `node scripts/finalize-archive-gallery.mjs`, and `npm run build:catalog`. The browser audit skips completed IDs. To retry an entry, remove only its existing result from `validation.json` before running the audit. The final promotion step also applies the visual review holds. Keep the underlying license records and notices with redistributed code.

The homepage retains its blue hero and now carries subtle blue, violet and teal illumination through the lower sections. Library sections share a static dotted texture. An original dotted SVG MigBits wordmark finishes the homepage; no remote asset or animation dependency is used.
