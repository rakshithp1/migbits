# Visual expansion — 26 October 2026

This release adds 12 original ready themes and one collection containing 16 reviewed generic Fluent color icons. These are themes and glyphs, not additional template kits. The gallery has 371 resource entries; the earlier 1,000-template target remains 18 complete kits.

## What changed

- 12 light/dark semantic themes with original CSS/JSON downloads, coherent typography/radius/gradient roles, an interactive form/chart sample, and persistent site appearance controls.
- 16 individually hash-pinned Microsoft Fluent SVGs, search and attributed SVG copying, plus six original MigBits CSS motion recipes. Motion is opt-in or hover/focus-triggered, with static reduced-motion behavior.
- Four responsive typography scales for the existing 12 font families, preserving their existing OFL downloads. Theme ZIPs do not silently relicense/bundle fonts.
- Configurable two-color gradients with angle controls, optional transform-based animation and CSS export including reduced-motion handling.
- Five palette roles and three additional palette presets in the existing original-illustration editor. Original SVG geometry and license metadata remain intact; recoloring uses image URLs rather than untrusted inline SVG execution.

## Rights and provenance

Themes, preview wrappers and motion recipes are original MigBits MIT code. Source icon geometry is Microsoft MIT; full upstream LICENSE and NOTICE are retained in the source tree, public attribution text, source payload, ZIP and copied SVG metadata. Published SVG copies add attribution metadata while exact originals remain separate. `resources/visual/fluent-color/review.json` pins the commit, every file path and SHA256. Builds fail if icon/license/notice bytes change.

No brand/product marks, React Bits, Animate UI or ItsHover code is included. Existing third-party resources retain their own notices. Twelve theme designs do not imply twelve new font licenses or twelve template kits.

## Validation

The added unit checks validate 168 semantic text/background pairs at 4.5:1, existing licensed font references, theme archive contents, exact icon geometry, upstream hashes and complete exported notices. Browser checks cover theme persistence and copying, demo form behavior, color-icon search/copy/animation/reduced motion, palette editing, responsive type controls, keyboard access and mobile overflow. These are representative checks, not a full WCAG conformance audit. Existing regression suites and the Cloudflare production build also run before release.

## Maintenance

Edit original presets in `resources/library/theme-presets.json`, run `npx tsx scripts/sync-theme-tokens.ts`, then regenerate the catalog. New upstream icons must receive their own source/license/asset review before adding them to the approved manifest; preserve exact source bytes through `.gitattributes`. Never auto-import the research directory as approved assets.
