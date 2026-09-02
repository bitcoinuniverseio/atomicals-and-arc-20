---
title: Rate limits
description: Where a limit is actually implemented, where none exists, and how to behave well regardless.
sidebar:
  order: 11
provenance:
  pageId: develop/rate-limits
  area: develop
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals-nfts-and-realms
      path: server
    - id: universe-index-atomicals
      path: tokenExplorerDocs
  verified: '2026-08-31'
  tags: [rate-limits, integration]
  limitations:
    - This page documents limits only where they are implemented. Where a service has no limit, it says so rather than inventing a policy.
---

## What exists today

| Surface | Rate limit |
| --- | --- |
| NFT and Realm read routes | No request rate limit is implemented on the service itself |
| ARC-20 feed | Bounded generation build work per request, which paces cold bootstrap |
| Marketplace routes | Replay protection and idempotency, which are not rate limits |

Where no limit is implemented, the constraint is the deployment in front of the service, not the
service. Do not read the absence of a limit as permission to hammer it.

## The bounded work that does exist

The ARC-20 feed copies at most a configured number of rows per cursor-free request while building
an immutable generation, and returns a retryable unavailable response until the generation is
ready. That bounds writer time and prevents repeated requests from duplicating complete histories.

A client must handle that retryable response as normal, with backoff.

## Behave well anyway

1. Cache read results together with their generation identifier.
2. Re-read on a generation change, not on a timer.
3. Use cursors and honour the page sizes the cursor carries.
4. Back off exponentially with jitter on 429, 500, and 503.
5. Bound concurrency per host rather than fanning out without limit.
6. Never poll a readiness endpoint faster than you would act on a change.
7. Prefer one request that returns what you need over many that each return part of it.

## If a 429 appears

A limit exists in front of the service. Back off, honour any retry hint, and reduce concurrency.
Do not retry immediately with the same rate.

## Source

[Pagination and cursors](/develop/pagination-and-cursors/) and
[readiness and freshness](/develop/readiness-and-freshness/).

