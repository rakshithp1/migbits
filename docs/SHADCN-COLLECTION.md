# Complete shadcn collection

Migbits integrates 65 shadcn/ui component modules, 65 runnable preview examples, and three composition recipes: date picker, data table, and typography. The collection is at `/open-source/components`; each item has a shareable URL fragment, such as `/open-source/components#calendar`.

The browser organizes the collection into Foundations, Forms & inputs, Overlays, Navigation, Data & layout, and Communication. It includes keyword search, a mobile component picker, light/dark previews, reset controls, keyboard-operable preview/source tabs, component and example source views, copy actions, original documentation links, and complete ZIP delivery. Preview modules load on demand rather than rendering all widgets at once.

## Source and delivery

Upstream source is pinned to `shadcn-ui/ui@3d98900e9b73c45f035f8109e9d41ba6a51685e7`. The collection combines the 61 new-york-v4 modules with the four current base components Code Block, Questionnaire, Toast, and Trace. The MIT notice, original source hashes, adapted file hashes, and modifications are retained in `components/ui/LICENSE` and `components/ui/ORIGIN.json`.

`npm run build:catalog` generates source pack version 2.0.0 with 164 payload files plus the archive manifest. It includes all modules, examples, recipes, the mobile hook, portable class/icon/link helpers, theme CSS, exact dependency versions, direct dependency license notices, and checksums. The ZIP is compressed during the build to avoid expensive per-request compression on Workers. `/api/open-source/components?format=json` exposes the same source snapshot; `/api/open-source/components` downloads its prebuilt archive.

The download preserves relative imports and works in a React + TypeScript application configured for Tailwind v4. It includes a theme recipe for portalled surfaces. Original application profile-settings licensing and draft restrictions remain independent. Forms, messages, notifications, and questionnaire examples are browser-local demonstrations.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:community`, and `npm run build:cloudflare`. The community verification extracts the actual exported source pack and bundles all 133 component/example/recipe modules outside Next.js using workspace dependencies. The original profile-settings clean consumer has its own independent installation and 48-brand markup checks.

`npm run test:browser` uses a production server and Chrome on Windows and in CI. GitHub's Ubuntu 24.04 runner already includes Chrome, so the workflow verifies it directly. It sweeps all 68 catalog entries for real preview rendering and runtime errors, checks dialog focus/Escape, validates form error/success states, searches the library, switches source files, filters/paginates data, checks theme controls, and measures responsive overflow. Screenshots are generated under ignored `tmp/browser/`. Set `E2E_BASE_URL` to test an already running Workers preview or live deployment.

GitHub Actions performs these browser checks against the local Workers runtime before deployment. Desktop/mobile screenshots are uploaded as the `component-layout-previews` artifact. The remaining 37-project open-source directory continues to identify upstream projects and their own license records.

Official source: [shadcn/ui](https://github.com/shadcn-ui/ui), [component documentation](https://ui.shadcn.com/docs/components).

Verified locally on 2026-10-23: all 28 unit tests, lint, TypeScript, the independent original-resource consumer, all 133 extracted UI/example/recipe module bundles, the Workers build/dry-run, hosting smoke checks, and all three browser tests against the Workers preview passed. The browser sweep loaded all 68 entries; interaction and overflow checks also passed. Representative desktop, mobile, calendar, chart, questionnaire, code, and other preview screenshots were visually inspected. This does not establish exhaustive assistive-technology or arbitrary consumer-stack compatibility.
