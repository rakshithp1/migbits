# Free references and original MigBits additions

Reviewed 2026-10-27. The bare getlayers.ai host failed in the research browser; the official www.getlayers.ai pages were accessible.

## Primary-source research

| Reference | Verified public offering | Design category examined | Evidence |
|---|---|---|---|
| Soda | Listed Free | Immersive product presentation and selectable product styling | https://www.getlayers.ai/layer/soda |
| Lumora | Listed Free | Editorial studio presentation and controlled motion | https://www.getlayers.ai/layer/lumora |
| Baseline | Listed Free | Sports/coaching content and paced presentation | https://www.getlayers.ai/layer/baseline |

These are three selected references, not a complete inventory of the free catalog. The research used public previews, descriptions and terms. No protected prompt text, downloaded source, branding or imagery was copied into MigBits. Full prompt text was not collected or redistributed.

The official terms, last updated September 30, 2026, permit personal/commercial generated output and inspiration in section 8. Sections 9–11 prohibit copying or redistributing the prompt library and selling the prompts themselves. A Free label does not supersede those restrictions. Source: https://www.getlayers.ai/terms-of-use .

## Original work added

| MigBits template | Original composition | Working frontend behaviour |
|---|---|---|
| Sonic Atelier | Ivory audio editorial, cobalt stage, original detailed metallic headphone SVG, acoustic rings and listening-mode waveform cards | Finish selection, local demo cart, details, enquiries, mobile navigation |
| Margin Works | Light architectural editorial, outlined typography, original folded-ribbon SVG, asymmetric project index and original graphic studies | Category filtering, service disclosures, enquiries, mobile navigation |
| Stride Method | Athletic off-white/navy editorial, original running-track SVG with animated route, modular training plan and schedule | Plan selection updates session count and example price; session selection; enquiries; mobile navigation |

All source, vector artwork and build briefs were written independently for MigBits. They are not conversions or renamed copies of the GetLayers templates. The result is differentiated work; no objective superiority or production-readiness benchmark against GetLayers is claimed.

Each template is a complete single-page HTML/CSS/JavaScript frontend with no additional package installation, external fonts, remote images, WebGL or network services. Native motion starts automatically, pauses when hidden or requested, and respects reduced motion. Fictional business names, product specifications, prices, schedules and form states are labelled as demonstrations. No payment, booking or email backend is claimed.

Each entry includes an original **Copy build prompt** action, PROMPT.md in the source viewer, editable HTML/CSS/JS, colour controls, a screenshot thumbnail, deterministic ZIP and complete MigBits MIT notice. The six colour options live inside each template; they are not counted as additional resources.

## Continuing cleanup

The first remote regression run found an obsolete test expecting the now-removed Play button. The mobile-menu test was also clicking before the template's initialization marker; the live handler was verified to work, and the test now waits for actual readiness. Both checks are retained and rerun. These are test synchronization/expectation corrections, not a reason to suppress browser coverage.

The new colour-preview directory is excluded from crawling. Original downloads remain distinguishable from derived colour previews. The shader cleanup and 31 verified moving scenes remain in place.

New catalog totals: **342 resources**, **117 templates**, **31 shader scenes**. The long-term 500-template target is still incomplete: **383 remain**. No palette variants or hero decoration were counted as new templates.

See the release ledger for final checks, source commit and deployment version.

## Verified release

Live at https://migbits.com . Source commit `d94e4de1dc5b91c00248c81e7ca72371a66e20de`; Cloudflare version `03bfda8c-ac5f-4447-b3d5-f7b288f53bc0`. GitHub CI passed with 47 unit and 48 browser tests. All 148 isolated preview checks, 12 focused local browser checks and six live browser checks passed; all 208 checked live artifacts matched the tested files. Lint, type checks, clean-consumer/community checks and the production Worker build passed.

CI: https://github.com/rakshithp1/migbits/actions/runs/40385883876
