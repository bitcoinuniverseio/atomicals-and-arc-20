---
title: Deploy a fixed DFT
description: Publish the mint rules others will claim against, and get the four parameters right the first time.
sidebar:
  order: 13
provenance:
  pageId: guides/deploy-fixed-dft
  area: guides
  audience: [creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-js-cli
      path: commandIndex
    - id: atomicals-electrumx-1.5.2.0
      path: dftMintValidation
  activation: Mint count limits have legacy and later density variants. Check the limit active on your target network.
  verified: '2026-08-31'
  tags: [dft, deployment]
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. Universe products expose decentralised deploy and mint flows.
- The parameters are permanent. There is no edit.

## What you need

| Parameter | Constraint at the pinned revision |
| --- | --- |
| Ticker | Validated by the active ticker rule |
| `mint_amount` | 546 through 100 000 000 satoshis |
| `max_mints` | At least 1. The maximum is activation dependent |
| `mint_height` | 0 through 10 000 000 |
| Metadata file | Optional JSON |
| `mint_bitworkc` | Optional commit work for claimants |

## The command

```text
yarn cli init-dft <ticker> <mint_amount> <max_mints> <mint_height> <file> <mintbitworkc>
```

There is also `init-dft-fixed`. See the [CLI reference](/reference/cli/#init-dft).

## Choosing the parameters

**`mint_amount`.** This is what each claimant locks in output zero. Small amounts make minting
cheap and produce many dust-sized lots. Large amounts make minting expensive and produce few large
lots. Pick with the transfers people will actually make in mind.

**`max_mints`.** Multiply by `mint_amount` to get nominal maximum issuance, which is bitcoin that
would be locked if the ceiling were reached. Check the value against the limit active on your
network before deploying.

**`mint_height`.** Give yourself enough room to publish the deployment before claiming opens.

**Mint Bitwork.** Raises the cost of automated claiming. It also raises the cost for everyone.
Model it with the [Bitwork estimator](/tools/bitwork-estimator/).

## Check before signing

- Every parameter is within the range active on your target network.
- `mint_amount * max_mints` is the issuance you actually intend.
- The ticker string is exactly right.
- You are deploying on the network you think you are.

## After broadcast

1. Confirm, then wait for indexing.
2. Confirm the ticker resolved to your Atomical ID.
3. Publish the resolved Atomical ID, not just the name, so claimants can verify.
4. Verify the deployment reads back exactly as you intended before telling anyone to mint.

## Source

[Fixed DFT deployment](/protocol/arc20/fixed-dft/).

