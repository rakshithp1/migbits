# Reviewed expansion — 25 October 2026

User authorized implementation, push and production deployment. Free/Pro tiers, payments and premium licensing remain deferred.

## Delivered scope

- 314 existing gallery entries retained; 29 additional cards represent 43 reviewed source scopes (343 total).
- Eight React components: three Animata, one Cult UI, four Kokonut UI.
- Four HyperUI blocks, each retaining light/dark variants (eight source scopes).
- Six static PatternCraft backgrounds, accurately separated from motion demos.
- Six Open Props foundation modules, Radix Colors, Open Color and a 318 non-logo Radix SVG icon pack.
- Two CC0 illustration collections containing six selected Open Doodles and six Open Peeps files. Individual variant and complete collection downloads are available.
- Moving blue atmosphere throughout the main site, entrance motion, hover/click/focus effects, a motion pause control and live OS reduced-motion support.

## Evidence and repeatability

`catalog/resource-processing-queue.json` persists 457 reviewed scopes: 43 imported and render-validated, 388 approved scopes pending technical integration, 25 conditional and one unverified held. These are mixed source/package units, not gallery card counts, and are not an exhaustive reconciliation of every website requested. Existing technical holds and rights-cleanup exclusions remain in force.

`resources/approved/<id>/review.json` pins original file hashes, source revision, license evidence and creator. `catalog/approved-resource-validation.json` records isolated Chrome rendering and nonblank thumbnails for all 43. This does not certify full accessibility, every GPU/browser or every usage configuration.

The main catalog builder refuses changed original source, stale preview hashes, missing thumbnails or missing approval. Immutable upstream source is excluded from application lint so lint autofixes cannot alter preserved originals. Installed component adaptations are separately typechecked and bundled in a disposable consumer.

Eight `/r/migbits-*.json` registry items were installed using official shadcn 4.22.1 into an independent React 19.3 / TypeScript ES2022 consumer. Typechecking, bundling and notice preservation passed. Installation instructions are exposed only when the validated registry artifact hashes match.

## Maintenance commands

1. `npm run build:approved-previews` rebuilds isolated previews from committed, reviewed source; never fetches an unreviewed replacement.
2. Serve `public/` locally on port 3212 and run `npm run validate:approved-previews` for render evidence/thumbnails.
3. `npm run build:catalog` generates catalog and standard registry artifacts.
4. `npm run test:approved-registry` exercises official installation; `APPROVED_PREVIEW_ORIGIN` selects the served origin.
5. Run application lint, type, unit, browser, consumer, hosting and Cloudflare build checks before publication.

Original code and preview/install adaptations remain distinguishable. No conditional Figma kits, restricted templates, React Bits source or competing-library-restricted assets are authorized by this release. The existing Figma resource remains an SVG/plugin kit, not a claimed native `.fig` download.

## Next work

Process the remaining queue in scoped batches with exact-source license and dependency checks, nonduplicate gallery presentation and isolated rendering. Full accessibility reviews remain per-entry work. Native Figma resources and complete premium products require independently created work or separately verified permissions. Tiering, payment webhooks, authenticated registry and protected downloads are deferred.
