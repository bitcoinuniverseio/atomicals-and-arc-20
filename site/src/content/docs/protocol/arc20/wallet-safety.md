---
title: Wallet safety
description: What an Atomicals aware wallet must do, what it must never do, and how to tell whether the wallet you use qualifies.
sidebar:
  order: 15
provenance:
  pageId: protocol/arc20/wallet-safety
  area: protocol
  audience: [everyone, holder, integrator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
  verified: '2026-08-31'
  tags: [wallets, safety]
---

An ordinary Bitcoin wallet is dangerous for Atomicals not because it is badly built, but because
it is correctly built for a different problem. It sees satoshis and optimises fees.

## What a wallet must do

1. **Identify coloured outputs.** Per outpoint, with the Atomical ID, not as an address total.
2. **Exclude them from automatic coin selection.** Always, unless the user explicitly chose to
   spend that asset.
3. **Keep a cardinal pool.** Ordinary outputs reserved for fees.
4. **Preview the allocation.** Before signing, show every output, its satoshi value, and its
   expected coloured assignment.
5. **Show the burn figure.** Zero should be the normal case, and a non-zero figure should require
   a deliberate confirmation.
6. **Preserve input and output order.** Never reorder for canonicalisation.
7. **Show the signature hash flag.** And refuse flags the user did not expect.
8. **Report its data source.** Which index, which revision, how fresh.

## What a wallet must never do

- Never sweep or consolidate without showing the allocation result.
- Never choose a coloured output for a fee silently.
- Never display a token balance without the resolved Atomical ID available.
- Never round a native quantity using `decimals` before building a transaction.
- Never ask for a seed phrase or private key to display a balance.

## How to test the wallet you use

| Test | Pass |
| --- | --- |
| Ask it to show your outputs | It lists outpoints and marks coloured ones |
| Try to send BTC while holding coloured outputs | It excludes them or warns clearly |
| Build a partial transfer | It shows expected units per output before signing |
| Build a transfer with a bad change size | It shows a non-zero burn figure and asks again |
| Check the source | It names the index and its freshness |

If a wallet fails the first test, it is not suitable for holding Atomicals. See
[choose a wallet](/guides/choose-a-wallet/).

## For integrators

Capability discovery matters. Ask the provider what it supports before building a transaction for
it, rather than discovering a gap through a signing failure. See
[wallet integration](/reference/wallet-integration/).

