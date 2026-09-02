---
title: Split and combine
description: Separating coloured lots with the split operation, recombining them, and the activation gated custom coloring path.
sidebar:
  order: 11
provenance:
  pageId: protocol/arc20/split-and-combine
  area: protocol
  audience: [developer, holder]
  applicability: protocol-behavior
  authority: executed-source
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: splitAndInflation
    - id: atomicals-js-cli
      path: commandIndex
  activation: Custom coloring with the z operation is activation gated and must not be assumed universally available.
  verified: '2026-08-31'
  tags: [split, combine, operations]
  limitations:
    - Split and custom coloring payload shapes are implementation specific. Do not hand-assemble them from a user interface amount field.
---

## Combining

Combining is not an operation. It is ordinary allocation with several coloured inputs of the same
token and one output large enough to take the whole sum.

The `combine-two-lots` case in the [allocation vectors](/protocol/arc20/allocation/) shows it:
700 units plus 500 units into a 1200 satoshi output, cleanly, with nothing burned.

Two cautions:

- Combining tokens that are **not** the same is not combining. It creates a multi token
  transaction subject to the output zero fallback.
- Combining collapses your lot structure. If you later need a 500 unit transfer and hold one
  1200 unit lot, you now depend on getting the change output size exactly right.

## Splitting

Split is the `y` operation. At the pinned revision it lets a builder skip a total amount of value
before it begins colouring outputs, which is what makes it possible to separate several tokens
that share one input.

The payload keys the skip amount by the compact Atomical ID of the token it applies to. That is an
implementation specific structure, not a general purpose amount field.

The reference CLI exposes `split <locationId>`. See the [CLI reference](/reference/cli/).

## Custom coloring

Custom coloring is the `z` operation and is activation gated. Where it is active, the builder
attaches outputs even when the remaining value does not cover them fully, and the last attached
output receives only what is left rather than nothing.

The `custom-coloring-partial-fill` case in the
[allocation vectors](/protocol/arc20/allocation/) shows the difference: the same transaction that
burns 500 units under normal allocation places them as a partial fill under custom coloring.

Never assume custom coloring is available. Read the active rule set for the network and height
you are targeting. See [activation boundaries](/protocol/core/activation-boundaries/).

The reference CLI exposes `custom-color`. See the [CLI reference](/reference/cli/).

## Splat is not a fungible operation

The `x` splat operation belongs to the non-fungible branch. It separates multiple Atomicals held
at one output. It is not a general ARC-20 transfer or split mechanism.
See [splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).

## Practical lot management

| Goal | Approach |
| --- | --- |
| Keep transfers simple | Hold several lots sized for the transfers you expect |
| Reduce fee cost | Combine, but only after you know your future split sizes |
| Move part of a lot | Send plus a change output sized to the exact remainder |
| Separate tokens at one input | Split, with a payload built by a compatible library |
| Avoid the fallback | One token per transaction |
