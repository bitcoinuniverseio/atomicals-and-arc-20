---
title: Confirmation and reorgs
description: Two separate questions that people constantly merge into one, and what a reorg actually does to an Atomicals result.
sidebar:
  order: 12
provenance:
  pageId: protocol/core/confirmation-and-reorgs
  area: protocol
  audience: [everyone, developer, operator]
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

Two questions, two answers, never the same answer.

**Did Bitcoin confirm the transaction?** A block contains it. Depth grows over time.

**Did the Atomicals operation succeed?** A validator applied the rules and produced a result. That
result is only as final as the chain position it was computed at.

## What a reorg changes

A reorg replaces blocks. Everything computed from the replaced blocks is suspect:

| Result | Effect of a reorg |
| --- | --- |
| A mint in a replaced block | May not exist in the new chain |
| A name resolution | May resolve to a different candidate |
| A transfer | May never have happened |
| A burn | May not have occurred |
| A mint quota position | May shift, invalidating later claims |

A well-built index does not patch these results in place. It invalidates the affected generation
and rebuilds from a checkpoint. See [consistency and reorgs](/develop/consistency-and-reorgs/).

## What a caller should do

1. Read the generation identifier and indexed height from every response.
2. Do not treat a result computed within the reorg window as settled.
3. For value decisions, wait for depth appropriate to the value at risk, then re-read.
4. Re-read after any reported generation change, not only after an obvious reorg.
5. Never cache an Atomicals result without also caching the generation it came from.

## Why "confirmed" in a product is not a protocol statement

A product can call an action `confirmed` when it has broadcast and seen one confirmation. That is
a product state. It is not a statement about confirmation depth, reorg safety, or indexer
finality. Read the field definition before mapping it into your own model.

