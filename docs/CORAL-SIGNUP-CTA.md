# Coral signup template - continuous smoke

Version 2 moves this existing resource from Blocks to Templates. It is a single-page signup/footer template, not an additional imported website kit. The catalog still has 343 resources: 118 template entries and 19 blocks. The prior recorded video version is superseded.

The single HTML file now renders an original, continuously advected Canvas 2D smoke field. Its accumulated active time never wraps at five seconds; there is no video, seeking, crossfade seam or repeating playback timeline. Motion starts automatically, preserves its phase across pause/resume, and freezes for reduced motion or document invisibility. Native rendering also removes the prior opaque-iframe video compositor workaround. Source includes the standalone smoke renderer for inspection, but index.html requires no external file, dependency, framework or build step.

The original black/coral layout, embedded Inter font, 1440x960 reference card, footer, responsive sizing, native form validation and local demo confirmation remain. Theme controls change the CSS palette and the rendered smoke colours. Font notices are also preserved inside the stylesheet so copied theme CSS retains the embedded font's complete licence. The email form remains a frontend demonstration with no account backend or email transmission.

The user-supplied design brief is credited as an input, not an exclusive MigBits prompt. Supplied stock media remains excluded because redistribution rights were unverified. Code and original media are MIT; unmodified Inter remains OFL 1.1, with complete notices embedded and separately included. Fonts are not standalone resale assets.

Font source: https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/inter . Licence: https://github.com/google/fonts/blob/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/inter/OFL.txt . Pinned binary SHA-256: `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`.

Old resource, preview, data, download, thumbnail and notice URLs redirect to their replacements. Validation: `catalog/library/coral-cta-validation.json` and the sealed template-preview inventory. Build with `npm run build:catalog`; serve public/ and run `node scripts/validate-coral-cta.mjs` and the targeted template-colour validator. Final publication evidence is recorded in the release ledger.

Publication verified: source `3d33e245a2d3ff9d5c5c137fdf06e4e98b1ab0f0`, Cloudflare version `0070afe4-d87d-4ff0-91f0-aa8ed8e3e5e1`. Full CI passed 48 unit and 50 browser tests, lint, types, consumer checks and production build. Four focused local browser checks and two live browser checks passed. All six checked live artifacts match the tested files. Gallery template entries total 118; complete website kit progress remains 117/500 because this reclassifies an existing resource.
