# Continuous gallery, visual ordering and fitted preview canvases

26 October 2026.

## User-visible changes

- A visually reviewed editorial order puts polished templates, coordinated themes, colorful icon collections, selected shaders and richer components first. Simpler primitives, technical examples and source-only developer kits remain available below. Name sorting, search, category and license filters still work.
- Numbered gallery pagination is removed. Every matching resource appears in one continuous server-rendered gallery, including without JavaScript. Images retain native lazy loading; the listing never starts hundreds of example iframes.
- Three original hero backgrounds — Aurora, Orbit and Prism — rotate every 6.5 seconds. Manual selection resets the interval. Rotation stops when the tab is hidden, the site is paused or reduced motion is requested.
- The supplied preview screenshot exposed a full-viewport example inside a padded iframe canvas. The Motion wrapper now reserves space for its header/toolbar, bounds horizontal content and wraps long headings. The Presence image-gallery adaptation fits its image to the available canvas, keeps both navigation arrows visible, and supports keyboard activation.
- SVG examples with numeric width/height and no viewBox receive a preview-only viewBox so they can shrink proportionally. Missing preview image descriptions are supplied. These adaptations do not rewrite the upstream source snapshots.
- The main resource download button uses the selected theme's primary foreground/background pair, fixing the low-contrast button in the supplied screenshot.

## Verification and boundaries

All 109 Motion variants and both developer-kit overview pages passed renewed isolated render, image, motion-control and mobile document-width checks. The source-kit installation/backend status remains unverified. Original upstream text files and copyright grants remain separate from preview adaptations.

Local checks: 45 unit tests, lint, type checking, Cloudflare production build and 18 focused browser journeys passed. The journeys cover continuous scrolling with and without JavaScript, preserved filters, visual ordering, hero auto-rotation/manual selection/reduced motion, image-gallery containment and keyboard navigation, source downloads and mobile layouts. Desktop screenshots of the homepage, gallery and fitted Presence example were inspected.

Visual priority is editorial presentation, not a measured quality, popularity, accessibility or maintenance score. No resource is removed simply for being minimal, and no new templates are counted for the three decorative hero scenes.
