# Migbits resource gallery

The primary site and /library now browse the same visual catalog. The previous motion landing page remains at /playground; existing component, motion, icon, source archive and profile workflow routes remain available.

| Category | Entries | Origin / terms |
| --- | ---: | --- |
| Components | 55 | Distinct shadcn examples; helper-only and overlapping cards omitted; complete attributed source pack retained |
| Blocks | 15 | Visually reviewed Inspo blocks; repetitive editorial variants removed |
| Templates | 3 | Original SaaS, dashboard and dark event starting points; repeated hero layouts removed |
| Typography | 12 | Google Fonts families, each with pinned revision and exact OFL notice |
| Colors & theory | 16 | Visually diverse UI UX Pro Max palettes with unique primary colors; MIT notices preserved |
| Illustrations | 12 | Original Migbits editable SVGs; MIT notice embedded in downloadable SVG |
| Figma UI kits | 1 | Original Studio kit; the two recolored copies of its structure removed |

114 entries total, after removing 247 repetitive gallery records. The removal audit, replacements and persistent allowlist are in catalog/library/curation.json. All 12 fonts and 12 genuinely different illustration subjects remain. The secondary archive holds 70 Magic UI core records and 200 shader definitions that are not promoted as ready visual-gallery entries. Previously removed resources stay removed; the broad source importer remains paused by catalog/rights-cleanup.json.

## Browsing and previews

The gallery follows the navigation pattern researched on [21st.dev's component gallery](https://21st.dev/community/components): dark browse surface, primary category tabs, type-filter chips, search and a four-column visual grid. Migbits uses its own branding, copy, implementation and previews; 21st screenshots, logos and submissions are not imported.

The homepage now also follows the reference's overall composition: an original flowing blue SVG backdrop, centered two-line hero, paired browse actions, a framed library showcase, resource/category sections, workflow cards, FAQs and a final call to action. Header menus, keyboard search and the showcase controls work. The gallery uses a 1,104-pixel desktop content area, inline search, compact cards and a single-column mobile grid. Migbits keeps its real resource counts and license information.

Search, categories, type filters, sorting, usage filters and pagination work on the server without JavaScript. Source panels load files only when opened. Interactive examples load on request in an iframe sandbox allowing scripts without same-origin access. Preview code receives no server environment variables. Static thumbnails are lazy-loaded; component bundles do not load in gallery cards.

Typography provides editable specimens and weight/size controls. Palettes provide hex/CSS copying, a WCAG contrast calculator and complementary, analogous and triadic harmonies. Illustrations support accent recoloring with an editable SVG download.

## License and resale

MIT permits selling copies when its copyright and license notices are preserved. Component-pack dependencies retain their own notices and terms. The Sale of copies allowed filter excludes OFL fonts: OFL permits commercial use and bundling, but prohibits selling font files by themselves. The /library/licenses page and each detail page explain these terms.

Original Figma downloads are editable SVG boards and plugin source, not .fig binaries. The README gives direct SVG import and development-plugin instructions. The generator creates button variants, input, badge, card, navigation, hero, pricing, a starter screen and paint styles. Syntax and package structure are checked; native execution in a Figma account is not verified.

Template forms, dashboard data and store checkout are frontend demonstrations, described in the detail page and README. They do not send data or process payments.

## Repeatable workflow

npm run build:catalog generates the existing source packs and the visual catalog's metadata, per-resource code payloads, original assets and attributed ZIPs. It does not reimport removed sources or install example dependencies into the application.

Set GALLERY_BASE_URL to the production preview server, then run node scripts/capture-library-previews.mjs to capture missing thumbnails. --all refreshes them. catalog/library/preview-validation.json records results per resource. Render checks establish a basic browser render, not full keyboard, accessibility or integration validation.

Component thumbnails focus on actual content and open menus, dialogs or popovers when applicable. They no longer present most examples as tiny controls on an otherwise blank canvas. Run node scripts/prune-similar-resources.mjs to reapply the saved curation policy; the builder's allowlist prevents excluded cards and assets being regenerated.

catalog/library/build-report.json records category counts. Fonts retain their revision/hash inventory in catalog/library/fonts.json; imported resources retain pinned evidence in catalog/import-index.json and each attributed ZIP.
