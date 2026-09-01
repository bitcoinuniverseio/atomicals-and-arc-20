---
title: Direct FT issuance
description: One transaction, one complete supply, entirely in output zero, and why that makes large supplies expensive.
sidebar:
  order: 4
provenance:
  pageId: protocol/arc20/direct-issuance
  area: protocol
  audience: [creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: atomicals-js-cli
      path: commandIndex
    - id: atomicals-guide
      path: arc20
  verified: '2026-08-31'
  tags: [issuance, ft]
  limitations:
    - No Universe product surface exposes direct FT issuance. This page documents protocol behavior only.
---

Direct issuance is the `ft` operation. It creates the whole supply of a token in one commit and
reveal pair, and places all of it in output zero of the reveal transaction.

## The reference command

```text
yarn cli mint-ft <tick> <supply> <file>
```

Common options from the generated inventory: `--bitworkc`, `--bitworkr`, `--initialowner`,
`--parent`, `--parentowner`, `--funding`, `--satsbyte`, `--rbf`, `--disablechalk`.
See the [CLI reference](/reference/cli/#mint-ft).

## What the supply figure means

Because one unit is one satoshi, the supply argument is also the satoshi value that output zero
must carry. A direct mint of 100 000 000 units requires a 100 000 000 satoshi output, which is one
bitcoin.

| Supply | Satoshis needed in output zero |
| --- | --- |
| 21 000 | 21 000 |
| 1 000 000 | 1 000 000 |
| 100 000 000 | 100 000 000, one bitcoin |
| 2 100 000 000 | 2 100 000 000, twenty one bitcoin |

That constraint is the whole point. A direct supply cannot be conjured. It is bitcoin you actually
committed.

## What it is not

Direct issuance is a colouring model. It does not create:

- collateral;
- a redemption right;
- a price floor;
- a peg to anything.

Do not describe it in those terms, and do not accept a product that does.

## Ticker rules

The pinned validator accepts direct FT tickers matching lowercase `[a-z0-9]{1,21}`. That is a
source-revision fact. Validate against the exact active target rather than hardcoding it.
See [tickers and candidates](/protocol/arc20/tickers-and-candidates/).

## After the mint

Output zero holds the whole supply as one coloured lot. Before distributing anything, decide the
lot structure you want and model each split. A single large lot is easy to burn when the first
transfer gets its change output size wrong.
See [allocation](/protocol/arc20/allocation/) and
[split and combine](/protocol/arc20/split-and-combine/).

## Universe status

Not exposed. Universe products offer decentralised deploy and mint flows, not direct `mint-ft`
issuance. See [status and known limitations](/start/status-and-limitations/).

