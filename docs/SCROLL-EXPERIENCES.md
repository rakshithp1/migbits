# Replacement scroll experiences

The twelve sector concepts from the prior release were rejected by the owner. All twelve catalog entries, 72 individual public preview/source/download/notice/thumbnail paths and the sector generator were removed. Historical validation is marked retired. Git history was not rewritten.

Three replacements lead Templates:

| Template | Presentation | Interaction |
|---|---|---|
| Aperture OS | Light software site and detailed original workspace UI | Keyboard-accessible Overview/Roadmap/Activity tabs, pinned three-chapter story, perspective and parallax |
| Pace Atelier | Editorial footwear site with realistic mesh-shoe imagery | Scroll-linked product rotation, translation, scaling, chapter progress and section reveals |
| Sol Citrus | Warm editorial beverage site with realistic can, droplets and citrus imagery | Scroll-linked product scene and three-chapter narrative, reveals and page progress |

Native scrolling is preserved: no wheel interception, smooth-scroll dependency, prerecorded video, manual activation or scroll hijacking. Effects use a single queued requestAnimationFrame on scroll/resize, not a permanent render loop. Pause freezes transforms and reveals all content. Reduced motion removes pinning and transforms; all chapters remain in normal-flow detail cards. Short phone viewports also use normal-flow story layouts. The original six fullscreen templates from the earlier release remain unchanged.

Source: `resources/library/scroll-experiences/index.ts`. Builder: `scripts/build-scroll-experiences.ts`. Images are in the same source directory as compressed WebP files and embedded in the standalone HTML, with no external request or asset install. The software UI is HTML/CSS/SVG, not a static app screenshot. Duplicate hero/story accessibility IDs are prefixed. All templates use system fonts, sandboxed previews, colour controls, source viewing, downloads and the existing Full screen control. Colour presets retain the neutral/photo setting and change accents; bitmap imagery itself is not recoloured.

Code is original MigBits work, MIT licensed. The shoe and beverage assets were generated for this project using OpenAI image generation from original generic-product descriptions, not downloaded stock or existing brand images. `ASSETS.json` records their hashes and origin; `ASSET-PROVENANCE.md` is included in each source download. Generated imagery is illustrative and may not be unique; no real product, endorsement or exclusive trademark rights are claimed. Preserve the MIT notice and asset provenance on redistribution. These are fictional frontend concepts, not connected SaaS products, real shoes/drinks or checkout systems.

Validation records: `catalog/library/scroll-experience-validation.json` for opaque iframe rendering, loaded assets, unique IDs, scroll-driven transforms, pause, reduced motion, colours and responsive widths; `catalog/library/cleanup-preview-validation.json` for sealed gallery previews. Browser tests cover three experiences and all twelve retired resource/download endpoints. Desktop, story and phone screenshots are visually reviewed. This is not a complete production WCAG certification.

Catalog: 352 resources, 127 template entries. Three new single-page frontend experiences replace twelve entries; imported complete-website-kit progress remains separate.
