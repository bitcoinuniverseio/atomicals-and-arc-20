# Releasing

Every gate in order, what each one proves, and why none of them can be skipped.

Page ID: contribute/releasing
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/releasing/

---
## The gates, in order

| Gate | Proves |
| --- | --- |
| Clean install from the lockfile | The dependency set is reproducible |
| Type check | The site and packages type check strictly |
| Generation is clean | Every derived artefact matches its source. A dirty tree fails |
| Contract checks | OpenAPI, schemas, inventories, and examples all agree |
| Conformance vectors | The documented protocol behavior is executed, not asserted |
| Unit tests | Loaders, manifests, translations, and generated artefacts behave |
| Production build | The site builds statically, with search |
| Link and anchor checks | No broken internal link, anchor, image, or duplicate page ID |
| Compatibility route checks | Every preserved legacy route exists and is generated |
| Accessibility checks | No axe violation across the required matrix |
| Performance budgets | The budgets fail the build, they do not merely report |
| Secret scanning and dependency audit | No secret, no high or critical vulnerability |
| Browser tests | Navigation, search, tools, deep links, and locales work |
| Visual review | Changed baselines are reviewed, never auto-accepted |

Each is a separate job, so a failure names the thing that failed rather than the last command in a
chain.

## Generation is a gate, not a step

`npm run generate` regenerates the CLI inventory, the AIP registry, the AVM opcodes, the legacy
compatibility artefacts, the LLM files, the page manifest, the sitemap, and the changelog feed.

CI runs it and fails if the working tree is dirty afterwards. That is what makes "generated
artefacts are reproducible" a fact rather than a hope.

## Runners

CI runs only on approved self-hosted runners or the approved cloud configuration. GitHub-hosted
runner labels are never used, and a workflow that introduces one fails review.

## Private source checks

Public pull request validation never depends on a private repository credential. Committed
sanitized manifests and public contracts are enough to validate an untrusted pull request.

A separate trusted, scheduled workflow compares against private sources with a least-privilege
read-only credential, and never runs with secrets on untrusted fork code. Detected drift opens or
updates a concrete issue or pull request with the changed contract, the affected pages, and the
source revision. No automated job rewrites normative prose and merges it without review.

## Deployment

The built site is committed at the repository root and served from the default branch. That gives
three properties:

1. The deployed bytes are in version control.
2. The Inscribe submodule receives the same artefacts the site serves.
3. Deployment does not depend on a build running at publish time.

## After deployment

Verify the real origin, not a local build: status codes, canonical links, navigation, search, raw
Markdown, LLM files, compatibility routes, contract downloads, locale routes, mobile behavior,
accessibility, and performance.

A local build passing is not a release.
