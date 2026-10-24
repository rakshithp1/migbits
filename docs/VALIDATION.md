# Phase 1 verification record

Latest shadcn expansion: see [SHADCN-COLLECTION.md](SHADCN-COLLECTION.md) for the 65-module collection, three recipes, 164-file source pack and current browser/runtime evidence. Earlier 13-component entries below describe the historical starter slice.

Recorded during implementation on 23 October 2026.

## Passed

- Production Next.js build and TypeScript build check, including /, /library and /resources/profile-settings.
- Catalog validation: metadata shape, dependency cycles/missing dependencies, duplicate IDs/slugs, bounded source paths, and existence of all declared files.
- Eight Node test cases: preset round-trip; hostile/unsupported values and versions; preservation of prior settings; keyword/intent search; exclusion of drafts from public release metadata; graph/path/identity rejection; license and verification publication gates; realistic profile validation.
- Local HTTP smoke checks return 200 and the expected page content for /, /library, /library?q=preferences and /resources/profile-settings.

## Boundaries and pending checks

- No connected browser is available to the UI automation tool. Live interaction, layout screenshots, keyboard and screen-reader checks have not been recorded.
- The 375px control constrains the preview container; a narrow browser remains a separate review requirement.
- Unit tests cover validation and catalog behavior, not browser behavior or complete accessibility.
- Profile saves are simulated in the website. The resource exposes an onSave callback for a future host integration.
- Cloudflare preproduction, D1, R2, auth callbacks and Dodo webhook verification have not been tested. No external account or deployment configuration was changed.
- Consumer installation, deterministic complete-file exports and registry publication remain Phase 2 gates.
- The resource remains a draft. Its redistribution license needs an owner decision. Drafts are explicitly excluded from public metadata and pages are noindex.
- Customer validation has not been performed. No superiority or production-readiness claims are made.

## Reproduce

npm ci
npm run validate:catalog
npm test
npm run lint
npm run build
npm run typecheck

The existing CI now runs catalog validation and foundation tests before lint/build/typecheck. Deployment remains disabled until provider configuration is deliberately completed.

# Phase 2 delivery milestone

This section supersedes the Phase 1 notes about pending consumer installation and local delivery. Public beta is still not declared complete.

## Implemented

- Deterministic complete-file ZIP export from the current validated brand preset.
- Lazy source viewer, file copying, installation tab, manifest view, and copyable receipt.
- Versioned shadcn registry route built from the same generator and source snapshot as ZIP delivery.
- Scoped component CSS, configured example, setup notes, rights notice, preset, source digest, export digest and per-payload-file SHA-256 checksums. The manifest does not recursively checksum itself.
- Preset undo with bounded local history.
- An original installation guide at /guides/installation.
- Bounded JSON input, preset/version validation, same-origin checks, readable export failure responses, and production denial for unreleased drafts.

## Verified

- 14 Node tests pass, including malicious/unsupported preset inputs, unknown versions, draft access restrictions, payload limits, cross-origin rejection, deterministic ZIP bytes, checksums, and registry/archive file agreement.
- Fresh locked consumer install with React/React DOM 19.3.0, TypeScript 5.9.3 and esbuild 0.28.2; strict typecheck and standalone JS/CSS bundle pass outside Next.js.
- All 48 accent/theme/radius/density combinations carry the expected token values into server-rendered consumer markup.
- shadcn 4.22.1 installed all 10 files into a separate configured consumer. No installed files differed from registry payloads. The installed source passed strict TypeScript and esbuild bundling.
- Development HTTP checks passed for resource page, guide, versioned registry and configured ZIP endpoint.

## Still open

No browser screenshot/interaction, keyboard/screen-reader, customized contrast, or arbitrary existing-project integration review is claimed. Cloudflare runtime proof, owner license decision, onboarding/artwork pack, category pages, public registry publication, and public beta release are not complete.

## Reproduction

npm run build:catalog
npm test
npm run test:consumer
npm run lint
npm run build

The consumer fixture uses its own committed lockfile and a fresh npm ci under ignored tmp/. CI runs the consumer verifier before the production build. Registry CLI verification was a separate local integration check, not a claimed cross-browser test.

Final delivery checks: production build and lint passed. Production-mode smoke checks returned 404 for both the unreleased registry and source-export endpoint. The development server was restored on localhost:3000.

# Open-source collection milestone

Added /open-source with 37 upstream projects across 8 categories and URL-persisted search/category/stack/license filters. Stored pinned license evidence and full notices. Projects with restrictive or unresolved terms were excluded. Upstream website checks used repository fallback where needed.

Added /open-source/components with 13 imported shadcn/ui-derived live previews, light/dark controls, source inspection and an attributed complete-file ZIP. The pack contains 27 payload files plus its manifest, including component source, helper, scoped theme CSS, dependency versions, licenses, provenance and checksums. All 13 exported modules bundle outside Next.js using workspace-installed dependencies. This is not a fresh-consumer installation claim for this new pack.

Added /open-source/icons with 36 curated Lucide icons, search, size/stroke/color controls, React usage copying and SVG export. SVGs retain the original license text in escaped metadata.

Verification: 22 tests passed, including license-text hashes, pinned revisions, directory filters, exclusion checks, source-pack notice/completeness checks, origin hashes, deterministic ZIP bytes, and SVG metadata escaping. Production build passed for all new pages and download endpoints. Lint passed. No connected browser was available; screenshots, responsive visual review and click/keyboard interaction checks are not claimed.

The directory is curated, not a complete index of all web resources. Linked projects are not all installed or included in the source pack. THIRDPARTY notices and upstream licenses retain their original scope.

# Motion collection milestone

Six pinned Motion Primitives-derived components added at /open-source/motion, with live examples, code viewing and a complete 21-file payload plus manifest. Local modifications cover relative imports, readable static fallbacks, controlled background selection/event composition, safe text-loop intervals, clamped panel indexes, stable motion tags and border-mask composition. Reduced-motion preferences and hidden-document state are handled in a shared hook; the example gallery also pauses offscreen previews.

28 Node tests pass, including paused/readable SSR behavior, empty text, invalid indexes, retained notices, canonical origin hashes and deterministic motion ZIP delivery. Both the existing 13-component UI pack and the six motion modules plus examples bundle outside Next.js using workspace-installed dependencies. A fresh consumer install for the new motion pack is not yet claimed.

Windows Computer Use initialized, but its browser action was stopped because the current browser URL could not be identified confidently enough for its policy checks. No further UI actions were issued, and no browser screenshots, live interaction or keyboard review are claimed for this milestone. Code/build and local HTTP checks remain separate evidence.
