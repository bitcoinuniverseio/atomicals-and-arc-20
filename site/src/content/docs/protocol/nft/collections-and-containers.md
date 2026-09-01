---
title: Collections and Containers
description: How an NFT proves membership in a collection, what a Container adds, and what a collection label alone proves.
sidebar:
  order: 6
provenance:
  pageId: protocol/nft/collections-and-containers
  area: protocol
  audience: [creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
  verified: '2026-08-31'
  tags: [collections, containers]
---

A collection in Atomicals is not a label. It is a relationship a validator can check.

## The weak form: a metadata claim

An NFT payload can say it belongs to a collection. Nothing checks that. Anyone can mint an object
claiming membership in anything.

A product that groups by a metadata field is grouping by an unverified string.

## The strong form: a Container

A Container is a named Atomical that represents the collection identity. Items prove membership
against it, and with a sealed DMINT manifest that proof is checkable.

| Property | Metadata claim | Container membership |
| --- | --- | --- |
| Anyone can assert it | Yes | No |
| A validator can check it | No | Yes, against the manifest |
| Rules can be changed later | Not applicable | No, once sealed |
| Item count is bounded | No | Yes, by the manifest |

See [Containers](/protocol/containers/overview/) and [DMINT](/protocol/containers/dmint/).

## Parent linkage

Mint commands accept `--parent` and `--parentowner`, which link the new object to a parent
Atomical at mint time. That linkage is set once and is part of the mint.

## What to display

1. The collection's Container Atomical ID, not just its name.
2. Whether the manifest is sealed.
3. Whether this item's membership was verified against the manifest, or merely asserted in
   metadata.
4. The number of verified items against the manifest total.

A user interface that shows a collection name without those four is showing a claim.

