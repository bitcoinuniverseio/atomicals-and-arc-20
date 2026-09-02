---
title: Identifiers and networks
description: Protocol identifiers, network identifiers, asset identifiers, and the route prefix contract.
sidebar:
  order: 5
provenance:
  pageId: develop/identifiers-and-networks
  area: develop
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
    - id: universe-index-atomicals-nfts-and-realms
      path: server
  verified: '2026-08-31'
  tags: [identifiers, networks, routing]
---

## Protocol identifiers

The Marketplace router exposes four isolated protocol authorities. These exact strings are the
identifiers:

| Identifier | Asset kind |
| --- | --- |
| `arc20` | Fungible ARC-20 tokens |
| `atomicals_nft` | Plain non-fungible Atomicals |
| `realms` | Top-level Realms |
| `subrealms` | Subrealms |

Every route, cursor, idempotency scope, listing, offer, order, reservation, browse query, and
status count is scoped to one of these. Non-ARC-20 storage keys are prefixed internally, and the
prefix is never returned as a public asset ID.

## Asset identifiers

| Identifier | Shape | Use |
| --- | --- | --- |
| Atomical ID | `<txid>i<index>` | The primary key |
| Compact Atomical ID | The compact wire form | Payloads and marketplace collateral |
| Location | `<txid>:<vout>` | Current custody, never a key |
| Ticker | A lowercase name | Display, always alongside the resolved ID |

See [identifiers and numbers](/protocol/core/identifiers/).

## Network identifiers

Responses carry the network they apply to. A result for one network says nothing about another,
because activation conditions differ.
See [activation boundaries](/protocol/core/activation-boundaries/).

## Route prefixes

Universe indexer routes follow the pattern `/<indexer-name>/<endpoint-name>`, where the prefix is
the indexer repository name with the `index-` prefix removed.

Versioned API surfaces additionally use a `/v1/` segment. The exact inventory for each service is
in its reference page:

- [ARC-20 API](/reference/api/arc20/)
- [NFT and Realm API](/reference/api/atomicals-nfts-realms/)
- [Marketplace v1](/reference/api/marketplace-v1/)

## What never to derive

- Never derive identity from a ticker, realm name, or container name.
- Never derive a route from a display name.
- Never assume a protocol identifier is interchangeable with another lane.
- Never treat a location as stable.
