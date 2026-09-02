# API Conformance Workbench

Validate a live read-only endpoint against the published contracts, with a scrubbed report and no stored credentials.

Page ID: tools/api-conformance
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet, regtest
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/api-conformance/

---
The workbench refuses every method except GET and HEAD, and only operations the contract marks
read-only. Endpoint URLs and headers live in memory: never in a URL, never in local storage,
never in a service-worker cache, and redacted from every exported report.

## What is checked

Status against the contract, media type, JSON parsing, schema validation through build-time
standalone validators, error shape, pagination behaviour, and contract-required headers. Each
check reports individually. The verdict distinguishes compatible, compatible-with-warnings,
schema divergence, wrong network, stale, unreachable, and unknown, and never infers identity
fields from unrelated responses.

## Local proxy for CORS-blocked endpoints

Run `npm run lab:proxy`. The proxy binds `127.0.0.1`, requires an explicit target allowlist,
refuses wildcards, blocks private, loopback, link-local, and metadata destinations (except the
local Regtest Lab), re-resolves destinations per request against DNS rebinding, enforces method,
timeout, rate, and size limits, strips hop-by-hop headers, persists nothing, and redacts its
logs. The hosted documentation site never operates as a proxy.

## Relation to the offline explorer

The [offline API explorer](/tools/api-explorer/) remains the default reading surface. The live
bench is an addition for validating an implementation, not a replacement.
