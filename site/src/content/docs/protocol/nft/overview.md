---
title: Atomicals NFTs
description: Non-fungible Atomicals, what they carry, how they move, and the hazards that come from sharing an output.
sidebar:
  order: 1
provenance:
  pageId: protocol/nft/overview
  area: protocol
  audience: [everyone, creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: nftAllocation
    - id: universe-index-atomicals-nfts-and-realms
      path: provenance
  verified: '2026-08-31'
  tags: [nft]
  limitations:
    - The Universe read model projects plain NFTs, Realms, and Subrealms. Containers and DMINT items are excluded from that projection by declaration.
---

An Atomicals NFT is a single non-fungible object created with the `nft` operation. It carries
metadata and optionally embedded files, it lives in a Bitcoin output, and it has an ordered
history.

## Subtypes matter

The same `nft` operation produces several different things depending on the request in the
payload:

| Request | Result |
| --- | --- |
| none | A plain NFT |
| `request_realm` | A top-level Realm |
| `request_subrealm` | A Subrealm under a parent |
| `request_container` | A Container collection identity |
| item claim against a sealed manifest | A DMINT item |

An integration that expects a plain NFT must reject the subtypes it does not handle rather than
treating them as generic. The Universe Marketplace generic NFT lane does exactly that: it rejects
realm, subrealm, FT, container, and item subtypes.

## What an NFT carries

- Metadata, arbitrary and unverified.
- Zero or more named files with declared content types and recorded digests.
- Mutable state, until sealed.
- A complete operation history.

See [metadata and media](/protocol/nft/metadata-and-media/) and
[permanent storage](/protocol/core/permanent-storage/).

## How an NFT moves

Spending the output that carries it moves it, subject to the non-fungible allocation branch.
Unlike the fungible branch, an NFT is a whole object: it lands somewhere or it does not.

The hazards are different too. An output can carry several Atomicals at once, and separating them
requires a deliberate operation. See
[splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).

## Reading pages

| Topic | Page |
| --- | --- |
| Minting an NFT and what the payload contains | [Minting](/protocol/nft/minting/) |
| Files, content types, digests, and safe rendering | [Metadata and media](/protocol/nft/metadata-and-media/) |
| Normal transfers and swap transfers | [Transfers](/protocol/nft/transfers/) |
| Splat and shared outputs | [Splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/) |
| Collections and Container membership | [Collections and Containers](/protocol/nft/collections-and-containers/) |
| Listing, buying, and settling | [Marketplace](/protocol/nft/marketplace/) |

