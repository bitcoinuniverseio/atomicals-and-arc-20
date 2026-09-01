# Resolve Unicode names

Normalise, compare, and detect confusable names before you act on one.

Page ID: guides/resolve-unicode-names
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/resolve-unicode-names/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior for the rules, Universe implementation for the resolution service.
- Do this before paying to any name.

## The procedure

1. Take the exact bytes of the name, not a rendering of it.
2. Normalise it for comparison. Keep the original bytes separately.
3. Resolve the normalised form to an Atomical ID.
4. Read that Atomical's current location and owner script.
5. Compare the name against names you already use. Look for mixed scripts and confusable
   characters.
6. Display the resolved address to whoever is about to act, and get their confirmation.

## Three forms, three uses

| Form | Use |
| --- | --- |
| Exact minted bytes | Identity, storage, and what the validator saw |
| Normalised form | Comparison, deduplication, confusable detection |
| Display form | What a reader sees, escaped and marked when risky |

Never store only the normalised form, and never display it as if it were the name.

## Warning signs

- The name mixes scripts, for example Latin and Cyrillic characters in one word.
- The name uses combining marks where a precomposed character is usual.
- The name contains bidirectional control characters.
- The name is one character different from one you already trust.
- The name arrived in a message rather than from a source you control.

## If validation fails

A rejected name should tell you which character and which rule. The Universe read model surfaces
Unicode and IDNA errors explicitly rather than returning a generic failure, so read the error
rather than guessing.

## Source

[Unicode, IDNA, and confusable names](/protocol/realms/unicode-and-idna/) and
[Paynames](/protocol/realms/paynames/).
