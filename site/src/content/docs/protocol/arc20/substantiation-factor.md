---
title: Substantiation Factor
description: What this material is, what status it has, and what evidence would be required before any of it could be presented as behavior.
sidebar:
  order: 16
provenance:
  pageId: protocol/arc20/substantiation-factor
  area: protocol
  audience: [everyone, developer]
  applicability: proposed
  authority: none
  networks: [mainnet]
  verified: '2026-08-31'
  tags: [status, proposals]
  limitations:
    - No applicable source revision or conformance suite was located that establishes Substantiation Factor as implemented behavior. This page therefore states status only.
---

import { Aside } from '@astrojs/starlight/components'

<Aside type="caution" title="Preliminary material">
Substantiation Factor material is preliminary. Nothing about it is protocol behavior, Universe
implementation, or a supported product capability at the verified date on this page.
</Aside>

## What status means here

This documentation labels a capability by evidence, not by intent. To move Substantiation Factor
material out of `Proposed`, all of the following would be required:

1. An applicable source revision that implements it, pinned by commit or release.
2. A statement of which networks and activation conditions apply.
3. Deterministic conformance vectors that execute against that revision.
4. A record of what the vectors prove and what they do not.
5. Either a Universe implementation revision that exposes it, or an explicit statement that no
   product surface does.

None of those exist at the verified date.

## What must not be claimed in the meantime

- That units are backed, collateralised, redeemable, or price supported.
- That any substantiation figure is computed from chain data by a Universe service.
- That a product feature depends on it.
- That an integration should read a field for it.

If you encounter material presenting Substantiation Factor as live behavior, treat it as
unverified and report it as an
[incorrect protocol claim](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/issues).

## What ARC-20 actually is

One coloured satoshi is one unit. Supply is bitcoin you committed. Nothing else is created by
minting. See [the unit model](/protocol/arc20/unit-model/).
