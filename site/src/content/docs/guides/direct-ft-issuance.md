---
title: Direct FT issuance
description: One transaction, one complete supply, and the bitcoin you must actually commit for it.
sidebar:
  order: 12
provenance:
  pageId: guides/direct-ft-issuance
  area: guides
  audience: [creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-js-cli
      path: commandIndex
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
  verified: '2026-08-31'
  tags: [issuance, ft]
  limitations:
    - No Universe product surface exposes direct FT issuance. This procedure uses the reference CLI.
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. **Not exposed by any Universe product.** Use the reference CLI.
- You need the reference CLI, a funded wallet it controls, and the full supply in bitcoin.

## What you need

| Input | Notes |
| --- | --- |
| A ticker | Lowercase, validated against the active rule. See [tickers](/protocol/arc20/tickers-and-candidates/) |
| The supply | In units, which is also the satoshi value output zero must carry |
| A metadata file | Optional JSON. Treat everything in it as public and unverified |
| Funding | The supply, plus commit and reveal fees, plus grinding cost |

## The command

```text
yarn cli mint-ft <tick> <supply> <file>
```

Useful options: `--bitworkc`, `--bitworkr`, `--initialowner`, `--parent`, `--parentowner`,
`--funding`, `--satsbyte`, `--rbf`, `--disablechalk`. See the
[CLI reference](/reference/cli/#mint-ft) and the
[command builder](/tools/cli-builder/).

## What happens

1. A commit transaction pays into a Taproot output committing to the envelope.
2. If Bitwork is set, the commit is ground until its transaction id matches.
3. A reveal transaction spends it, exposing the envelope.
4. Output zero of the reveal carries the whole supply in satoshis.

## Cost

The supply itself is locked in output zero. On top: two Bitcoin fees, and grinding time if you set
Bitwork. A supply of 100 000 000 units requires one bitcoin in that output.

## Check before signing

- The ticker string is exactly what you intend, character by character.
- The supply figure matches the satoshis you are committing.
- The metadata contains nothing private and nothing you cannot stand behind.
- The funding source is cardinal.
- You have enough left to pay the reveal fee after the commit.

## If it fails

| Failure | Meaning |
| --- | --- |
| Ticker rejected | The name failed the active rule |
| Reveal underfunded | The commit did not carry enough. Fund more and start again |
| Ticker already claimed | Another Atomical won the name. Your mint may exist without the ticker |
| Bitwork not met | The grind did not complete for the target |

## After broadcast

1. Confirm on Bitcoin.
2. Wait for indexing.
3. Confirm the ticker resolved to **your** Atomical ID and not to a competing candidate.
4. Record the Atomical ID.
5. Plan your lot structure before the first distribution.
   See [split and combine](/guides/split-and-combine-arc20/).

## Source

[Direct issuance](/protocol/arc20/direct-issuance/).

