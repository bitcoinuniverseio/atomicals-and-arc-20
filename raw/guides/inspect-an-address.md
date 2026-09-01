# Inspect an address

Read outpoints instead of totals, and understand exactly what a balance figure hides.

Page ID: guides/inspect-an-address
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/inspect-an-address/

---
## Before you start

- Supported networks: mainnet.
- Status: Universe implementation for the read views. The underlying model is protocol behavior.
- Read only. Nothing here spends anything.

## What you need

The address, and a data source that reports outpoints.

## The procedure

1. Read the portfolio balances view for the address.
2. Read the coloured UTXO view for the same address. This is the one that matters.
3. For each coloured outpoint, record: the txid and vout, the satoshi value, and the Atomical ID
   or IDs it carries.
4. Note any outpoint carrying more than one Atomical. That is a mixed output.
   See [splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).
5. Record the generation identifier and indexed height the answer came from.

## What a balance figure hides

| The total says | It does not say |
| --- | --- |
| 1 246 units | How many outputs that is, or their sizes |
| One token | Whether any output also carries something else |
| A number | Whether any output is below the dust threshold |
| A current figure | Which generation and height produced it |

You cannot plan a transfer from a total. You can only plan one from outpoints.

## Reading the response

Every Universe response carries a request identifier, a generation identifier, and freshness
metadata. Record them. When something looks wrong later, those three fields are what makes the
difference explainable.
See [readiness and freshness](/develop/readiness-and-freshness/).

## If it fails

An empty result and an unavailable service look the same in a user interface and mean opposite
things. Read
[unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/).

## Source

[UTXO ownership](/protocol/core/utxo-ownership/) and [ARC-20 API](/reference/api/arc20/).
