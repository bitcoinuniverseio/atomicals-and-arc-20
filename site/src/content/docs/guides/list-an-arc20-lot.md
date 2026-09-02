---
title: List an ARC-20 lot
description: Prove ownership, prepare a listing, sign it, and finalise, without exposing the asset to an unbound signature.
sidebar:
  order: 25
provenance:
  pageId: guides/list-an-arc20-lot
  area: guides
  audience: [holder, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
  verified: '2026-08-31'
  tags: [marketplace, listing]
  limitations:
    - Every marketplace action gate defaults to off. A capability being documented is not a statement that it is enabled on a deployment.
---

## Before you start

- Supported networks: mainnet.
- Status: Universe implementation. Action gates default to off.
- Your lot must be a clean, unmixed coloured output.

## The lifecycle

1. **Challenge.** Request an authentication challenge.
2. **Verify.** Prove control of the owner address with a BIP-322 simple proof for P2WPKH or
   key-path P2TR. This issues a short lived owner session. It does not move anything.
3. **Prepare.** Submit the listing intent. The authority resolves the ticker to its verified
   winner and verifies the collateral against Bitcoin Core and the Atomicals provider, under one
   stable checkpoint.
4. **Sign.** Sign what the prepare step returned, with the exact scope it specifies.
5. **Finalise.** Submit the signed material. The listing becomes active.

## What the authority checks before accepting your lot

- The ticker resolves to its verified Atomical FT winner.
- Bitcoin Core reports a confirmed, live output with the exact value and owner script.
- The Atomicals provider reports exactly that location, script, value, and one authoritative FT.
- The script hash view reports exactly one active row whose coloured balance is the full output
  value.
- Heights and hashes on both sides stay unchanged across the verification bracket.

Any disagreement, or any movement mid-check, fails the request closed.

## Always rejected

Mixed collateral, spent outputs, checkpoint drift, ambiguous balances, Atomicals operations,
burns, and output assignments that do not move the exact selected Atomical.

## Check before signing

- The asset in the listing is the Atomical ID you intend, not just the ticker.
- The price and the exact payment script are what you agreed.
- The signature scope binds the payment output exactly.
- The listing does not spend anything now. Only settlement does.

## If it fails

| Failure | Meaning |
| --- | --- |
| Owner session missing or expired | Redo the challenge and verify steps |
| Mixed collateral | Separate the output first |
| Checkpoint drift | The chain moved mid-check. Retry |
| Gate disabled | Listing is not enabled on this deployment |

## After

Read the listing back and confirm the asset, price, and payment script. Your lot stays in your
control until a settlement transaction is signed and broadcast.

## Source

[Marketplace v1](/reference/api/marketplace-v1/) and
[transfers and swaps](/protocol/arc20/transfers-and-swaps/).

