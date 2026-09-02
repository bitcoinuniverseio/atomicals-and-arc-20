---
title: Pagination and cursors
description: Signed cursors, what they bind to, and why a cursor stops working after a generation change.
sidebar:
  order: 8
provenance:
  pageId: develop/pagination-and-cursors
  area: develop
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: tokenExplorerDocs
    - id: universe-index-atomicals-nfts-and-realms
      path: server
  verified: '2026-08-31'
  tags: [pagination, cursors]
---

## Cursors are opaque and signed

A cursor is an opaque token. Do not parse it, construct one, or modify one. The ARC-20 feed signs
cursors with a dedicated secret, separate from the bearer token, so a tampered cursor is rejected
rather than silently misinterpreted.

## What a cursor binds to

A cursor refers to a position inside an immutable generation. It also preserves the page and
holder chunk sizes it was created with.

Two consequences:

1. **A cursor is only valid for its generation.** When the generation changes, restart the
   listing.
2. **Changing the page size mid-listing does not work.** The cursor already carries the sizes.

## Bootstrap cursors

A cursor-free request against the ARC-20 feed may need to build an immutable generation first. In
that case the service copies a bounded number of rows and returns a retryable unavailable
response until the generation is ready.

Retries resume and reuse the same source fingerprint. Source movement abandons an unfinished
generation. That bounds writer time and stops repeated requests from duplicating complete
histories.

A client must therefore treat a retryable unavailable response as normal during bootstrap, not as
a failure.

## Paging patterns

| Surface | Pattern |
| --- | --- |
| Asset listings | Cursor plus limit |
| Holder listings | Page number plus limit |
| History | Limit, bounded |
| Feed pages | Signed cursor plus limit |

Where a `truncated` flag is returned, honour it. It means there was more and the response stopped,
not that there was nothing more.

## Rules for a client

1. Treat the cursor as opaque.
2. Restart the listing when the generation identifier changes.
3. Never merge pages from two generations into one result set.
4. Handle a retryable unavailable response during bootstrap with backoff.
5. Respect `truncated` rather than assuming the list ended.
6. Bound your own total page count so a loop cannot run forever.

## Source

[Consistency and reorgs](/develop/consistency-and-reorgs/) and
[ARC-20 API](/reference/api/arc20/).

