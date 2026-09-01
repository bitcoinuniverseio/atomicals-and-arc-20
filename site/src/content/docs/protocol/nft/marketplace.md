---
title: NFT marketplace behavior
description: What the Marketplace authority checks before an NFT listing, purchase, or settlement is allowed to proceed.
sidebar:
  order: 7
provenance:
  pageId: protocol/nft/marketplace
  area: protocol
  audience: [holder, developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
    - id: universe-index-atomicals
      path: marketplaceAuthority
  verified: '2026-08-31'
  tags: [marketplace, nft]
  limitations:
    - Every marketplace action gate defaults to off. A capability being documented does not mean it is enabled on any deployment.
---

The Universe Marketplace v1 exposes four isolated protocol authorities: `arc20`, `atomicals_nft`,
`realms`, and `subrealms`. They share one durable transaction engine, and every route, cursor,
idempotency scope, listing, offer, order, reservation, browse query, and status count is scoped to
one protocol.

## What the generic NFT lane accepts

An authoritative compact Atomical ID, with `quantityAtomic` always exposed as `1`.

It **rejects** realm, subrealm, FT, container, and item subtypes. Those either belong to another
lane or are not supported.

## What must agree before collateral is accepted

For a non-fungible asset the authority requires independent views to agree:

- Bitcoin Core reports a confirmed, live output with the exact value and owner script, and a
  mature coinbase where applicable.
- The Atomicals provider reports exactly that location, script, and value.
- The height and hash on both the Bitcoin side and the Atomicals side stay unchanged across the
  verification bracket.

If any view disagrees, or the chain position moves mid-check, the request fails closed.

## What is always rejected

- Mixed collateral, meaning an output carrying more than the selected asset.
- Spent outputs.
- Checkpoint drift between verification and execution.
- Ambiguous balances.
- Atomicals operations inside the settlement transaction.
- Burns.
- Output assignments that do not move the exact selected Atomical.

## Ownership proof

Owner actions require a short lived owner session, issued only after a BIP-322 simple proof for
P2WPKH or key-path P2TR. Proof is separate from signing the settlement transaction.

## Lifecycle

Listing, reservation, purchase preparation, signed validation, broadcast, and settlement are
distinct steps with their own routes and idempotency scope. See
[Marketplace v1](/reference/api/marketplace-v1/) for the complete contract.
