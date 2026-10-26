# Shader cleanup and template colour controls

Reviewed 2026-10-27, following the three supplied screenshots.

## Published changes

- Removed 140 formerly published shader cards: checkerboard/filter fixtures, blur demonstrations, elementary test shapes and candidates without meaningful automatic motion.
- Retired 169 individual shader source downloads/data packages in total (including 29 that were never promoted). Their individual preview HTML and thumbnails are removed too. Internal provenance records remain; shared upstream engine source is a dependency of retained scenes, not a catalog entry.
- Retained 31 shader scenes. Each passed an opaque-sandbox render and a two-frame pixel comparison during automatic playback. Four initial candidates (Carbon Fiber, Irradiance, Neon and Voxels) failed the motion threshold and were removed. No static render is presented as a working animation.
- Shader playback begins without a Play button. Document visibility, operating-system reduced motion and MigBits' global pause control stop playback. WebGPU-capable hardware/browser is still required; unsupported devices receive an explicit capability message.
- Refreshed all 31 shader thumbnails without the old embedded Play labels.
- Added Original, Ocean blue, Emerald, Amber, Violet and Rose stylesheet palettes inside each template preview, with original reset and Copy colour CSS. Colour changes preserve relative luminance to avoid introducing the large contrast losses caused by a naive hue rotation. This preserves existing contrast; it is not a certification of upstream accessibility.
- Corrected 350px preview overflow in HR Dashboard, Web Development Agency, University and Cafe Coffee Shop. These are separate preview adaptations; upstream downloads are unchanged.

## Template consolidation

The deterministic check compares template structure, CSS with colours normalized, and scripts. All 114 current templates have distinct fingerprints; **zero confirmed colour-only duplicates were found**. Shared geometric replacement artwork does not establish that two templates have the same layout. Distinct layouts remain separate. Future confirmed colour-only duplicates are suppressed by this check rather than adding more gallery cards.

The colour control does not create additional catalog entries. It recolours stylesheet accents, not embedded images or illustrations. The source download remains the original reviewed edition; copy the generated colour CSS after the original styles to reproduce the chosen stylesheet palette. All creator notices remain required.

## Architecture and integrity

- `shader-presentation-policy.json` is the allowlist used by gallery generation and upstream import preparation. Removed entries cannot return through a routine import.
- Colour preview pages are generated under `/library/customized/` from approved, hash-checked source previews. No third-party packages or backend services are installed for these adaptations.
- `template-color-previews.json` records original and derived artifact hashes. Original source, download packages and their reviews remain distinguishable from the customization layer.
- Colour messages accept only named presets and only messages from the parent window. Parent responses are accepted only from its own sandboxed iframe. Previews retain `allow-scripts` without `allow-same-origin`, restrictive CSP and no secret access.
- `cleanup-preview-validation.json` records 145 passing landing-preview checks: 31 animated shader scenes plus 114 template colour switch/reset and mobile checks. Additional template page switching is covered by the browser suite, not claimed as 114 complete end-to-end template application certifications.
- Unit checks reject changes to tested preview artifacts until verification records are renewed.

Catalog after cleanup: **339 resources**, including **114 distinct templates** and **31 shader scenes**. No new content was counted for palette variants.

## Validation

Validation and deployment results are recorded in the release ledger after completion. No qualifying Next.js framework-feedback issue was identified; the problems addressed here were gallery fixtures, shader activation policy and preview adaptation defects.
