# Migbits implementation roadmap

Source: UI-Library-Website-Research-and-Implementation-Report.pdf, all 26 pages, prepared 15 October 2026. This plan consolidates phases A-L without treating recommendations as verified vendor capabilities.

## Current checkpoint — 26 October 2026

The historical phase descriptions below are a plan, not a list of missing features. Existing category/detail galleries, isolated lazy previews, code/source downloads, reduced-motion controls, ready themes, editable generators and the standard eight-item registry are implemented. Cloudflare deployment and Chrome browser journeys have been exercised; this does not prove untested D1/R2/auth/payment flows.

The current template expansion builds 114 complete kits (131 pages) in a 467-resource gallery. The 500-kit target remains in progress with 386 missing; see `TEMPLATE-COLLECTION-EXPANSION.md` and the persistent inventory. Sitemap, crawl exclusions and canonical URLs are implemented in this change. Accessibility audits, multi-browser coverage, field performance evidence and original onboarding remain unfinished.

Next user-ordered expansions: a 3D Models section with 150 distinct professionally designed, redistributable models, followed by 100 distinct reviewed motion backgrounds. These are queued after the template work, not counted as existing content. Free/Pro categorization and commerce remain deferred.

## Product brief

Audience: React developers and small agencies building SaaS marketing sites and application interfaces. Initial stack: React, TypeScript, Tailwind-compatible semantic CSS variables. Keep reusable source independent of Next.js, hosting, authentication, and billing.

First customer task: find a profile/settings layout, apply a brand preset, inspect mobile/loading/error/empty behavior, and install matching source. Follow with an onboarding flow and related original artwork sharing the same tokens. Measure time to usable output, manual corrections, unresolved errors, visual consistency, and repeat use. No customer observation or competitive outcome has been established yet.

## Phase 1 - Foundation and first workflow (A, local B, initial C)

Deliverables: this brief; route map; taxonomy; architecture and rights decisions; semantic tokens; versioned catalog contracts; original profile-settings resource; local browse-to-inspect prototype; catalog validation and relevant behavior tests.

Exit gate: catalog validation and production build pass; the initial resource has explicit dependencies, provenance, state contracts, compatibility limits, and reusable source. Runtime, browser, user validation, and clean-consumer evidence remain separate open gates.

Status: implementation started. Existing GitHub repository, CI and landing page are retained. This is a development milestone, not a public beta release.

## Phase 2 - Complete public library beta (C, D, E)

- Finish shared primitives and original onboarding/settings/artwork pack.
- Generate catalog, meaningful categories, resource pages and guides from the catalog.
- Search synonyms, URL-persisted filters/sort, reset, useful empty states and mobile filters.
- Schema-driven studio with last-valid settings, undo/reset, versioned local preset import/export.
- Use the same validated model for previews and deterministic complete-file exports.
- Include dependencies, licenses, notices, checksums and a shadcn-compatible free registry.
- Publish only useful reviewed categories; use static result thumbnails and on-demand live previews.

Exit: a developer can browse, customize, export and install the exact resource into a clean and an existing themed supported project. Public metadata never contains protected source.

## Phase 3 - Release quality and hosting (remaining B, F, free-scope I)

- Prove the selected Cloudflare deployment adapter with SSR, imports, D1, R2, auth callback and a verified test webhook in preproduction.
- Record exact tested versions before deciding whether a framework change is needed. Do not rewrite the working Next app merely to match a scaffold suggestion.
- Add meaningful Playwright journeys across declared Chromium/Firefox/WebKit configurations and exported-resource checks.
- Review keyboard, screen-reader journeys, contrast, reflow/zoom, reduced motion, long content and error states. Automated checks are evidence, not a conformance claim.
- Measure site and exports separately; target LCP <=2.5s, INP <=200ms, CLS <=0.1. Lab results are not field proof.
- Add canonical URLs, sitemap, deliberate filter indexing, smoke tests, support, backups, restore and code/catalog rollback rehearsals.
- Switch the deployment provider only after the prototype passes; keep production secrets away from untrusted PR code.

Exit: recorded preproduction integration results, passing critical journeys, honest coverage and known limits, verified recovery. External accounts/domain configuration remain real dependencies.

## Phase 4 - Accounts and commerce (G, commercial I)

Established auth; D1 ownership checks; trusted Dodo product mappings and hosted checkout; verified raw-body webhook signatures; durable deduplicated inbox and safe retries/reconciliation; entitlements; private R2 artifacts; account downloads/billing; purchase recovery and clear license/refund/trial/support policies.

Exit: success, duplicate/delayed/out-of-order events, outage, cancellation, refund, expired link and wrong-user retrieval behave according to the published policy. Browser payment redirects never grant access. Hosted trials do not promise to recall downloaded source.

## Phase 5 - MCP delivery (H)

Implement search_resources, get_manifest, get_preview, get_preset_schema, get_install_plan, get_source and get_changes against shared catalog services. Follow the current remote authorization specification, bounded responses and exact versions. Public registry interoperability can ship earlier.

Exit: website/registry/MCP files and presets agree; protected retrieval checks both authorization and entitlement; tested clients and limitations are documented. No remote filesystem or unrestricted shell claims.

## Phase 6 - Maintenance and expansion (J, K, L)

Use aggregate failed searches, installation issues, support effort and completed customer tasks to choose improvements. Add changelogs, release comparisons and reviewed upgrade diffs before considering supported local adapters. Consider Figma parity, teams, private catalogs, other frameworks or a constrained composer only with demand and support capacity. Desktop apps, arbitrary visitor code, AI generation and public submissions are deferred.

Exit per addition: a validated customer task, named maintenance responsibility, rights checks and format-specific release tests.

## Route map

Implemented now: /, /library, /resources/profile-settings.
Next: /library/:category, /studio/:resourceId, /guides/:slug, /templates and /templates/:slug only after reviewed content exists.
Commerce: /pricing, /checkout, /purchase/:id, /login, /account, /account/downloads, /account/billing, /support and legal pages.
Agent delivery: /docs/mcp, /mcp; delivery API and versioned registry routes.

## Risk and evidence register

- Prototype usability and brand differentiation: unvalidated with customers.
- Workers runtime: untested; no preproduction deployment claimed.
- Browser/screen-reader coverage: untested until recorded review.
- Preview/export fidelity: beta gate; no source-install claims for landing-page snippets.
- Paid access: not implemented; no pricing or checkout offered.
- Asset rights: original authored resources only; competitor design research does not license redistribution of their assets, descriptions, thumbnails or premium source.
- Broad taxonomy: model all categories; avoid empty public navigation.
- Scheduling: estimate after the first complete hosted workflow. Reserve effort for docs, review, fixes and ongoing support.

## Next work tickets

1. Complete standalone consumer build fixture for profile settings.
2. Add onboarding and original SVG artwork using the shared preset.
3. Implement deterministic file exports and versioned install receipts.
4. Prove Workers compatibility in a separate preproduction integration prototype.
5. Run and record browser/a11y customer journeys before public beta.

## Current progress after the first Phase 2 slice

Complete: the first resource's configured source ZIP, file viewer/copying, checksum receipt, versioned local registry, installation guide, preset undo, clean consumer build, 48-preset markup checks, and shadcn 4.22.1 consumer installation. Public beta remains incomplete.

Next: original onboarding and related SVG artwork sharing the same tokens; meaningful category pages; browser/export visual and interaction review; Cloudflare preproduction proof; owner distribution-license decision; public registry release. No commerce or MCP features were added during this slice.
