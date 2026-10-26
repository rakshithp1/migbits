# Motion template expansion

## Verified results and counting

The built catalog contains 114 complete template kits: 3 original MigBits templates, 15 reviewed Start Bootstrap motion editions and 96 reviewed single-file collection kits. Together they contain 131 pages. Pages, light/dark versions and animation variations do not count as extra templates. The complete resource gallery contains 467 entries across all categories. See TEMPLATE-COLLECTION-EXPANSION.md for the latest batch, rights scope and checks.

**The requested 500-template target is not complete.** `catalog/template-research/progress.json` tracks the target, actual gallery count and remaining gap. No 500-template claim is displayed in the application.

## Research evidence

Four official GitHub repository queries were fully paginated: 235, 863, 264 and 559 results, deduplicated to 1,799 repository candidates. These broad motion/template searches also find libraries and applications; discovery is not evidence of a complete template. Actual primary license files were retrieved at pinned commits for screening; 1,775 contained the checked MIT grant. That does not establish creator provenance, asset rights, dependency rights or a working complete animated website.

Fifteen individually reviewed official creator repositories are additionally recorded in the queue, separately from broad search discovery. Every unreviewed candidate remains `UNVERIFIED` and is excluded from public import. Candidate/license URLs, hashes, revisions and query provenance are persistent. `search-manifest.json` records pagination and confirms no query was truncated by GitHub's per-query result cap. This is bounded research, not an exhaustive inventory of the internet.

`catalog/template-research/web-sources.json` records official website evidence. Cruip and Getastrothemes prohibit the intended rehosting. Astro and shadcn.io directories require per-item review. The 8B code license does not by itself verify stock artwork, fonts and the GSAP dependency; the official GSAP standard-license endpoint redirected to a temporary offline page during this review. Velora UI's MIT grant needs further asset/dependency/source-scope review. None of those unresolved bundles was imported.

## Imported scope

Agency, Creative, Grayscale, Freelancer, Landing Page, New Age, Personal, Resume, Business Casual, Modern Business, Stylish Portfolio, Clean Blog, Small Business, Business Frontpage and Scrolling Navigation are separate upstream kits. All selected prebuilt pages are included; they are not counted as individual kits.

The exact original author HTML, compiled CSS, author scripts, README and package metadata remain distinct from the runnable adaptation. Upstream photography, avatars, logos, font binaries, favicons and executable vendors were excluded. Original MigBits SVG artwork replaces image references; it is not a relicense of the original photos. System fonts replace unbundled remote fonts. Each embedded Bootstrap CSS version has its separately retrieved MIT notice.

The runnable edition uses native IntersectionObserver/Web Animations APIs, hover effects, motion pause/resume, live OS reduced-motion support, local navigation and explicit frontend form-demo states. Original external scripts and services do not execute. Forms and commerce controls are demonstrations, not a connected backend. Changes and exclusions are documented in every ZIP.

## Product improvements

- Template-category tabs with real counts.
- Animated-only and multi-page-kit filters that retain search state in URLs.
- Page counts and motion badges; metadata in detail pages.
- Per-page preview selection for multi-page kits.
- Lazy isolated iframe previews; no example dependencies added to the application install.
- Ready-to-open HTML ZIPs, copying runnable source, original-source inspection and complete notices.

## Publication gates and repeatability

1. `npm run research:templates` resumes official API discovery and license-file screening. It never publishes a candidate.
2. `npx tsx scripts/build-motion-templates.mts --fetch-reviewed` explicitly snapshots selected creator source only after checking the actual author and Bootstrap license grants. It does not execute upstream build scripts or copy excluded binary assets. Existing pinned snapshots are retained.
3. `npm run build:motion-templates` rebuilds from committed, checksummed snapshots offline.
4. Serve `public/` on port 3212, then run `npm run validate:motion-templates`. All 32 imported pages are checked for rendering, images and mobile width; all 15 kits are checked for motion controls/reduced motion, and nonblank thumbnails are generated.
5. `npm run build:catalog` refuses unapproved source, stale page hashes, missing notices, changed ZIP/data/thumbnail artifacts or missing proof. Application builds do not fetch or install every source repository.
6. Run lint, types, unit/browser checks and the Cloudflare build before deployment.

These checks are not a full per-entry accessibility, browser compatibility or production-service certification. Original template attribution remains visible. The existing resource holds, rights cleanup and Free/Pro deferral remain unchanged.

## Remaining work

The remaining 1,799 broad-search candidates still require complete-template classification, creator/dependency/artwork review, deduplication and isolated validation. Missing rights or restricted redistribution must remain held; repository SPDX metadata alone is insufficient. Additional approved source families should be added in genuinely distinct kits rather than multiplying this batch by palette or animation changes. The gap to 500 complete kits is 386.
