---
title: Atomicals digital objects
description: What an Atomical actually is at the data level, what a validator stores about it, and what it never guarantees.
sidebar:
  order: 1
provenance:
  pageId: protocol/core/digital-objects
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
  verified: '2026-08-31'
  tags: [concepts]
---

An Atomical is the record a validator builds after reading a valid operation envelope in a
Bitcoin transaction. Three things exist from that moment.

## Identity

Assigned once, at mint, in the form `<txid>i<output-index>`. It never changes and is never
reassigned. A separate sequential number is also assigned, useful for display and ordering but
not a durable key.

Store the Atomical ID. Display the number if you like. Never key on the number alone.

## Type and subtype

The mint operation decides the type. `nft` produces a non-fungible object. `ft` and `dft` produce
fungible issuance. Subtypes narrow this further: a Realm, a Subrealm, a Container, and a DMINT
item are all non-fungible objects with a request payload that makes them a name or a collection.

An integration that only expects a plain NFT must reject the subtypes it does not handle, rather
than treating them as generic.

## Payload

The CBOR payload in the envelope. It can contain:

- arbitrary metadata such as `name`, `desc`, `image`, `links`, `legal`;
- one or more embedded files with declared content types;
- request fields such as a ticker, realm, or container name;
- rule structures for Subrealm and DMINT claims.

All of it is supplied by the minter. None of it is verified by anyone.
See [metadata trust boundaries](/protocol/core/metadata-trust/).

## What a validator stores

| Field | Meaning |
| --- | --- |
| Atomical ID | Durable identity |
| Number | Mint order |
| Type and subtype | What kind of object it is |
| Mint transaction and height | Where it came from |
| Current location | The outpoint that carries it now |
| Owner script | The script controlling that outpoint |
| State | The result of applied `mod` operations |
| History | Every operation applied, in order |
| Sealed flag | Whether further changes are refused |

## What none of this proves

- Not who created it. Anyone can mint anything with any metadata.
- Not that the media is original, licensed, or safe to render.
- Not that a name in the payload matches the name the rules actually awarded.
- Not that another validator revision agrees with this record.

Read [indexer dependency](/protocol/core/indexer-dependency/) next.
