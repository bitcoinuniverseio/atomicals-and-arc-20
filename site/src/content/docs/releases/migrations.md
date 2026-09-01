---
title: Migrations
description: Step by step moves between versions, and the general procedure for any upgrade.
sidebar:
  order: 4
provenance:
  pageId: releases/migrations
  area: releases
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
  verified: '2026-08-31'
  tags: [migration, versioning]
---

## The general procedure

1. Record your current pins: validator revision, network, service revisions, schema versions, and
   documentation version.
2. Read the [changelog](/releases/) between your pins and the target.
3. Read every applicable migration below.
4. Re-run the [conformance vectors](/reference/conformance/) against the target combination.
5. Regenerate your client from the target OpenAPI document.
6. Diff the generated types. Anything that changed shape is work.
7. Test against the target outside production.
8. Move, then verify with real reads before switching traffic.

Step four catches interpretation changes that a type diff cannot show.

## Migration: legacy buy to reservation and purchase

**Old behavior.** One call created a purchase intent and prepared the transaction together.

**New behavior.** Two calls. `POST /reservations` holds the listing and returns the complete
reservation projection. `POST /purchases/prepare` builds the settlement transaction from that
reservation.

**Why.** Separating them makes the reservation projection inspectable before anything is prepared,
and lets a client reload it without mutation.

**Steps.**

1. Replace the single call with `POST /reservations`.
2. Store the returned `reservationId` and the complete projection.
3. Call `POST /purchases/prepare` with that `reservationId`.
4. Continue with validate-signed and broadcast as before.
5. Use one idempotency key per logical action, reused across retries of that action.

**Compatibility impact.** The legacy alias remains available. Reservation expiry is now visible,
so handle an expired reservation by reserving again.

## Migration: legacy reconcile to settlement reconcile

**Old behavior.** `POST /orders/{orderId}/reconcile`.

**New behavior.** `POST /settlements/{orderId}/reconcile`.

**Steps.** Change the path. The request and response shapes are unchanged.

**Compatibility impact.** None beyond the path. Both remain available.

## Migration: to the documentation platform

Anything linking to the earlier standalone files keeps working. Those routes are generated from the
current content on every build.

| If you linked to | It still resolves | The current page is |
| --- | --- | --- |
| `/specification.html` | Yes | [ARC-20](/protocol/arc20/overview/) |
| `/sources.html` | Yes | [Versions and compatibility](/releases/versions/) |
| `/reference.html` | Yes | [Reference](/reference/cli/) |
| `/guide.html` | Yes | [Guides](/guides/) |
| `/llms.txt` | Yes | Unchanged in purpose, expanded in content |

New links should use the page routes. Agents should key on page IDs from
[the manifest](/reference/ai-access/).

## Migrating a validator revision

Move one thing at a time.

1. Move the validator revision. Re-run the vectors. Verify with real reads.
2. Only then move the API revision. Re-run the vectors again.

Moving both at once makes an unexpected difference impossible to attribute.

