# Migbits resource gallery

The primary site and /library now browse the same visual catalog. The previous motion landing page remains at /playground; existing component, motion, icon, source archive and profile workflow routes remain available.

| Category | Entries | Origin / terms |
| --- | ---: | --- |
| Components | 68 | 65 shadcn modules and 3 compositions; MIT with separate dependency notices |
| Blocks | 68 | Pinned Inspo reference blocks; MIT, original source and adapted sandbox previews |
| Templates | 6 | Original Migbits standalone HTML/CSS/JS; MIT |
| Typography | 12 | Google Fonts families, each with pinned revision and exact OFL notice |
| Colors & theory | 192 | Reviewed UI UX Pro Max semantic palettes; MIT notices preserved |
| Illustrations | 12 | Original Migbits editable SVGs; MIT notice embedded in downloadable SVG |
| Figma UI kits | 3 | Original boards, tokens and native component generator source; MIT |

361 entries total. The secondary archive still holds 70 Magic UI core records and 200 shader definitions that are not promoted as ready visual-gallery entries. Previously removed resources stay removed; the broad source importer remains paused by catalog/rights-cleanup.json.

## Browsing and previews

The gallery follows the navigation pattern researched on [21st.dev's component gallery](https://21st.dev/community/components): dark browse surface, primary category tabs, type-filter chips, search and a four-column visual grid. Migbits uses its own branding, copy, implementation and previews; 21st screenshots, logos and submissions are not imported.

Search, categories, type filters, sorting, usage filters and pagination work on the server without JavaScript. Source panels load files only when opened. Interactive examples load on request in an iframe sandbox allowing scripts without same-origin access. Preview code receives no server environment variables. Static thumbnails are lazy-loaded; component bundles do not load in gallery cards.

Typography provides editable specimens and weight/size controls. Palettes provide hex/CSS copying, a WCAG contrast calculator and complementary, analogous and triadic harmonies. Illustrations support accent recoloring with an editable SVG download.

## License and resale

MIT permits selling copies when its copyright and license notices are preserved. Component-pack dependencies retain their own notices and terms. The Sale of copies allowed filter excludes OFL fonts: OFL permits commercial use and bundling, but prohibits selling font files by themselves. The /library/licenses page and each detail page explain these terms.

Original Figma downloads are editable SVG boards and plugin source, not .fig binaries. The README gives direct SVG import and development-plugin instructions. The generator creates button variants, input, badge, card, navigation, hero, pricing, a starter screen and paint styles. Syntax and package structure are checked; native execution in a Figma account is not verified.

Template forms, dashboard data and store checkout are frontend demonstrations, described in the detail page and README. They do not send data or process payments.

## Repeatable workflow

npm run build:catalog generates the existing source packs and the visual catalog's metadata, per-resource code payloads, original assets and attributed ZIPs. It does not reimport removed sources or install example dependencies into the application.

Set GALLERY_BASE_URL to the production preview server, then run node scripts/capture-library-previews.mjs to capture missing thumbnails. --all refreshes them. catalog/library/preview-validation.json records results per resource. Render checks establish a basic browser render, not full keyboard, accessibility or integration validation.

catalog/library/build-report.json records category counts. Fonts retain their revision/hash inventory in catalog/library/fonts.json; imported resources retain pinned evidence in catalog/import-index.json and each attributed ZIP.
