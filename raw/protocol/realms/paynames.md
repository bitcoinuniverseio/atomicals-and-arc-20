# Paynames

Using a Realm as a payment destination, what resolution guarantees, and the checks a payer must run first.

Page ID: protocol/realms/paynames
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/realms/paynames/

---
A Payname is a Realm used as a payment destination. Instead of a raw address, a payer uses a name
that resolves to one.

## What resolution guarantees

That, at the height and generation the answer was computed, this name resolved to this Atomical,
whose current location is this output, whose owner script is this.

That is a chain of four facts. Every one of them can change.

The output that carries a Realm can move at any time, and the owner script changes with it.
Resolve immediately before paying, at a current generation, and show the payer the resolved
address before they confirm.

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
