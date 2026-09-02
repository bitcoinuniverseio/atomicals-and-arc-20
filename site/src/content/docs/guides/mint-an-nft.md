---
title: Mint an Atomicals NFT
description: Build the payload, choose an output value, and understand which decisions become permanent.
sidebar:
  order: 16
provenance:
  pageId: guides/mint-an-nft
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
  tags: [nft, minting]
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- The bytes you embed are permanent and public.

## What you need

| Input | Notes |
| --- | --- |
| The payload | A file, or a JSON document |
| Media, if any | Optimised before minting. Reveal fees scale with size |
| An output value | Above the relay dust threshold for the script type |
| Funding | Two fees plus the output value plus grinding cost |

## The commands

```text
yarn cli mint-nft <file>
yarn cli mint-nft-json <file>
```

Options include `--satsoutput`, `--initialowner`, `--parent`, `--parentowner`, `--bitworkc`,
`--bitworkr`, `--funding`, `--satsbyte`, `--rbf`. See the
[CLI reference](/reference/cli/#mint-nft).

## Permanent decisions

| Decision | Why |
| --- | --- |
| The Atomical ID | Assigned at mint |
| Embedded bytes | They are in a block |
| Parent linkage | Set at mint |
| A name request | A different name means a different mint |

Everything else is state and can change until you seal.

## Reducing cost

1. Reference shared bytes rather than embedding them per item.
2. Prefer a compact source format such as optimised SVG.
3. Estimate the reveal size with the real bytes before choosing a Bitwork prefix.

## Check before signing

- The payload contains nothing private.
- The media is the final version. There is no replacing it.
- The output value is above the dust threshold and is a value you are content to lock.
- The funding input is cardinal.
- Enough remains after the commit to pay the reveal.

## After broadcast

1. Confirm, then wait for indexing.
2. Confirm the type and subtype are what you expected.
3. Record the Atomical ID.
4. Move it into your protected pool.
5. Seal only when you are certain. There is no unseal.

## Source

[Minting an NFT](/protocol/nft/minting/) and
[metadata and media](/protocol/nft/metadata-and-media/).

