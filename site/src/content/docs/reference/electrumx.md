---
title: ElectrumX reference
description: The Atomicals ElectrumX interface, what a Universe proxy adds, and where the boundary between them sits.
sidebar:
  order: 2
provenance:
  pageId: reference/electrumx
  area: reference
  audience: [developer, operator, integrator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: universe-index-atomicals-nfts-and-realms
      path: provenance
  verified: '2026-08-31'
  tags: [electrumx, reference]
  limitations:
    - Method availability and response shapes are version sensitive. Confirm against the exact release you connect to.
    - A Universe proxy or gateway is not the same as official ElectrumX. Do not attribute proxy behavior to the protocol.
---

## What ElectrumX is here

Atomicals ElectrumX reads Bitcoin blocks and applies the Atomicals protocol rules. It is where
protocol interpretation happens. Everything downstream is a projection of what it reports.

The pinned baseline for this documentation is release **v1.5.2.0**, commit
[`8df23747`](https://github.com/atomicals/atomicals-electrumx/commit/8df23747835c20230fc8b8097d469e7a1d97c3e0),
released on 2025-03-27. That baseline is preserved as a historical reference and is not rewritten
when a Universe service upgrades.

## The version handshake

A consumer must check compatibility before trusting anything a provider reports. The Universe NFT
and Realm index does exactly that, and refuses a provider that does not match:

| Field | Checked against |
| --- | --- |
| Version | The pinned provider version |
| Tag | The pinned provider tag |
| Commit | The pinned provider commit |
| Implemented AIPs | The exact required set, `[1, 3]` |
| Network | The configured network |

An exact AIP set is required. A provider reporting a different set, in a different order, or a
different length is rejected rather than accepted with a warning.

See [Atomicals Improvement Proposals](/protocol/aips/).

## Methods the Universe projection relies on

| Method | Used for |
| --- | --- |
| `server.info` | The version and AIP handshake above |
| `blockchain.atomicals.get_global` | The provider's current tip and global state |
| `blockchain.atomicals.list` | Enumerating Atomicals for the scan |
| `blockchain.atomicals.get_location` | Resolving where an Atomical currently sits |

The Marketplace authority additionally reads:

| Method | Used for |
| --- | --- |
| `blockchain.atomicals.at_location` | Confirming exactly one authoritative asset at an outpoint |
| `blockchain.atomicals.listscripthash` | Confirming exactly one active row whose coloured balance is the full output value |
| `blockchain.atomicals.get_by_ticker` | Resolving a ticker to its verified winner |

Those two lists are the write capability boundary as well: the projection declares **no write
capabilities**.

## Caching and consistency

Three rules:

1. **Never cache a result without its chain position.** A response is only true at the tip it was
   computed at.
2. **Never mix positions.** Two calls at different tips produce an inconsistent picture. Bracket
   related calls and abort if the tip moved.
3. **A generation spanning more than one provider tip is mixed.** The Universe index publishes such
   a generation explicitly as mixed and stale rather than presenting it as consistent.

## Activation sensitive behavior

Some responses depend on rules that activate at a height, per network. A method that returns one
answer today can return a different one for the same historical transaction under a different
revision.

Record the provider version, the network, and the height with every stored answer.
See [activation boundaries](/protocol/core/activation-boundaries/).

## Official against proxy behavior

| Layer | What it is |
| --- | --- |
| Official Atomicals ElectrumX | The protocol authority. Its behavior is protocol behavior |
| A Universe proxy or gateway | Transport, authentication, and shaping in front of it |
| A Universe index | A materialised projection with its own generation model |

Only the first is protocol behavior. Anything added by the second or third is Universe
implementation and is labelled as such throughout this documentation.

## Source

[Indexer and validator dependency](/protocol/core/indexer-dependency/) and
[source of truth](/develop/source-of-truth/).

