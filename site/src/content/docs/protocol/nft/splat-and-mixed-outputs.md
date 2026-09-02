---
title: Splat and mixed outputs
description: What happens when one output carries several Atomicals, why that is dangerous, and how splat separates them.
sidebar:
  order: 5
provenance:
  pageId: protocol/nft/splat-and-mixed-outputs
  area: protocol
  audience: [holder, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: nftAllocation
    - id: atomicals-js-cli
      path: commandIndex
  verified: '2026-08-31'
  tags: [splat, nft, hazards]
---

One Bitcoin output can carry several Atomicals at once. That happens after a consolidation, after
some mints, or when a transfer places several objects in the same slot.

## Why it is dangerous

A mixed output cannot be moved selectively. Spending it moves everything it carries, and the
allocation branch decides where each object lands. You cannot send one and keep the others by
adjusting an amount, because there is no amount.

Consequences:

- Selling one object from a mixed output means moving all of them.
- A marketplace that accepts a mixed output as collateral cannot guarantee what settles.
- A wallet that shows a mixed output as one asset is hiding the others.

The Universe Marketplace rejects mixed collateral across all four protocol lanes for exactly this
reason.

## Splat

Splat is the `x` operation on the non-fungible branch. It extracts Atomicals from an output that
holds several, placing them into separate outputs.

The reference CLI exposes:

```text
yarn cli splat <locationId>
```

Options include `--satsoutput`, `--owner`, `--funding`, `--satsbyte`, `--bitworkc`, `--rbf`.
See the [CLI reference](/reference/cli/#splat).

Splat is not a fungible operation. It is not a substitute for
[split](/protocol/arc20/split-and-combine/).

## Procedure

1. Identify the outpoint and list every Atomical it carries.
2. Decide the destination output for each.
3. Build the splat, choosing an output value for each destination that is above the relay dust
   threshold.
4. Fund the fee from a cardinal input.
5. Confirm, index, then verify each object landed where you intended.

## Prevention

- Never consolidate outputs that carry Atomicals.
- Keep one asset per output as a working rule.
- Ask your data source for the full Atomicals list per outpoint, not a single asset.
- Refuse to list a mixed output for sale until it is separated.

