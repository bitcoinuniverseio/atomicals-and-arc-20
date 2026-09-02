# Sealing and rules

What sealing changes, why rule evaluation must be deterministic, and the order of operations that makes a collection trustworthy.

Page ID: protocol/containers/sealing-and-rules
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/containers/sealing-and-rules/

---
## What sealing does

Sealing applies the `sl` operation. After it:

- state can no longer change;
- a Container manifest can no longer be edited;
- the object can still be transferred.

There is no unseal. Sealing the wrong manifest is permanent.

## The order that makes a collection trustworthy

1. Mint the Container and wait for its name to resolve.
2. Build the manifest from the final item set.
3. Verify the manifest locally against every item you intend to allow.
4. Attach it with `enable-dmint`.
5. Read it back from the chain and compare it to what you built.
6. Seal.
7. Publish the sealed manifest and the Container Atomical ID.
8. Open minting.

Step five is the one people skip. Read back what is actually on chain before making it permanent.

## Rule evaluation must be deterministic

Two implementations reading the same sealed manifest and the same claim must reach the same
answer. That means:

- no dependence on wall clock time;
- no dependence on the order results happen to arrive in;
- no dependence on a service that may be unavailable;
- bounded work per evaluation.

A rule that cannot be evaluated deterministically cannot be verified by an independent party,
which defeats the purpose of sealing it.

## Rules that involve payment

A payment rule names an output the claim must include. Evaluation checks the output exists, pays
the required amount, and carries the correct payment marker.

Because payment is part of validity, a claimant who pays the wrong amount or to the wrong script
has made an invalid claim and lost the fee.

## For Subrealms

The same rule machinery governs Subrealm claims under a parent Realm. See
[claims and rules](/protocol/realms/claims-and-rules/).
