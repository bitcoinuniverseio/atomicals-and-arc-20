# Contribute

Where content belongs, how to update a source-dependent claim, and what CI will check.

Page ID: contribute/index
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/

---
## Where content belongs

| Content | Repository |
| --- | --- |
| Atomicals protocol, ARC-20, NFTs, Containers, Realms, AVM, AIPs | This repository |
| Public developer and API documentation for Universe Atomicals services | This repository |
| Public schemas, OpenAPI, examples, source ledger, conformance, LLM files, MCP package | This repository |
| Private architecture, deployment, credentials handling, capacity, monitoring, recovery | `docs-dev-atomicals` and `docs-dev-atomicals-nfts-and-realms` |
| Core-specific user workflows | `docs-core` |
| Inscribe-specific product workflows | `docs-inscribe` |

Passwords, tokens, private keys, seed phrases, bearer credentials, HMAC secrets, private RPC URLs,
private indexer origins, SSH endpoints, private hostnames, database credentials, internal network
topology, recovery secrets, operator-only command history, or customer data. Secret scanning runs
in CI, and it is the last line, not the first.

## The one rule that matters most

**Never present protocol behavior and Universe behavior as the same thing.** Every page declares
its applicability in frontmatter, and that declaration drives the panel readers see.

## Quick start

```bash
npm install
npm run generate
npm run check
npm test
npm run build
```

`npm run generate` regenerates every derived artefact. If it changes a committed file, commit that
change: CI fails when generation leaves the repository dirty.

## Reporting a problem

| Template | Use it for |
| --- | --- |
| Documentation defect | A typo, a broken link, an unclear passage |
| Incorrect protocol claim | A statement that does not match the source |
| API mismatch | A documented route that does not match the runtime |
| Translation defect | A wrong or stale translation |
| Accessibility defect | Anything that fails WCAG 2.2 AA |
| Broken external integration | A link or an ecosystem record that is wrong |
| New AIP | A proposal to add to the register |
| Source version update | A pinned revision that should move |

Include the page ID from the source panel. It is stable across locales and versions.
