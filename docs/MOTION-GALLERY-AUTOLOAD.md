# Motion gallery layout and automatic resource loading

26 October 2026.

## Changes

The supplied screenshot showed four full-page screenshots squeezed into each Motion collection card. Their headers and examples became too small to read. The gallery now uses original MigBits vector overviews with readable titles, example counts and distinct visuals for all ten Motion families. These are labelled collection overviews, not upstream screenshots. Actual upstream examples and source variants remain on the detail pages.

The Motion collection grid uses three columns on desktop, two on smaller screens and one on phones. Vector cover motion honors the existing site pause button and operating-system reduced-motion preference. Gallery cards do not start hundreds of example iframes.

Resource detail pages mount their isolated iframe immediately, without the previous “Load interactive preview” or “Load source kit overview” gate. Variant selection, source copying, installation instructions, device sizes and sandbox permissions remain available. Opening Source unmounts the example, and returning to Preview mounts it again automatically. Gesture examples still respond to their intended hover, press or drag; GPU renderers retain their own device support and internal playback policies.

## Validation scope

The existing browser suite exercises navigation, sources, exports, responsive layouts, reduced motion and the original interactive components. Additional default-preview audits visit every current component and block detail page, check automatic iframe mounting, verify meaningful rendered content and collect runtime exceptions. These checks do not certify every prop combination or replace the source-kit installation and accessibility limits already recorded in the resource audit.

Desktop and mobile captures were visually reviewed against the supplied screenshot. The source content and existing source/download/notice hashes are unchanged by this presentation update.

## Rights recheck

The current [GetLayers terms](https://www.getlayers.ai/terms-of-use), [GetLayers docs](https://www.getlayers.ai/docs) and [Nexus UI terms](https://www.nexus-ui.com/terms) still restrict redistribution through a competing library. Ending a subscription or removing a notice is not treated as a new permission grant. Restricted catalogs remain excluded; the separately verified open-source imports retain their original licenses and notices. No restricted source was copied or superficially restyled for these original vector covers.
