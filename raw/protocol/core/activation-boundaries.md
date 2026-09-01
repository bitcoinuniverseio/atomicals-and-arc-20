# Activation boundaries

Why the same transaction can be valid at one height and invalid at another, and how to reason about rules that turn on.

Page ID: protocol/core/activation-boundaries
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet, testnet, signet, regtest
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/activation-boundaries/

---
Atomicals validation rules are not all active from genesis. The reference implementation defines
activation conditions per network, and a transaction is judged by the rules active at its own
height.

## The consequences

1. A historical transaction must be re-evaluated under historical rules, not today's rules.
2. A behavior you tested on regtest, where rules may be always-on, can differ on mainnet.
3. Two indexers at different revisions can disagree about an old transaction and both be
   internally consistent.
4. A feature that exists in code is not usable until its activation condition is met.

## Rules that are commonly activation sensitive

- Custom coloring with the `z` operation.
- Perpetual decentralised mint parameters.
- Mint count limits for fixed deployments, which have legacy and later variants.
- Payload and operation validation refinements.

This documentation marks activation-sensitive statements in the source panel under
**Activation boundary**.

## How to reason about it

| Question | Where the answer lives |
| --- | --- |
| Is this rule active on my network? | The coin definition in the validator revision |
| Was it active at this height? | The activation condition compared to the block height |
| Does my indexer implement it? | The indexer revision, not the protocol |
| Does my counterparty agree? | Their indexer revision, which you must ask for |

## What to record in your system

For every stored Atomicals result, keep:

- the validator revision that produced it;
- the network;
- the block height it was computed at;
- the generation identifier if your source publishes one.

Without those four, a disagreement later is unexplainable. See
[source of truth](/develop/source-of-truth/).
