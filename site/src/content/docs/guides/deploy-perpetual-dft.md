---
title: Deploy a perpetual DFT
description: An activation gated mode with progressing Bitwork, and the display rule that stops you publishing a supply cap that does not exist.
sidebar:
  order: 14
provenance:
  pageId: guides/deploy-perpetual-dft
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
  activation: Perpetual mode is activation gated. Confirm it is active on your target network before deploying.
  verified: '2026-08-31'
  tags: [dft, perpetual]
  limitations:
    - Do not publish a supply cap unless the deployment configures a global maximum.
---

## Before you start

- Supported networks: mainnet, subject to activation.
- Status: protocol behavior, activation gated.
- Confirm perpetual mode is active on your target network first. If it is not, the deployment will
  not behave as you expect.

## The command

```text
yarn cli init-dft-perpetual <ticker>
```

See the [CLI reference](/reference/cli/#init-dft-perpetual).

## What is different from fixed

| Aspect | Fixed | Perpetual |
| --- | --- | --- |
| Availability | Generally available | Activation gated |
| Bitwork | Set once | Progresses over time |
| Mint count | Bounded by `max_mints` | Governed by progression parameters |
| Supply cap | Always computable | Only if a global maximum is configured |

## The display rule

If the deployment configures a global maximum, publish it. If it does not, publish
"no configured maximum" rather than computing a number as if the deployment were fixed.

A user interface that prints an invented cap misleads every claimant who reads it.

## Check before signing

- Perpetual mode is active on this network at this height.
- The progression parameters produce a cost curve you actually want.
- You know whether a global maximum is configured, and you will publish that honestly.
- The ticker string is exactly right.

## After broadcast

1. Confirm and wait for indexing.
2. Read the deployment back and confirm the mode is recorded as perpetual.
3. Read the current Bitwork requirement and note that it will change.
4. Publish the resolved Atomical ID and the current requirement, with the height you read it at.

## For claimants

Read the requirement at the height you are targeting, not from a cached page. A claim built
against a stale requirement fails and still costs a fee.

## Source

[Perpetual DFT](/protocol/arc20/perpetual-dft/).

