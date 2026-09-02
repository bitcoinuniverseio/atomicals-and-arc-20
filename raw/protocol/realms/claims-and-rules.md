# Claims and rules

How a name claim is evaluated, how payments participate, and why deterministic rules are the whole point.

Page ID: protocol/realms/claims-and-rules
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/realms/claims-and-rules/

---
Name claims for Subrealms and Container items share the same shape: a parent publishes rules, a
claimant submits a claim, a validator evaluates the claim against the rules.

## The evaluation

1. Is the name available, or is there a competing candidate?
2. Does the claim satisfy every published rule?
3. Where a rule requires payment, is the payment present, correct, and correctly marked?
4. Where Bitwork is required, is it satisfied?
5. Was this claim the first valid one for the name?

A claim that fails any step is invalid. The Bitcoin transaction still confirmed.

## Payment markers

A payment output alone is not enough. A marker identifies which claim the payment belongs to, so a
validator can match payment to claim without guessing. The reference implementation recognises
markers for both Subrealm and DMINT item payments.

Consequences for a builder:

- The marker must be present and well formed.
- The payment must go to the exact output the rule specifies.
- The amount must be exact.
- All of it must be in the same transaction as the claim.

## Deterministic evaluation

Rules must evaluate the same way for every independent implementation. That rules out anything
that depends on wall clock time, arrival order, an external service, or unbounded work.

A rule that cannot be evaluated independently cannot be checked by a buyer, which removes the
reason to trust the name in the first place.

## Competing claims

When several valid claims arrive for the same name, the rules decide. A product must show the full
candidate set with heights rather than presenting one as settled.
See [candidates and winners](/protocol/core/candidates-and-winners/).

## After a reorg

Resolution is computed at a chain position. A reorg can change which claim was first, which
changes the winner. Re-resolve rather than trusting a cached result.
See [consistency and reorgs](/develop/consistency-and-reorgs/).
