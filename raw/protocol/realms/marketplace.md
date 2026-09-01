# Realm marketplace behavior

What the Marketplace authority checks for Realm and Subrealm listings, and why names have an extra verification step.

Page ID: protocol/realms/marketplace
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/realms/marketplace/

---
Realms and Subrealms have their own Marketplace lanes, separate from the generic NFT lane. They
carry one extra check that the other lanes do not.

## The extra step

Before every mutation, the Realm and Subrealm lanes resolve the verified name winner. That is not
the same as confirming the seller controls an Atomical. It confirms the Atomical they control is
the one that currently holds the name.

Why it matters: a name can move between Atomicals through candidate resolution. Selling an
Atomical that used to hold a name is not selling the name.

## What must agree before collateral is accepted

- The name resolves to a verified winner, and that winner is the offered Atomical.
- Bitcoin Core reports a confirmed, live output with the exact value and owner script.
- The Atomicals provider reports exactly that location, script, and value.
- Heights and hashes on both sides stay unchanged across the verification bracket.

Any disagreement, or any movement mid-check, fails the request closed.

## Always rejected

Mixed collateral, spent outputs, checkpoint drift, ambiguous balances, Atomicals operations
inside the settlement transaction, burns, and output assignments that do not move the exact
selected Atomical.

## `quantityAtomic`

Always `1` for Realm and Subrealm lanes. A name is indivisible.

## What a buyer should verify

1. The name, in exact bytes, and its normalised form.
2. Whether it is confusable with a name they already know.
3. The Atomical ID that currently holds it.
4. That the listing references that same Atomical ID.
5. After settlement, that the name still resolves to the Atomical they now control.

Step five matters because resolution is computed at a chain position and can change.
See [Marketplace v1](/reference/api/marketplace-v1/).
