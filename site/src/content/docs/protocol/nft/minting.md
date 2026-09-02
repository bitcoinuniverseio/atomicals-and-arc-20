---
title: Minting an NFT
description: What a mint payload contains, what output zero receives, and the decisions that cannot be changed later.
sidebar:
  order: 2
provenance:
  pageId: protocol/nft/minting
  area: protocol
  audience: [creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: atomicals-js-cli
      path: commandIndex
  verified: '2026-08-31'
  tags: [nft, minting]
---

Minting an NFT is a commit and reveal pair carrying an `nft` operation. The resulting object is
assigned to output zero of the reveal transaction.

## Reference commands

| Command | Use |
| --- | --- |
| `mint-nft <file>` | Mint from a file payload |
| `mint-nft-json <file>` | Mint from a JSON payload |
| `mint-realm <realm>` | Mint a top-level Realm |
| `mint-subrealm <realm>` | Mint a Subrealm |
| `mint-container <container>` | Mint a Container |
| `mint-item <container> <itemId> <manifestFile>` | Mint a DMINT item |

Exact signatures and options are in the generated [CLI reference](/reference/cli/).

## What output zero receives

The new Atomical, at the satoshi value you chose. Most commands accept `--satsoutput` to set it.
Choose deliberately:

- Too small and the output may be below the relay dust threshold for its script type.
- Too large and you have locked more bitcoin than you needed to.
- The value is not the asset. It is just the output that carries it.

## Decisions that cannot be changed later

| Decision | Why it is permanent |
| --- | --- |
| The Atomical ID | Assigned at mint, never reassigned |
| Embedded file bytes | They are in a block |
| The name requested | A different name means a different mint |
| Parent linkage | Set at mint through `--parent` and `--parentowner` |
| Sealing, once applied | There is no unseal |

Everything else is state, and state can change until sealed. See
[state and history](/protocol/core/state-and-history/).

## Cost

The reveal fee scales with the witness, which scales with your payload. Before grinding any
Bitwork, estimate the reveal size with the real payload bytes. A collection that embeds the same
shared asset in every item pays for it every time.
See [references and recursion](/protocol/core/references-and-recursion/).

## After the mint

1. Confirm on Bitcoin.
2. Wait for the index to reach that height.
3. Read the Atomical ID and confirm the subtype is what you expected.
4. For a name request, confirm it resolved rather than remaining a candidate.
5. Record the ID in your own records before doing anything else with it.

