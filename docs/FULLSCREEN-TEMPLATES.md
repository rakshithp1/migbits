# Six original full-screen templates

Six single-page HTML/CSS/vanilla JavaScript frontend templates were added to Templates, with full-viewport heroes, lower content, contact sections and footers. These are complete frontend landing pages, not backend products or additional imported website kits.

| Template | Composition | Motion |
|---|---|---|
| Coral Horizon | Centred signup, coral on black | Original continuous value-noise smoke |
| Orbit Cloud | Split SaaS introduction and workspace card | Orbital paths and moving satellites |
| Folio Studio | Light editorial studio with serif typography | Rotating line ribbon |
| Signal Developer | Dark green developer landing and terminal panel | Signal nodes and packets |
| Afterhours Release | Amber music release with expressive serif headline | Procedural waveform |
| Monument Spaces | Architectural portfolio with oversized typography | Moving architectural line structure |

Source: `resources/library/fullscreen-templates/index.ts`. Builder: `scripts/build-fullscreen-templates.ts`. Smoke renderer is shared with the existing original coral signup design. No copied third-party prompts, stock media, external fonts, runtime dependencies or CDN requests. Code, copy and generated artwork are MIT, with the complete copyright and permission notice in every HTML file and download ZIP. Preserve notices when redistributing.

Every template starts motion automatically, supports phase-preserving pause and reduced motion, and has responsive layouts. Gallery colour presets reuse each design without duplicating its catalog entry. The resource studio Full screen button uses the browser Fullscreen API on the isolated iframe wrapper. Escape exits using browser controls. It requires a browser that supports fullscreen; previews remain sandboxed with `allow-scripts` only.

Forms are local demonstrations and do not send data. Fictional project names and example.com addresses must be replaced before production. No signup, analytics, deployment, music playback or contact service is connected.

Validation evidence: `catalog/library/fullscreen-template-validation.json`, `catalog/library/cleanup-preview-validation.json`, and the browser tests. Screenshots reviewed at desktop, tablet and phone widths. Automated checks establish rendering, changing pixels, no horizontal overflow, reduced motion and browser error checks; they do not constitute a full production WCAG certification.

Published verification: 48 unit tests and seven focused browser tests passed locally; the same seven browser checks passed on migbits.com. Lint, TypeScript and Cloudflare production build passed. All 30 checked deployed artifacts match the tested versions. Catalog total: 349 resources, 124 template entries. Source commit: `99615f6f7c9d75b5b26970615b1199664b6ff718`. Cloudflare version: `84a1d1c4-b7d8-455a-9252-389cbd34e852`. Broader CI was still running when this release record was saved: https://github.com/rakshithp1/migbits/actions/runs/40530041467.
