# Architecture and product decisions

## ADR-001: Retain Next.js during the first local slice

The repository already runs Next.js 16.4.2 and React 19.3.0. Keep it while separating reusable resources and catalog logic from website routing. The report explicitly allows this alternative. A Cloudflare runtime prototype must establish adapter/package compatibility before deployment architecture is finalized. Existing Vercel CD remains disabled and is not evidence of Cloudflare readiness. No provider migration, account provisioning or domain changes were performed.

## ADR-002: One typed resource definition

Catalog identity, taxonomy, states, dependencies, rights, compatibility and evidence live together. Search derives from approved metadata. Registry/export/MCP will use the same records. Never store orders or customer secrets in this public catalog.

## ADR-003: Shared versioned preset

Only declared colors, radius, density and theme are accepted. Validate imported values; never interpret code or inject arbitrary CSS. Invalid settings preserve the last valid state. Use the preset for resource previews and future generated output.

## ADR-004: Honest development release

The profile-settings release is a local preview, with simulated persistence explicitly identified. No account backend, authentication, email or payment behavior is claimed. Existing landing-page motion demos remain experiments, not production-ready catalog releases. Catalog publication and beta readiness require separate evidence.

## ADR-005: Rights policy

Use original authored source/artwork or assets with documented library-redistribution permission. Every resource records author, provenance, license status, modifications and notices. A final redistribution license needs an explicit owner decision; no license is invented on the owner's behalf. Draft resources cannot be advertised as free-to-redistribute until that decision is recorded.

## Deferred

Commerce, premium archives, private presets, custom MCP, Figma parity, arbitrary code execution, marketplace moderation, desktop tooling and automatic repository rewriting. These are not dependencies of the first useful website workflow.
