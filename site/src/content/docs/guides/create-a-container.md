---
title: Create a Container
description: Mint a collection identity, confirm the name resolved, and prepare for item minting without locking in a mistake.
sidebar:
  order: 17
provenance:
  pageId: guides/create-a-container
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
  tags: [containers, collections]
  limitations:
    - No Universe read projection exposes Containers. Verification of your own collection uses the reference CLI or a compatible indexer.
---

## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. Not exposed by the Universe read projection.
- The Container name is a globally allocated name and follows the candidate model.

## The procedure

1. Choose the Container name. Check it is not confusable with an existing one.
2. Mint it:

   ```text
   yarn cli mint-container <container>
   ```

3. Confirm on Bitcoin, then wait for indexing.
4. Confirm the name resolved to **your** Atomical ID and is not still a candidate.
5. Record the Container Atomical ID. Publish that, not just the name.
6. Do not open item minting yet. First prepare and seal the manifest.
   See [create DMINT items](/guides/create-dmint-items/).

## Reading it back

| Command | Reads |
| --- | --- |
| `get-container` | The Container |
| `get-container-items` | Items claimed against it |
| `summary-containers` | An overview |
| `find-containers` | Discovery |

See the [CLI reference](/reference/cli/).

## Check before signing

- The name string is exactly what you intend.
- You are on the network you think you are.
- The funding input is cardinal.
- The metadata contains nothing you cannot stand behind permanently.

## If the name does not resolve to you

Another claim won it. Your Atomical exists but does not hold the name. Do not publish it as the
collection. Start again with a different name, or resolve the dispute before minting items.

## After

Publish the Container Atomical ID everywhere the name appears, so buyers can verify membership
rather than trusting a label.

## Source

[Containers](/protocol/containers/overview/) and
[candidates and winners](/protocol/core/candidates-and-winners/).

