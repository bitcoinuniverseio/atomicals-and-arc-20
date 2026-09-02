# Deprecations

What is scheduled for removal, what replaces it, and what a deprecation does and does not promise.

Page ID: releases/deprecations
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/releases/deprecations/

---
## The policy

A deprecated capability still works. It is scheduled for removal, and every deprecation records
six things:

1. The old behavior.
2. The new behavior.
3. The effective version.
4. Migration instructions.
5. The compatibility impact.
6. The source evidence.

A deprecation does not promise the old and new behaviors are identical. Read the migration note
rather than assuming a rename.

## Current deprecations

### Marketplace legacy purchase alias

| Field | Value |
| --- | --- |
| Old | `POST /api/marketplace/v1/protocols/{protocolId}/buys` |
| New | `POST /reservations` followed by `POST /purchases/prepare` |
| Effective | Marketplace v1 |
| Impact | The merged step is separated into reservation and preparation, which is why the replacement is two calls |
| Migration | [Migration](/develop/migration/) |
| Evidence | Recorded in the Marketplace v1 contract in `index-atomicals` |

The alias remains available. New integrations use the replacement.

### Marketplace legacy reconcile alias

| Field | Value |
| --- | --- |
| Old | `POST /api/marketplace/v1/protocols/{protocolId}/orders/{orderId}/reconcile` |
| New | `POST /api/marketplace/v1/protocols/{protocolId}/settlements/{orderId}/reconcile` |
| Effective | Marketplace v1 |
| Impact | Route move only, under the settlement resource |
| Migration | [Migration](/develop/migration/) |
| Evidence | Recorded in the Marketplace v1 contract in `index-atomicals` |

## The sunset policy

1. A deprecation is announced here and in the changelog feed before removal.
2. A deprecated route is marked in its OpenAPI document, and CI requires it to name a replacement.
3. Removal happens in a version, never silently.
4. Nothing is removed without a documented replacement or an explicit statement that the capability
   is gone.

## Documentation route compatibility

The earlier standalone documentation files are not deprecated. They are preserved as compatibility
artefacts and regenerated from the current content on every build, so they cannot drift from it.

| Route | Status |
| --- | --- |
| `/index.html` | Generated, current |
| `/about.html` | Generated, current |
| `/guide.html` | Generated, current |
| `/reference.html` | Generated, current |
| `/specification.md` and `/specification.html` | Generated, current |
| `/sources.md` and `/sources.html` | Generated, current |
| `/llms.txt` and `/llms.html` | Generated, current |

## What has never been deprecated

Page IDs. A page ID is never reused and never renamed without a redirect, which is why an agent
should key on the page ID rather than the URL.
See [AI and agent access](/reference/ai-access/).
