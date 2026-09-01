---
title: DMINT
description: Decentralised item minting against a sealed manifest, how verification works, and every failure state a claimant can hit.
sidebar:
  order: 2
provenance:
  pageId: protocol/containers/dmint
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
  tags: [dmint, containers]
  limitations:
    - Manifest structure and rule evaluation are implementation specific. Build manifests with the reference tooling rather than by hand.
---

DMINT lets anyone mint an item into a Container, while the Container owner keeps control of what a
valid item is. The control comes from a manifest that is sealed before minting starts.

## The manifest

The manifest declares, per item, what a valid claim looks like. It is built from a folder of item
files with `prepare-dmint`, attached with `enable-dmint`, and then sealed.

What a manifest typically constrains:

| Constraint | Effect |
| --- | --- |
| The set of item identifiers | Only listed items can be claimed |
| A digest per item | The claimed content must match exactly |
| A mint height | Claims before it are invalid |
| A Bitwork requirement | Claimants must grind |
| Rules per item | Additional conditions, including payment |

## Why sealing comes first

An unsealed manifest can be edited. If items are minted against an editable manifest, the owner
can change what counts as valid after the fact. Verification then proves nothing.

Seal, publish the sealed manifest, then open minting. In that order.

## Claiming an item

```text
yarn cli mint-item <container> <itemId> <manifestFile>
```

The claimant supplies the item identifier and the manifest entry. A validator checks the claim
against the sealed manifest.

Verification with `validate-container-item` checks an item without minting. See the
[CLI reference](/reference/cli/).

## Payments

An item rule can require a payment. The payment is made in the same transaction, to the output the
rule specifies, and is checked as part of validity. A payment marker output identifies which claim
the payment belongs to.

A claim that meets every other condition but misses the payment is invalid, and the Bitcoin
transaction still confirmed and cost a fee.

## Failure states

| State | Cause | What a claimant sees |
| --- | --- | --- |
| Item not in the manifest | Wrong identifier | Confirmed transaction, invalid claim |
| Digest mismatch | Content differs from the manifest entry | Confirmed transaction, invalid claim |
| Before mint height | Claimed too early | Confirmed transaction, invalid claim |
| Bitwork not satisfied | Grinding incomplete or wrong target | Confirmed transaction, invalid claim |
| Payment missing or wrong | Rule not satisfied | Confirmed transaction, invalid claim |
| Already claimed | Someone else won the race | Confirmed transaction, invalid claim |
| Manifest not sealed | The collection is not trustworthy | Claim may succeed but proves little |

Every row costs a Bitcoin fee. Check before broadcasting, not after.

## For consumers

Do not display an item as a member of a collection unless it was verified against the sealed
manifest. Show the Container Atomical ID, the sealed state, and the verification result per item.

