---
title: Update or remove a listing
description: Change a price or delist, with the same ownership proof and the same failure-closed checks.
sidebar:
  order: 27
provenance:
  pageId: guides/update-or-remove-a-listing
  area: guides
  audience: [holder, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
  verified: '2026-08-31'
  tags: [marketplace, listing]
---

## Before you start

- Supported networks: mainnet.
- Status: Universe implementation. Action gates default to off.
- You need a current owner session. Sessions are short lived.

## Update a price

1. Obtain an owner session through the challenge and verify steps.
2. Call the update prepare step for the listing.
3. Sign what it returns, with the exact scope it specifies.
4. Call the update finalise step.

The authority re-verifies collateral at a fresh checkpoint. A price change is not a metadata edit:
the asset is checked again.

## Delist

1. Obtain an owner session.
2. Call the delist step for the listing.

Delisting removes the offer to sell. It does not move anything on chain, because a listing never
moved anything in the first place.

## Idempotency

Mutations require an idempotency key. Reusing the same key for the same request is safe and
returns the same result rather than performing the action twice. Use a fresh key for a genuinely
new request.
See [idempotency and request IDs](/develop/idempotency-and-request-ids/).

## If it fails

| Failure | Meaning |
| --- | --- |
| Session expired | Redo the challenge and verify steps |
| Asset moved | The collateral is no longer where the listing said. Relist |
| Checkpoint drift | The chain moved mid-check. Retry |
| Reservation active | A buyer holds a reservation. Wait for it to expire or settle |
| Gate disabled | The action is not enabled on this deployment |

## Check before signing

- The listing identifier is the one you intend.
- The new price and payment script are correct.
- The signature scope is what the prepare step specified.

## After

Read the listing back and confirm the new state. If you delisted, confirm it no longer appears in
the listing view.

## Source

[Marketplace v1](/reference/api/marketplace-v1/).

