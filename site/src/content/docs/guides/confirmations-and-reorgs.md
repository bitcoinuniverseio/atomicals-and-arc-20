---
title: Confirmations and reorgs
description: When an Atomicals result is settled enough to act on, and what changes when the chain reorganises.
sidebar:
  order: 10
provenance:
  pageId: guides/confirmations-and-reorgs
  area: guides
  audience: [everyone, holder, operator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: universe-index-atomicals-nfts-and-realms
      path: architectureDocs
  verified: '2026-08-31'
  tags: [reorgs, finality]
---

## Two questions, two answers

**Did Bitcoin confirm it?** A block contains it, at some depth.

**Did the Atomicals operation succeed?** A validator applied the rules and produced a result, at a
chain position.

Both must be answered. Neither implies the other.

## The three states you will see

| State | Meaning | Safe to act on |
| --- | --- | --- |
| Broadcast, unconfirmed | In a mempool somewhere | No |
| Confirmed, not yet indexed | In a block, no Atomicals result yet | No |
| Confirmed and indexed at a stable generation | A validator produced a result | Depends on depth and value |

## What a reorg changes

A reorg replaces blocks, so everything computed from them is suspect: mints, name resolutions,
transfers, burns, and mint quota positions.

A well-built index does not patch these in place. It invalidates the affected generation and
rebuilds from a checkpoint. That is why a generation identifier is worth recording.

## What to do

1. Read the generation identifier and indexed height with every answer.
2. For a small amount, one confirmation plus indexing is usually enough.
3. For a significant amount, wait for depth appropriate to the value, then re-read.
4. Re-read after any reported generation change, not only after an obvious reorg.
5. Never cache an Atomicals result without also caching the generation it came from.

## Product state against protocol state

A product can label an action `confirmed` when it has broadcast and seen one confirmation. That is
a product state, not a statement about depth, reorg safety, or indexer finality. Read the field
definition before mapping it into your own model.

## Source

[Confirmation and reorgs](/protocol/core/confirmation-and-reorgs/) and
[consistency and reorgs](/develop/consistency-and-reorgs/).

