# Motion, GetLayers and Nexus UI — source audit and import

Verified 26 October 2026. This report separates rights evidence, implementation results and remaining validation.

## Actual catalog changes

- **109 official MIT Motion React examples**, organized into **10 selectable collections**: presence (10), animation (21), layout (30), drag (15), gestures (10), lazy loading (1), reorder (2), SVG (6), WAAPI (4), hooks (10).
- **2 Textura/GetLayers developer source kits** under the **Unlicense**: the Next.js animation starter and AI design vault. They contain **412 original text files**, including the starter's pinned dependency lockfile. The starter's 13 public branding/image/stub files are excluded.
- The existing **Motion & backgrounds** destination also browses all 10 new collections, with counts derived from the approved catalog.
- A **Developer tools** section with source-kit overview previews and clear installation status.
- Total gallery: **479 resources**, including **102 component entries** and **2 developer tools**. Template count stays **114**. A source kit, example, variant or collection does not become a new complete website template.

These additions do not complete the separately requested 500 templates, 150 3D models or 100 motion backgrounds. Free/Pro and commerce remain deferred.

## Official domains and corrections

| Requested | Verified source | Finding |
|---|---|---|
| motion.dev | https://motion.dev | Official site links the motiondivision GitHub organization and Motion repository. |
| getlayers.ai | https://www.getlayers.ai | The www host was accessible; the initial bare-domain browsing request failed. Official docs link both Textura repositories below. |
| andnexus-ui.com | https://www.nexus-ui.com | Requested hostname was inaccessible. Search and official catalog/docs identify Nexus UI as the intended source; this correction is recorded rather than silently treated as the original domain. |

## License and redistribution matrix

| Resource/scope | Original source and primary evidence | Exact license | Commercial end product | Redistribute source in MigBits | Sell copies | Result |
|---|---|---|---|---|---|---|
| Reviewed Motion React example files | [Repository](https://github.com/motiondivision/motion), [pinned license](https://github.com/motiondivision/motion/blob/136f854291ad3c325dfa257d28912c4849ba2e9b/LICENSE.md) | MIT; copyright (c) 2024 Motion B.V. | Yes | Yes, retaining notices | Yes, retaining notices | 109 examples preview validated; 43 diagnostic fixtures excluded. |
| Textura Next.js starter | [Official repository](https://github.com/textura-agency/next16-claude-starter), [pinned license](https://github.com/textura-agency/next16-claude-starter/blob/4ce3ade04ed0c21f38d9b476e079f02a18273463/LICENSE.md) | Unlicense | Creator grant permits it | Creator grant permits it | Creator grant permits it | Source and overview imported; dependency installation/backend/build **UNVERIFIED**. |
| Textura AI design vault | [Official repository](https://github.com/textura-agency/ai-design-vault), [pinned license](https://github.com/textura-agency/ai-design-vault/blob/f0cdc2b9550642c181e62cb670ba51e6ea63160c/LICENSE.md) | Unlicense | Creator grant permits it | Creator grant permits it | Creator grant permits it | Source and overview imported; agent hooks and installation **UNVERIFIED**. |
| GetLayers catalog templates, 3D scenes, sections, gradients, backgrounds and prompts | [Docs](https://www.getlayers.ai/docs), [terms](https://www.getlayers.ai/terms-of-use) | Custom commercial/end-product terms | Permitted within terms | Not authorized for this competing library | Not authorized for this use | **BLOCKED**. No catalog source, prompts, screenshots, background binaries or paid MCP content imported. |
| Nexus UI free/premium components, blocks and templates | [Official terms, sections 5–6](https://www.nexus-ui.com/terms) | Custom end-product license | Permitted within terms | Explicitly prohibited in a competing library | Explicitly prohibited for this use | **BLOCKED**, including free items. No registry bulk download or mirror performed. |
| Motion+ examples, components, artwork and premium tools | [Motion+](https://motion.dev/plus), [official index distinguishing free packages from paid products](https://motion.dev/llms.txt) | Separate product terms; no blanket MIT assumption | Depends on exact terms | Not established by the package MIT grant | Not established | **UNVERIFIED for redistribution**, not imported. |
| Motion AI Kit repository | [Pinned source tree](https://github.com/motiondivision/ai-kit/tree/1e424943582cbbdb6e3f410687e39f96451447bb) | Official docs describe MIT, but no actual primary LICENSE file was found in the reviewed tree | Not inferred from a label | Not verified | Not verified | **UNVERIFIED**, not imported or installed. Evidence in `source-holds.json`. |

The Unlicense grants apply to creator code, not to the licenses of dependencies or assets added by a downstream user. No third-party package is silently relicensed by including the developer kit. Trademark/endorsement rights are separate.

## Detailed source reconciliation

All **152 `.tsx` entry files** in the pinned Motion `dev/react/src/examples/` directory are inventoried in `catalog/partner-imports/inventory.json`:

| Outcome | Count | Reason |
|---|---:|---|
| Imported; isolated preview validated | 109 | Creator MIT source and bundled MIT dependency notices checked. Grouped into 10 gallery collections. |
| Excluded | 43 | Internal/debug, stress, benchmark, diagnostic, experimental or intentionally rejecting fixtures; not reusable gallery material. Each path has its own reason. |
| Pending/blocked in this reviewed React scope | 0 | Every entry reconciled. This is not a count of the entire Motion website example vault or every supported framework. |

Original upstream source is preserved separately. Two otherwise eligible examples referenced external photographs: their runnable adaptations use original MigBits SVG art, retain the original source references as text, and include the MigBits adaptation license. No photograph was downloaded or redistributed. One example retains its reviewed local CSS closure. SVG namespace URLs and source-code issue links are not treated as remote media downloads.

The Motion website exposes many examples across several frameworks and premium products. Public visibility and a library package's MIT license do not independently approve those website examples or artwork. No completeness claim for those restricted/unverified scopes is made. Nexus terms prohibit bulk mirroring, so its public catalog was reviewed for scope and rights rather than copied into an inventory of downloadable source.

## Implementation and boundaries

- All 570 retained original text files were independently compared with the Git blob hashes in the complete pinned official repository trees; every file matched. Evidence: `catalog/partner-imports/upstream-byte-verification.json`.
- Pinned original files, checksums, exact grants and excluded paths live in `resources/partner-imports/*/{source-files.json,snapshot.json}`.
- Upstream `AGENTS.md`, skills, hooks and installer files are inert strings in the source snapshot. They are never activated as project instructions, installed or executed by the import pipeline.
- Original Motion files remain under `upstream/` in ZIPs. Separate `Example.tsx` files add the Next.js client boundary and current `motion/react` or `motion` imports. The local CSS closure and all bundled package notices are retained.
- Every live example runs in a lazy iframe without same-origin permission. CSP disables network connections, external assets, forms and base-URL changes. No server secrets are passed to the preview.
- Separate preview controls pause by unmounting and freezing the rendered demo; OS reduced motion starts with a frozen preview. This is a preview adaptation, not a claim that the original fixture's keyboard/animation behavior is production accessible.
- Group thumbnails show real rendered variants. Each variant retains its own preview, source and ZIP; the collection download contains all validated variants.
- Source-kit overviews explicitly state that installation, agent hooks, backends, CMS, environment setup and upstream project builds are unverified. They are developer resources, not working website template demos.
- Copied source snapshots are excluded from Tailwind production class scanning, preventing documentation tokens from generating unrelated or invalid application CSS.
- `build-resource-library.ts` verifies snapshot hashes, exact original contents, approval state, every downloadable/preview artifact and all variant proofs. Unapproved candidates cannot enter the catalog.

## Reproduce and resume

1. `npm run snapshot:partners` retains existing pinned snapshots and checks new explicit sources. Missing primary grants produce holds instead of importing code. No upstream program is executed.
2. `npm run build:partners` builds isolated candidates and preserves originals without installing their project dependencies into MigBits.
3. Serve `public/` on port 3212, then `npm run validate:partners`. For interrupted or additional checks use `npm run validate:partners -- --resume`.
4. Resume reuses a passing result only when its preview, screenshot, data, ZIP and notice hashes all match. Changed artifacts must be rendered again. Progress is saved after every attempt.
5. Run `npm run build:catalog`, lint, types, unit/browser checks and the Cloudflare build before publishing.

Individual Chrome checks cover render errors, actual example-root content, screenshots, image completeness, pause/resume, live reduced-motion handling and mobile **document** overflow. Fixed-width upstream demos can scroll inside their isolated canvas. These checks do not certify strict consumer TypeScript, all browsers, production responsiveness, complete keyboard accessibility or backend integrations. Per-item status remains explicit.

## Verified release

Published code commit `d4cab3c41e49bc1eb2042c84518d1f9748cf2363` passed [CI](https://github.com/rakshithp1/migbits/actions/runs/40337656130): 44 unit tests and 36 browser tests, consumer/community checks, lint, types, production build and Worker checks. Four final local journeys and four live journeys passed. All 595 published partner preview/data/ZIP/notice/thumbnail files matched the tested hashes. Cloudflare deployment: `2988853c-b9e0-4ae7-83bf-75a385962f2d`. The two source kits still have unverified upstream installations; this release does not change that status.
