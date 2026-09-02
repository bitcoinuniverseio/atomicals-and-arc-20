---
title: Indexer and validator dependency
description: Why every Atomicals answer is version scoped, and how to handle two sources that disagree.
sidebar:
  order: 13
provenance:
  pageId: protocol/core/indexer-dependency
  area: protocol
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
  tags: [indexers, trust]
  limitations:
    - Two sources agreeing does not prove either is right. It proves they share an interpretation.
---

Bitcoin does not know what an Atomical is. Every Atomicals answer comes from software that reads
blocks and applies rules. That software has a version, a network, a chain position, and a set of
active rules.

## What every answer is scoped to

| Scope | Why it matters |
| --- | --- |
| Validator revision | Decides how the transaction is interpreted |
| Network | Decides which activation conditions apply |
| Block height | Decides which rules were active for that transaction |
| Generation | Decides which consistent snapshot you are reading |
| Projection | Decides which asset kinds are even included |

A source that does not tell you all five is not usable for a value decision.

## Projections exclude things on purpose

An index can deliberately cover a subset. The Universe NFT and Realm read model projects plain
NFTs, Realms, and Subrealms, and excludes fungible tokens, Containers, and DMINT items. Asking it
about a Container is not a bug when it returns nothing. It is out of scope by declaration.

Always read the projection declaration before concluding that an asset does not exist.

## When two sources disagree

Do not vote. Investigate in this order:

1. Are they on the same network?
2. Are they at the same chain position, or is one behind?
3. Are they at the same validator revision?
4. Is the behavior in question activation sensitive at the height involved?
5. Do they cover the same projection?

Only after all five match does a disagreement mean one of them is wrong.

## Practical rule

For anything with value at stake, compare more than one compatible source, and treat any
disagreement as a hold, not a tie-break. Record the revision and generation of each answer so the
difference can be explained afterwards.

