# Profile settings 0.1.0-preview.1

Original Migbits development resource. Redistribution license: pending owner decision. Local source delivery is enabled for evaluation; production delivery is disabled while this resource is a draft.

## Component contract

ProfileSettings accepts a validated BrandPreset, optional initialProfile, an optional visual state, and an onSave(profile): Promise<void> callback. It owns unsaved local form edits. The host owns persistence, authentication and authorization. There are no router, database, billing, or hosting dependencies.

The component imports its stylesheet. Keep profile-settings.tsx, model.ts, profile-settings.css and ../../tokens/preset.ts in their relative folders. Complete downloads include these files, an example with your selected preset, preset.json, INSTALL.md, NOTICE.txt and a manifest.

The generated example's onSave callback is a demonstration. Replace it with a real authenticated backend request before production. A no-op callback resolving successfully does not save account data.

## Behavior

Default, empty, loading, error and success previews are supported. Loading disables editing and duplicate submission. Validation identifies invalid fields and focuses the first failing input. Rejected saves retain edits. Product updates uses a native checkbox. Container-aware layout supports narrow preview widths. No motion is required. The website's form preview sends no entered data to a server.

## Installation evidence

Fresh locked consumer install: React/React DOM 19.3.0; TypeScript 5.9.3; esbuild 0.28.2. Strict typecheck and standalone browser JS/CSS bundling pass outside Next.js. Forty-eight brand combinations are checked for matching token values in rendered markup. These are build/markup checks, not browser visual parity or a complete accessibility review.

ZIP and registry output come from the same generator. Source digests identify the development snapshot; preset and file checksums identify the configured export. A draft version is not an immutable public release.

## Open release gates

Manual browser/layout/keyboard/screen-reader review; customized contrast audit; owner-approved distribution license; Cloudflare runtime proof. Supported clean consumer builds do not establish compatibility with every existing application or global stylesheet.
