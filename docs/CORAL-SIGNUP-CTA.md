# MigBits coral signup CTA and footer

Implementation of the user-supplied fictional-company design brief, branded for MigBits and published as a **Blocks** resource. It is not a replacement for the website's actual contact or authentication infrastructure.

## Delivery

- One self-contained `index.html`: plain HTML, CSS and vanilla JavaScript; embedded static plate, five-second MP4 and variable Inter font. No framework, build step, remote media, CDN or runtime package installation.
- Desktop reference units, height-aware card sizing and tablet/phone adaptations. The 1440×960 acceptance view has a 1380×340 card, white centred copy, black waitlist pill, coral gradient button, two-column footer and matching side margins.
- A 1.4-second one-time CSS entrance, border draw, title rise, copy fade, expanding form, button pop and final mark fade. Essential content remains visible if motion is paused before the entrance finishes.
- Forward muted video playback, a final-second blend to its initial procedural frame, fade on `loadeddata`, right-bottom cover at 80% opacity, pause/visibility handling and a static reduced-motion plate. There is no reverse playback or activation gate.
- Accessible email label, native validation and a sandbox-safe local confirmation. It does not submit, store or subscribe an email. Demo contact details are explicitly labelled.
- Screenshot thumbnail, source viewer, deterministic source ZIP and full notices.

## Rights and provenance

The provided CloudFront image/video were accessible but supplied without verifiable redistribution terms. They are not bundled. An original MigBits procedural smoke shader was written, then recorded into a five-second MP4; both its still plate and regeneration source are included. This preserves the requested visual direction without attributing third-party media to MigBits.

The design brief itself is user-supplied and is not represented as an original MigBits prompt. No `PROMPT.md` is redistributed for this block. Code and original smoke media are MIT. The unmodified Inter font is SIL OFL 1.1; its complete copyright/license is embedded in the HTML and included separately. It is a CSS family alias, not a renamed or modified font binary. The combined resource is labelled `MIT AND OFL-1.1`; the font is not a standalone resale product.

Pinned font source: https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/inter . License: https://github.com/google/fonts/blob/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/inter/OFL.txt . SHA-256: `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`.

Validation is recorded in `catalog/library/coral-cta-validation.json`. Regenerate catalog artifacts with `npm run build:catalog`, serve `public/`, then run `node scripts/validate-coral-cta.mjs`. The finished download requires none of those build tools.

An opaque-iframe Chromium compositing stall was reproduced after the entrance ended. The video layer now stays above the plate darkening layer, the drawn border uses an underlay rather than an overlaid CSS mask, and a non-visible subpixel compositor timeline keeps embedded translucent video frames scheduled. This timeline is disabled by pause, visibility and reduced-motion policies. Verification compares decoded video pixels after the entrance, not only a running playback clock. The standalone version needs no extra compositor timeline.
