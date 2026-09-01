---
title: Paynames
description: Using a Realm as a payment destination, what resolution guarantees, and the checks a payer must run first.
sidebar:
  order: 3
provenance:
  pageId: protocol/realms/paynames
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: realmValidation
  verified: '2026-08-31'
  tags: [paynames, names, safety]
  limitations:
    - Resolution is computed at a chain position and by one implementation. A payer who resolves once and caches the answer can pay the wrong destination later.
---

import { Aside } from '@astrojs/starlight/components'

A Payname is a Realm used as a payment destination. Instead of a raw address, a payer uses a name
that resolves to one.

## What resolution guarantees

That, at the height and generation the answer was computed, this name resolved to this Atomical,
whose current location is this output, whose owner script is this.

That is a chain of four facts. Every one of them can change.

<Aside type="danger" title="A name is not an address">
The output that carries a Realm can move at any time, and the owner script changes with it.
Resolve immediately before paying, at a current generation, and show the payer the resolved
address before they confirm.
</Aside>

## Checks a payer must run

1. Resolve the name to an Atomical ID.
2. Read the Atomical's current location and owner script.
3. Confirm the resolution generation is current, not cached.
4. Display the resolved address to the payer for confirmation.
5. Check the name for confusable characters against names the payer has used before.
6. For a significant amount, resolve through a second compatible source and compare.

Step four is not optional. A payer who never sees the address cannot detect a wrong resolution.

## Confusable names

Two names can render identically and be different strings. A payer who copies a name from a
message may be copying a lookalike.

See [Unicode and IDNA](/protocol/realms/unicode-and-idna/) for the normalisation rules and the
warnings a product must show.

## What a product must never do

- Never resolve once at page load and pay later from the cached answer.
- Never hide the resolved address behind the name.
- Never treat a name as proof of who the recipient is.
- Never auto-fill a payment from a name found in untrusted content.

