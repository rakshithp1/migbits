# Migbits

A visual UI resource gallery with 114 distinct entries after removing 247 repetitive variants. Categories cover components, blocks, templates, typography, color theory, illustrations and Figma kits. Browse at `/library`; the original motion playground remains at `/playground`. See [the gallery guide](docs/RESOURCE-GALLERY.md) for counts, licensing, previews and the repeatable build workflow.

## Imported source catalog

`/open-source/imports` contains 301 retained, attributed records after rights and visual reviews. The initial rights cleanup removed 4,672 records; subsequent visual curation removed 229 additional imported records and 18 other gallery entries. Retained records include 15 isolated block previews. Source checking does not establish production readiness.

See [docs/IMPORT-REPORT.md](docs/IMPORT-REPORT.md) for current counts and removals. The importer is paused by `catalog/rights-cleanup.json` to prevent removed content returning. `npm run report:imports` refreshes the reconciliation report. Source archives stay outside the site's application bundles.

An expressive React component landing page, built with Next.js, React, TypeScript, and CSS.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. The complete 65-component shadcn collection and three composition recipes are at `/open-source/components`; see [docs/SHADCN-COLLECTION.md](docs/SHADCN-COLLECTION.md) for source provenance, downloads, and browser verification.

## Validation

```sh
npm run lint
npm run build
npx tsc --noEmit
```

## CI/CD

`.github/workflows/ci-cd.yml` runs lint, the production build, and TypeScript checks for pull requests and pushes to `main`. Failed checks prevent the deployment job from running. Superseded runs are canceled.

Production deployment uses Cloudflare Workers with OpenNext and is disabled until account credentials are configured. See [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) for setup, domain connection, HTTPS verification, and rollback.

1. Authenticate with `npx wrangler login` and verify a first Workers deployment.
2. Add the GitHub Actions secret `CLOUDFLARE_API_TOKEN` and variables `CLOUDFLARE_ACCOUNT_ID` and `PRODUCTION_URL`.
3. Add an Actions repository variable named `CLOUDFLARE_DEPLOY_ENABLED` with the value `true`.
4. Push to `main`, or run the workflow manually on `main`.

The deployment job publishes the Worker artifact produced by the checks job after CI passes. Pull requests never receive deployment credentials. The configured production URL appears in GitHub's production environment and is smoke tested after deployment.

The site is deployed at https://migbits.com with https://www.migbits.com redirecting to it. The public hosting check passed against the domain. Automatic GitHub deployment remains disabled until the dedicated Cloudflare API token is configured; see the hosting guide for current evidence and setup.

## Product roadmap and first implementation slice

The complete 26-page product report has been consolidated into six phases in [docs/ROADMAP.md](docs/ROADMAP.md), with architecture and rights decisions in [docs/DECISIONS.md](docs/DECISIONS.md).

The local development catalog is at `/library`; the first original resource is at `/resources/profile-settings`. It supports brand tokens, validated preset import/export, and realistic form-state previews. Saves are explicitly simulated. This draft is not yet a public-beta resource or an installable registry entry.

Run `npm run validate:catalog` and `npm test` alongside the validation commands above. See [docs/VALIDATION.md](docs/VALIDATION.md) for evidence and outstanding release gates. `npm run build:cloudflare` builds the Workers adapter; `npm run preview:cloudflare` runs it locally. Live deployment has separate account and domain requirements.

## Phase 2 progress: complete-file delivery

The profile-settings page now provides a source browser, configured ZIP download, validated preset undo/import/export, and a versioned local shadcn registry. See `/guides/installation` for complete instructions and the simulation/backend boundaries.

`npm run build:catalog` snapshots allowlisted public-access resource files; `npm run test:consumer` extracts the actual ZIP into a separately installed React consumer and verifies TypeScript, JS/CSS bundling, and 48 preset combinations in rendered markup. Draft registry/source endpoints work only in development and fail closed in production. These are local delivery milestones, not public beta completion.

## Open-source collection

Browse `/open-source` for 37 repository/license-reviewed projects across components, primitives, motion, icons, data/charts, templates, foundations and graphics. Try `/open-source/components` for 65 integrated shadcn/ui-derived components and a complete attributed source pack. The directory links upstream; the UI and motion collections are integrated. See THIRD_PARTY_NOTICES.md and docs/OPEN-SOURCE-COLLECTION.md for provenance and scope.

The collection also includes `/open-source/icons`: 36 curated Lucide icons with search, size/stroke/color customization, React usage copying and attributed SVG export. Original ISC and applicable MIT notices are preserved in exported SVG metadata.

## Motion collection

`/open-source/motion` adds six Motion Primitives-derived components: text loop, animated background, transition panel, border trail, magnetic interaction and staggered group. The 21-file source pack includes complete reusable examples, scoped styles, motion policy, dependencies, checksums, provenance and MIT notices. The collection now has 71 integrated UI/motion primitives, plus 3 composition recipes, in addition to the 36-icon explorer.


Archive review and current preview validation: [docs/ARCHIVE-PROMOTION.md](docs/ARCHIVE-PROMOTION.md). The public archive now redirects to the library; only successful visual demonstrations are promoted.

## Ready themes and visual tools

`/library/themes` contains 12 original light/dark themes with semantic CSS export, typography roles, decorative gradients and interactive component-state previews. The header theme picker persists the selected theme and appearance. Theme presets live in `resources/library/theme-presets.json`; after editing reviewed presets, run `npx tsx scripts/sync-theme-tokens.ts`. The catalog build rejects stale generated site tokens.

`/library/icons` adds 16 reviewed generic Fluent multicolor SVGs and six original CSS motion recipes. Copy/export preserves the full Microsoft MIT license and NOTICE. Original pinned SVGs and per-file hashes are in `resources/visual/fluent-color/`; no restricted animation collections were copied. Typography specimens now include responsive scales, palette editors include animated gradient CSS export, and original illustrations support five editable palette roles. See [visual expansion notes](docs/VISUAL-EXPANSION.md).
