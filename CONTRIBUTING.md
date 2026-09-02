# Contributing

The full contributor guide lives in the documentation:
[Contribute](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/).

This file is the short version.

## The one rule that matters most

**Never present protocol behavior and Universe behavior as the same thing.**

Every page declares its applicability in frontmatter, and that declaration drives what readers see.
Choosing `protocol-behavior` for something a Universe service does, or the reverse, is the most
serious content error possible here. It is the failure this whole system exists to prevent.

## Where content belongs

| Content | Repository |
| --- | --- |
| Atomicals protocol, ARC-20, NFTs, Containers, Realms, AVM, AIPs | This repository |
| Public developer and API documentation for Universe Atomicals services | This repository |
| Public schemas, OpenAPI, examples, source ledger, conformance, LLM files, MCP package | This repository |
| Private architecture, deployment, credentials handling, capacity, monitoring, recovery | `docs-dev-atomicals` and `docs-dev-atomicals-nfts-and-realms` |
| Core-specific user workflows | `docs-core` |
| Inscribe-specific product workflows | `docs-inscribe` |

## Never commit

Passwords, tokens, private keys, seed phrases, bearer credentials, HMAC secrets, private RPC URLs,
private indexer origins, SSH endpoints, private hostnames, database credentials, internal network
topology, recovery secrets, operator-only command history, or customer data.

Secret scanning runs in CI. It is the last line, not the first.

## Quick start

```bash
npm install
npm run generate
npm run check
npm test
npm run build
```

`npm run generate` and `npm run build` must both leave the working tree clean. CI fails when they
do not, which is what stops a generated file from drifting from its source.

## Adding a source-sensitive claim

1. Read the source. Not a summary of it, the source.
2. Add the source to `contracts/source-manifest.json` with an exact revision if it is new.
3. Reference it from the page frontmatter under `provenance.sources`.
4. Set `applicability` to the layer the claim describes.
5. Set `authority` to what kind of source establishes it.
6. Set `verified` to today.
7. Record anything the claim does not cover under `limitations`.

If the behavior is version sensitive, add a conformance vector rather than only prose. See
[conformance vectors](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/conformance-vectors/).

## Writing

- Say which layer a statement describes, always.
- State a limitation rather than omitting it.
- Never call a proposal implemented.
- Never present metadata as authenticity, a ticker as identity, or a listing as ownership.
- No price talk, rankings, investment, legal, or tax advice.
- Never use guaranteed, risk-free, backed, collateralised, price floor, or redemption as claims.
- Never use an em dash.

## Reporting a problem

Use an [issue template](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/issues/new/choose)
and include the page ID from the source panel. It is stable across locales and versions.

For a security problem, use a
[private advisory](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/security/advisories/new)
rather than a public issue.

