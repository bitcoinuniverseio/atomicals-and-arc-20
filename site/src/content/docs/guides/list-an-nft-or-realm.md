---
title: List an NFT, Realm, or Subrealm
description: The same lifecycle as an ARC-20 lot, plus the extra name check the Realm lanes carry.
sidebar:
  order: 26
provenance:
  pageId: guides/list-an-nft-or-realm
  area: guides
  audience: [holder, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals
      path: marketplaceDocs
  verified: '2026-08-31'
  tags: [marketplace, listing, realms]
---

## Before you start

- Supported networks: mainnet.
- Status: Universe implementation. Action gates default to off.
- The asset must sit alone on its output. Mixed collateral is rejected.

## The lanes

| Lane | Accepts | Rejects |
| --- | --- | --- |
| `atomicals_nft` | A plain NFT by authoritative compact Atomical ID | Realm, Subrealm, FT, Container, and item subtypes |
| `realms` | A Realm | Anything that is not the verified name winner |
| `subrealms` | A Subrealm | Anything that is not the verified name winner |

`quantityAtomic` is always `1` for all three. A name and an object are indivisible.

## The extra check for names

Before every mutation, the Realm and Subrealm lanes resolve the verified name winner and confirm
the offered Atomical is that winner.

A name can move between Atomicals through candidate resolution, so an Atomical that used to hold a
name is not the name.

## The lifecycle

Identical to an ARC-20 lot: challenge, verify with BIP-322, prepare, sign, finalise. See
[list an ARC-20 lot](/guides/list-an-arc20-lot/).

## Before listing, separate the asset

If the output carries more than one Atomical, splat first. A mixed output cannot be listed.

```text
yarn cli splat <locationId>
```

See [splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).

## Check before signing

- The Atomical ID in the listing is the one you intend.
- For a name, the resolution currently points at that Atomical.
- The output carries nothing else.
- The price and exact payment script are correct.
- The signature scope binds the payment output exactly.

## After

Read the listing back. Re-check the name resolution before settlement, not only at listing time.

## Source

[NFT marketplace behavior](/protocol/nft/marketplace/) and
[Realm marketplace behavior](/protocol/realms/marketplace/).

