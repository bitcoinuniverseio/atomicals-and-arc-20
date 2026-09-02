# UTXO ownership and location

Ownership in Atomicals is control of a specific unspent output, not an entry against an address.

Page ID: protocol/core/utxo-ownership
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/utxo-ownership/

---
You do not own an Atomical at an address. You own it because you control the private key for the
script of one specific unspent output, and that output currently carries the object.

## Why the distinction matters

| Statement | True? |
| --- | --- |
| This address holds 5000 units | A convenience sum, not a stored fact |
| This outpoint carries 5000 units | The actual fact a validator records |
| Moving BTC from this address is safe | Only if the spent outputs are cardinal |
| Consolidating my UTXOs is harmless | No. Consolidation is an allocation event |

An ordinary wallet sees satoshis. It will happily select a coloured output to pay a fee, split it
into change, or sweep it into one consolidated output. Every one of those is an Atomicals
operation whether you meant it or not.

## The three states of an output

**Coloured.** A validator recognises Atomicals value at this outpoint. Spending it moves or
destroys that value.

**Cardinal.** Ordinary bitcoin. Safe to spend for fees.

**Unknown.** Your data source has not caught up, is unavailable, or does not index the relevant
asset type. Treat unknown as coloured until proven otherwise.

## Multiple Atomicals at one output

An output can carry more than one Atomical. That happens after a consolidation, or when a mint
places several objects together. Separating them is a deliberate operation, not a side effect of
an ordinary spend.

For non-fungible objects that separation is the `x` splat operation. See
[splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).

## What to do about it

1. Ask your data source for outpoints, not address totals.
2. Keep coloured outputs in a wallet that can freeze or exclude them.
3. Keep a dedicated pool of cardinal outputs for fees. See
   [protect coloured outputs](/guides/protect-colored-outputs/).
4. Before signing, confirm each input's state individually.
