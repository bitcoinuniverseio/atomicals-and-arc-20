---
title: Verify a transaction
description: Confirm what a transaction actually did, before signing and after broadcast, including any burn it caused.
sidebar:
  order: 9
provenance:
  pageId: guides/verify-a-transaction
  area: guides
  audience: [everyone, holder, developer]
  applicability: protocol-behavior
  authority: executed-source
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
    - id: universe-index-atomicals-nfts-and-realms
      path: server
  verified: '2026-08-31'
  tags: [verification, safety]
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior for the allocation result, Universe implementation for the read views.
- Do the pre-signing half every time. It is the only part that can still prevent a loss.

## Before signing

1. List every input, with its outpoint, satoshi value, and coloured state.
2. List every output, with its script and satoshi value, in order.
3. Compute the expected allocation for that exact input and output set.
   Use the [allocation visualizer](/tools/allocation-visualizer/).
4. Confirm the burn figure is zero, or that any burn is deliberate.
5. Confirm no output pays an address you did not intend.
6. Confirm the fee comes from a cardinal input.
7. Confirm the signature hash flag matches what the builder said it would use.
8. Compare all of it against the wallet prompt, line by line.

If any line differs from your expectation, do not sign.

## After broadcast

1. Wait for Bitcoin confirmation.
2. Wait for the index to reach that height and report a stable generation.
3. Read each moved asset by Atomical ID and confirm its current location matches the output you
   intended.
4. Read the transaction through a source that reports burns, and confirm the burn figure.
5. Compare the coloured input total against the sum of coloured output totals. Any difference is
   a burn.
6. Record the generation identifier alongside the result.

## What a block explorer tells you

That the bytes are in a block. Nothing about validity, allocation, or burns. An ordinary explorer
does not evaluate Atomicals rules.

## Reorg considerations

A result computed inside the reorg window is not settled. For anything with value at stake, wait
for depth appropriate to the amount, then re-read rather than trusting the first answer.
See [confirmations and reorgs](/guides/confirmations-and-reorgs/).

## If the result is wrong

- Not yet broadcast: [recover from a rejection](/guides/recover-from-a-rejection/).
- Broadcast but unconfirmed: replacement may be possible if the transaction signalled it. Do not
  build a replacement without modelling its allocation first.
- Confirmed with a burn: the units are gone. Record what happened and change the procedure that
  produced it.

## Source

[Allocation](/protocol/arc20/allocation/) and [burns](/protocol/arc20/burns/).

