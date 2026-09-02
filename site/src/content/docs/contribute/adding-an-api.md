---
title: Adding an API
description: The five artefacts a documented API needs, and the checks that bind them together.
sidebar:
  order: 3
provenance:
  pageId: contribute/adding-an-api
  area: contribute
  audience: [developer]
  applicability: editorial
  authority: none
  networks: [none]
  verified: '2026-08-31'
  tags: [contributing, contracts]
---

## The five artefacts

1. **A sanitized route inventory** in `contracts/routes/`, exported by the runtime repository.
2. **An OpenAPI 3.1 document** in `contracts/openapi/`.
3. **Schema definitions** in `contracts/schemas/common.schema.json`, reused rather than duplicated.
4. **A reference page** under `reference/api/` that renders the inventory and explains the
   guarantees.
5. **A source manifest entry** so the revision is recorded.

## The checks that bind them

| Check | What it prevents |
| --- | --- |
| Inventory equals documented paths, in both directions | A documented route that does not exist, and a runtime route that is undocumented |
| Inventory revision equals the manifest revision | An inventory drifting from its recorded source |
| Operation identifiers unique across all documents | Collisions in a generated client |
| Every operation has a summary, a declared tag, and responses | A stub masquerading as documentation |
| Every response example validates against its schema | An example that would never be returned |
| Deprecated routes name a replacement | A dead end |
| No production host or routable address | A credential pointed at production from a browser |

## Order of work

1. Export the sanitized inventory from the runtime repository. It must contain no hostname,
   credential, or internal topology.
2. Add the source manifest entry with the exact revision.
3. Commit the inventory here.
4. Write the OpenAPI document, reusing schema definitions.
5. Run `npm test`. The inventory check will tell you exactly what is missing on either side.
6. Write the reference page.
7. Regenerate the client with `npm run generate`.

## Schema rules

- Satoshi and protocol quantities are decimal strings with a pattern. Never numbers.
- Identifiers carry their pattern. An Atomical ID and a location are different types.
- Every definition carries a description, and at least one example where a value is representable.
- Reuse before adding. A near-duplicate definition is a future inconsistency.

## Internal routes

Document them, marked as internal and not publicly reachable, so integrators understand the
boundary. Never include a credential value, a hostname, or anything that would let someone reach
them.

## Examples

Every example must validate against its own schema, and CI enforces it. An example is
documentation people copy, so a wrong one is worse than none.

