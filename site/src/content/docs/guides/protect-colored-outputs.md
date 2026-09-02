---
title: Protect coloured outputs
description: The working separation between asset money and fee money, and the three habits that prevent an accidental spend.
sidebar:
  order: 4
provenance:
  pageId: guides/protect-colored-outputs
  area: guides
  audience: [everyone, holder]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
  verified: '2026-08-31'
  tags: [safety, utxo]
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- Nothing here spends anything.

## The problem in one sentence

An ordinary Bitcoin wallet sees satoshis, so it will happily spend the output carrying your asset
to pay a fee.

## The three habits

**1. Two pools, always.** Coloured outputs in one place, cardinal outputs in another. Never let a
tool choose across both.

**2. Freeze what you can.** If the wallet supports marking outputs as unspendable, mark every
coloured output. If it does not, keep them in a separate wallet entirely.

**3. Never consolidate blindly.** Consolidation is an allocation event. It merges lots, can create
mixed outputs, and can burn value. Model it first.

## What to check every time

| Before you sign | What to confirm |
| --- | --- |
| The input list | Every input is the one you meant to spend |
| The fee source | A cardinal input, not the asset |
| Output values | In satoshis, sized deliberately |
| Expected units | Per output, matching your intent |
| Burn figure | Zero |

## The specific traps

- **Send max.** Sweeps everything, including coloured outputs.
- **Fee bump on an old transaction.** Can pull in new inputs.
- **Automatic consolidation.** Some wallets do it in the background.
- **Exchange deposits.** A deposit address is an ordinary Bitcoin address. Sending a coloured
  output there spends it as ordinary bitcoin. There is no recovery.

## If something already moved

Read [verify a transaction](/guides/verify-a-transaction/) to find out exactly what happened, then
[recover from a rejection](/guides/recover-from-a-rejection/) if it has not broadcast yet. A
confirmed burn cannot be reversed.

## Source

[Wallet safety](/protocol/arc20/wallet-safety/) and [burns](/protocol/arc20/burns/).

