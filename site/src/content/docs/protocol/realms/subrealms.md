---
title: Subrealms
description: Child names claimed under a parent Realm's rules, how the parent controls them, and what a claimant must satisfy.
sidebar:
  order: 2
provenance:
  pageId: protocol/realms/subrealms
  area: protocol
  audience: [everyone, creator, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: realmValidation
    - id: atomicals-js-cli
      path: commandIndex
  verified: '2026-08-31'
  tags: [subrealms, names]
---

A Subrealm is a name under a parent Realm. The parent defines the rules; anyone who satisfies them
can claim a Subrealm.

## The parent controls the rules

Reference commands: `enable-subrealms`, `disable-subrealms`, `pending-subrealms`,
`mint-subrealm <realm>`, `summary-subrealms`. See the [CLI reference](/reference/cli/).

A parent can:

- enable or disable Subrealm claiming;
- define rules that a claim must satisfy;
- require a payment to a specified output;
- leave claiming open, subject only to name availability.

## Claiming

1. Read the parent's current rules, at a specific height.
2. Build a claim that satisfies them, including any payment.
3. Mint with `mint-subrealm`.
4. Wait for confirmation, then for resolution.
5. Confirm you are the verified winner, not a losing candidate.

A claim that misses a rule still produces a confirmed Bitcoin transaction and costs a fee.

## Payments

Where a rule requires payment, the payment output and its marker are part of validity. A payment
marker output identifies which claim the payment belongs to, so a validator can match them.

Paying the right amount to the wrong script, or omitting the marker, makes the claim invalid.

## Pending claims

A parent can inspect outstanding claims with `pending-subrealms`. A product showing Subrealms
should distinguish:

| State | Meaning |
| --- | --- |
| Pending | A claim exists and has not resolved |
| Verified winner | The rules awarded the name |
| Losing candidate | Another claim won |
| Rejected | A rule was not satisfied |

Showing a pending claim as owned is the failure to avoid.

## Hierarchy

Subrealms can nest. A hierarchy read should return the root, the path, and the direct children,
and should say when the child list was truncated rather than silently cutting it.

The Universe read model exposes hierarchy and direct Subrealm listing with an explicit truncation
flag. See [NFT and Realm API](/reference/api/atomicals-nfts-realms/).

