# Twelve original industry templates

This batch adds six software, three footwear and three drinks concepts as single-file frontend landing templates. Each has a full-viewport introduction, lower content, contact section and footer. They use the existing isolated preview, fullscreen control, colour controls, code viewer and source ZIP workflow.

| Category | Template | Art direction |
|---|---|---|
| Software | Relay Workspace | Violet workspace and perspective dashboard |
| Software | Cascade Automation | Light green editorial typography and workflow nodes |
| Software | Prism Analytics | Centred dark analytics presentation and chart |
| Software | Haven Security | Blue shield and orbiting access markers |
| Software | Syntax API | Lime developer landing and illustrative code window |
| Software | Papertrail Knowledge | Warm editorial layout and layered notebook |
| Footwear | Velocity Running | Athletic typography and original running-shoe SVG |
| Footwear | Concrete Sneakers | Oversized streetwear layout and original high-top SVG |
| Footwear | Form Footwear | Premium serif typography and original loafer SVG |
| Drinks | Squeeze Citrus | Yellow citrus direction and original can SVG |
| Drinks | Popwave Soda | Purple dotted setting and pink soda can |
| Drinks | Stillwater Tea | Botanical palette and original glass-bottle SVG |

Source: `resources/library/fullscreen-templates/sectors.ts`. Builder: `scripts/build-fullscreen-templates.ts`. Validation: `catalog/library/sector-template-validation.json` and `catalog/library/cleanup-preview-validation.json`. All names, illustrations, layouts and copy are fictional original MigBits concepts. No stock photography, real brand logo, copied product artwork or third-party prompt is included. System fonts and native CSS/Canvas/SVG keep dependencies out of the application bundle. MIT copyright and permission notices are embedded in HTML and preserved in each ZIP.

Motion starts automatically, pauses with the local/gallery policy, and preserves elapsed time across pause/resume. Reduced motion freezes Canvas and disables CSS motion. Browser checks cover changing pixels, pause, keyboard focus, responsive width, navigation, and reduced motion. Screenshots are reviewed for desktop and mobile sizing. These checks are not a complete production accessibility certification.

These are frontend concepts: dashboards, analytics and code panels are illustrative. No real software service, SDK, account system, commerce, payment, shipping, stock management or beverage health claim is supplied. Replace example content and connect your own services before production.

This batch adds 12 template entries, taking the gallery to 361 resources and 136 template entries. The imported complete website-kit target is tracked separately; these single-page frontend concepts do not increase the imported-kit count.

Publication verified: 48 unit tests, 12 focused local browser tests, 16 live browser tests, lint, TypeScript and Cloudflare production build passed. All 60 checked live artifacts match the tested versions. All 12 ZIPs are self-contained and retain MIT notices. Source: `30ce51a3d240c845f4eb423e7a791a2fc0d5eff5`; Cloudflare version: `90569458-b23d-4352-8a7b-0df8ed8379e9`. Broad CI is still running at recording time: https://github.com/rakshithp1/migbits/actions/runs/40541480761. The prior release CI failed solely on the old Atlas-first gallery expectation (56 other browser tests passed); the assertion is corrected and passed live in this release.
