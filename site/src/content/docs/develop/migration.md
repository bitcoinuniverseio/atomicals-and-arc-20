---
title: Migration
description: Moving an integration between versions without discovering the differences in production.
sidebar:
  order: 13
provenance:
  pageId: develop/migration
  area: develop
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
    - id: universe-ordex
      path: openapi
  verified: '2026-08-31'
  tags: [migration, versioning]
---

## The general procedure

1. Record your current pins: validator revision, network, service revisions, schema versions, and
   documentation version.
2. Read the [changelog](/releases/) between your pins and the target.
3. Read the [migration guides](/releases/migrations/) for every breaking change in that range.
4. Re-run the [conformance vectors](/reference/conformance/) against the target combination.
5. Regenerate your client from the target OpenAPI document.
6. Diff the generated types. Anything that changed shape is work.
7. Test against the target in a non-production environment.
8. Move, then verify with real reads before switching traffic.

Step four is the one that catches interpretation changes a type diff cannot show.

## Marketplace route migration

| Old | New |
| --- | --- |
| `POST /buys` | `POST /reservations` and `POST /purchases/prepare` |
| `POST /orders/{orderId}/reconcile` | `POST /settlements/{orderId}/reconcile` |

The legacy aliases remain available. New integrations use the reservation, purchase, and
settlement routes, which separate the steps that were previously merged.

## Client regeneration

The [TypeScript client](/reference/client-sdk/) is generated from the OpenAPI documents. Regenerate
rather than hand-editing, and let the type checker find the call sites that changed.

## Schema migration

JSON Schemas carry a version. When a schema version changes:

1. Validate your stored records against the new schema.
2. Fix what fails before switching.
3. Keep the old schema available until nothing reads the old records.

## What not to do

- Do not migrate by catching the errors that appear in production.
- Do not skip the conformance run because the types compiled.
- Do not assume a route rename preserves behavior.
- Do not migrate the validator revision and the API revision in one step. Move one, verify, move
  the other.

## Source

[Versioning and deprecation](/develop/versioning-and-deprecation/) and
[migrations](/releases/migrations/).
