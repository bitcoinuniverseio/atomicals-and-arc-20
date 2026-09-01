---
title: Split and combine ARC-20
description: Reshape your lots deliberately, and know when combining makes future transfers harder.
sidebar:
  order: 21
provenance:
  pageId: guides/split-and-combine-arc20
  area: guides
  audience: [holder, developer]
  applicability: protocol-behavior
  authority: executed-source
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: splitAndInflation
    - id: atomicals-js-cli
      path: commandIndex
  activation: Custom coloring with the z operation is activation gated.
  verified: '2026-08-31'
  tags: [split, combine]
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. Custom coloring is activation gated.
- Both operations are allocation events. Model them before building.

## Combining

Combining is ordinary allocation: several coloured inputs of the same token, one output large
enough to take the whole sum.

1. List the lots to combine and add their values.
2. Create one output with exactly that satoshi value.
3. Fund the fee from a cardinal input, with a cardinal change output.
4. Model it. The burn figure must be zero.
5. Sign and broadcast.

**Combine only lots of the same token.** Mixing tokens creates a multi token transaction subject
to the output zero fallback.

**Think ahead.** One large lot makes every future partial transfer depend on getting the change
output size exactly right. Several right-sized lots are easier to move safely.

## Splitting

Split is the `y` operation. It skips a total amount of value before colouring begins, which is
what lets a builder separate several tokens sharing one input.

```text
yarn cli split <locationId>
```

The payload keys the skip amount by the compact Atomical ID it applies to. That is an
implementation specific structure. Build it with a compatible library, never by hand from a user
interface field.

## Custom coloring

Custom coloring is the `z` operation and is activation gated. Where active, it attaches outputs
even when the remaining value does not cover them fully, and the last attached output receives
what is left rather than nothing.

```text
yarn cli custom-color <locationId>
```

Do not assume it is available. Read the active rule set for your network and height.

## Check before signing

- Every coloured input is a lot you intend to spend.
- Output values in satoshis sum the way you expect.
- The burn figure is zero.
- The fee comes from a cardinal input.
- You modelled again after adding fee inputs and change.

## After broadcast

Confirm, wait for indexing, and read your new lot structure. Record the new outpoints.

## Source

[Split and combine](/protocol/arc20/split-and-combine/) and
[allocation](/protocol/arc20/allocation/).

