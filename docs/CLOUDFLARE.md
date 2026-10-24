# Cloudflare hosting

Migbits uses Cloudflare Workers with OpenNext. This preserves its Next.js route handlers, including JSON and ZIP downloads. It is not a static Pages export.

## Local verification

Use Node 24. Run:

```sh
npm ci
npm run build:cloudflare
npx wrangler deploy --dry-run
npm run preview:cloudflare -- --port 8787
```

Visit http://localhost:8787. In another terminal, set `SMOKE_BASE_URL=http://localhost:8787` and run `npm run test:hosting`. In PowerShell, use `$env:SMOKE_BASE_URL='http://localhost:8787'`.

Cache Components and Partial Prefetching are disabled: the Workers runtime canceled requests with the Cache Components timer check enabled. The current catalog does not use `use cache` or on-demand revalidation. No R2, D1, KV, or paid resource is provisioned by this configuration. Revisit cache configuration before introducing ISR or cache tags.

## First deployment

1. Authenticate with `npx wrangler login` using the intended Cloudflare account.
2. Check `npx wrangler whoami`. If multiple accounts are available, select the correct account using `CLOUDFLARE_ACCOUNT_ID` in the environment.
3. Verify the account has no conflicting Worker named `migbits` before the first deployment.
4. Run `npm run deploy`. This builds and publishes to the account's `migbits.<subdomain>.workers.dev` address.
5. Set `SMOKE_BASE_URL` to that actual address and run the hosting smoke test.

## Custom domain and HTTPS

Deployment target: `migbits.com`, registered at Spaceship. Canonical origin: `https://migbits.com`; `www.migbits.com` should redirect to it after HTTPS is active on both hosts.

Pre-migration DNS inspection on 2026-10-23 found `launch1.spaceship.net` and `launch2.spaceship.net` as authoritative nameservers, two apex A records, no publicly returned apex MX/TXT records, and no `www` CNAME. A DS record exists at the parent, so DNSSEC requires explicit handling before nameserver replacement. Public lookups are not a complete zone export: inspect the registrar's full record list before migration. Cloudflare OAuth authentication is complete; the added Free zone awaits activation.

The purchased domain must be supplied before DNS changes. Add its zone to Cloudflare, review existing DNS records against the registrar/current DNS host, and preserve mail (MX, SPF, DKIM, DMARC), verification, and unrelated service records. Review DNSSEC before changing nameservers; an obsolete DS record can break resolution. Use the exact nameservers assigned to this zone at the registrar. Wait for Cloudflare to mark the zone active.

Once the zone is active, add exact custom-domain routes in `wrangler.jsonc`, replacing the examples with the actual purchased domain:

```json
"routes": [
  { "pattern": "example.com", "custom_domain": true },
  { "pattern": "www.example.com", "custom_domain": true }
]
```

Deploy again. Cloudflare provisions DNS and certificates for Worker custom domains. Inspect existing records at those two hostnames before replacing them. Choose one canonical hostname and configure the other to redirect after both hostnames have valid HTTPS. Verify apex, www, certificate issuance, all public pages, and downloads. Enable HTTPS redirects for this zone once HTTPS works. Do not add HSTS preload until the entire domain and relevant subdomains are verified.

## GitHub Actions

The workflow validates the catalog, tests exports, lints, builds the Worker, checks TypeScript, and performs a Wrangler dry run for pushes and pull requests. It uploads the built `.open-next` artifact. Production deploys that same artifact from successful `main` runs only.

Configure the private GitHub repository:

- Secret `CLOUDFLARE_API_TOKEN`: account-scoped Workers deployment token. Use the Cloudflare Edit Cloudflare Workers template, restricted to the intended account/zone. Custom domains additionally require zone read and Workers Routes edit permissions. Never commit the token or paste it in chat.
- Variable `CLOUDFLARE_ACCOUNT_ID`: intended account ID.
- Variable `PRODUCTION_URL`: verified HTTPS origin; used for the environment link and deployment smoke test.
- Variable `CLOUDFLARE_DEPLOY_ENABLED=true`: enable only once the account, token, and first deployment are verified.

Use GitHub Actions as the single deployment source; do not also enable Cloudflare's automatic Git builds for the same Worker. Pull requests never run the production deployment job. Use Cloudflare's deployment history to roll back a bad production version; correct the source and redeploy afterward.

Local evidence: the OpenNext build, Wrangler deployment dry run (about 1.28 MiB compressed), and hosting smoke tests passed on 2026-10-23. Six public pages, a CSS asset, both JSON/ZIP download APIs, and production draft restrictions were checked in the local Workers runtime. Lint, TypeScript, catalog validation, and 28 unit tests also passed. This is HTTP/runtime verification, not a new browser visual review.

Dependency audit reports nine high findings in development tooling dependency chains (five pre-existing and four from the adapter's minification toolchain). No automatic major-version audit fixes were applied. These remain dependency maintenance work; this setup does not claim a clean security audit.

First Worker deployment succeeded on 2026-10-23 at `https://migbits.migbits.workers.dev`, version `9f9b5f2e-f9c6-414b-8ef7-1ae6478e12d2`. Initial local public verification encountered a TLS handshake failure. An independent GitHub-hosted public check subsequently passed all page, asset, download, and draft-restriction tests: run `39966515704`. The GitHub account ID and target production origin variables are configured. A dedicated CI API token is still needed; the local OAuth credential is not copied to GitHub.

The Free zone is pending with assigned nameservers `elaine.ns.cloudflare.com` and `woz.ns.cloudflare.com`. Both exact apex/www custom domains are attached to the `migbits` Worker. Next.js redirects `www.migbits.com` to `https://migbits.com`, preserving paths and query parameters. The imported apex A records initially blocked attachment (Cloudflare error 100117); after the owner deleted those two Cloudflare records, deployment and both domain attachments succeeded, version `ed9cfaf7-a32c-465a-a0c9-b5c6a5df2c7d`. Cloudflare returned certificate IDs for both hostnames; this alone does not establish certificate issuance or public HTTPS readiness.

The owner disabled Spaceship DNSSEC; the DS record was absent at the .com authoritative server, Google DNS, and Cloudflare DNS on 2026-10-23 before requesting the nameserver switch. The updated adapter build and local hosting smoke tests passed. A separate Workers preview with `--local-upstream www.migbits.com` verified the 308 canonical redirect, including nested path and query preservation.

The nameserver switch is complete: the registry confirms `elaine.ns.cloudflare.com` and `woz.ns.cloudflare.com`, and Cloudflare reports the zone as active. HTTPS to the authoritative Cloudflare addresses returns 200 on the apex and a 308 www redirect preserving the path/query, with certificate verification enabled. Public hosting check `39969362772` passed against `https://migbits.com`, including pages, CSS, both JSON/ZIP APIs, and production draft restrictions.

Some recursive resolvers still cache the previous Spaceship negative DNS response; this produced the owner's browser NXDOMAIN error after activation. Google DNS already resolves the correct Cloudflare addresses. This is a remaining resolver-cache issue, not an absent deployment or missing authoritative record. The Windows DNS cache was cleared; upstream/browser caches can persist independently. Dedicated GitHub deployment credentials and automatic deployment enablement remain outstanding.

Follow-up diagnosis found stale Spaceship delegation/negative answers on 1.1.1.1 as well. Purging apex NS/A/AAAA and www A/AAAA through Cloudflare's public DNS purge tool succeeded; subsequent Cloudflare DNS-over-HTTPS queries returned the correct Cloudflare nameservers and both address families. Real HTTPS requests using DNS-over-HTTPS (without forced IP addresses or disabling TLS verification) then returned apex 200 and www 308. Windows' normal resolver path through the Wi-Fi router still returned ENOTFOUND. No adapter DNS settings were changed; that broader network change requires the owner's preference and administrator access.

Zone activation, real HTTPS smoke tests, and GitHub deployment credentials are separate completion gates. A deployment command succeeding does not establish that the custom domain is live.

Official references: [OpenNext setup](https://opennext.js.org/cloudflare/get-started), [Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
