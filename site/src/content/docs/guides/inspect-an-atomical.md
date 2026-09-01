---
title: Inspect an Atomical
description: Read identity, location, history, and sealed state, and know which of the four you are actually looking at.
sidebar:
  order: 7
provenance:
  pageId: guides/inspect-an-atomical
  area: guides
  audience: [everyone, holder, developer]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals-nfts-and-realms
      path: server
    - id: atomicals-js-cli
      path: commandIndex
  verified: '2026-08-31'
  tags: [inspection, nft]
---

## Before you start

- Supported networks: mainnet.
- Status: Universe implementation for the read model, protocol behavior for the underlying facts.
- Read only.

## What you need

The Atomical ID, in the form `<txid>i<index>`. If you only have a name, resolve it first.
See [inspect a ticker](/guides/inspect-a-ticker/).

## The procedure

1. Read the asset by Atomical ID.
2. Confirm the type and subtype. A plain NFT, a Realm, a Subrealm, a Container, and a DMINT item
   are different things.
3. Read the current location and owner script.
4. Read the history. Look at what changed and when, not only at the current state.
5. Check the sealed flag. Unsealed state can change.
6. Read the metadata, and treat every field as unverified.
7. Record the generation identifier and indexed height.

## Reference CLI equivalents

| Command | Reads |
| --- | --- |
| `get` | The Atomical |
| `location` | Current location |
| `state` and `state-history` | State, now and over time |
| `tx-history` | Transaction history |
| `at-location` | What is at an outpoint |
| `ftinfo` | Fungible token details |

See the [CLI reference](/reference/cli/).

## What to be careful about

- **The number is not the identity.** Key on the Atomical ID.
- **Metadata proves nothing.** See [metadata trust](/protocol/core/metadata-trust/).
- **A media file is hostile input.** Do not render it in a trusted context.
- **A name in the payload is not the name it won.** Resolve names separately.

## After

If you are about to act on what you read, re-read at a current generation immediately before
acting. A location read minutes ago can be stale.

## Source

[Atomicals digital objects](/protocol/core/digital-objects/) and
[NFT and Realm API](/reference/api/atomicals-nfts-realms/).

