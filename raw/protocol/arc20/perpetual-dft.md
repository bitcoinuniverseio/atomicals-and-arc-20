# Perpetual DFT

A separate activation gated mode with progressing Bitwork and an optional global cap, and why it is not fixed DFT with a large number.

Page ID: protocol/arc20/perpetual-dft
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/perpetual-dft/

---
Perpetual DFT is not a fixed deployment with a very large `max_mints`. The pinned implementation
treats it as a separate, activation gated mode with its own parameters.

## What is different

| Aspect | Fixed DFT | Perpetual DFT |
| --- | --- | --- |
| Availability | Generally available | Activation gated |
| Bitwork | Set once by the deployment | Progresses through a vector over time |
| Mint count | Bounded by `max_mints` | Governed by progression parameters |
| Supply cap | `mint_amount * max_mints` | Optional global maximum, which may be absent |
| Display | A cap can be shown | A cap must not be invented |

## The reference command

```text
yarn cli init-dft-perpetual <ticker>
```

See the [CLI reference](/reference/cli/#init-dft-perpetual).

## The mistake to avoid

A user interface that reads perpetual parameters and prints a supply cap computed as if the
deployment were fixed will print a wrong number. It may print a number where none exists.

Read the actual deployment and the target implementation before calculating or displaying any
cap. When no global maximum is configured, say that plainly instead of showing a figure.

## Progressing Bitwork

The requirement changes as minting progresses, which means:

- a claimant's grinding cost is not constant;
- a claim built against a stale requirement fails;
- a product that caches the requirement will mislead its users.

Read the requirement at build time, for the height you are targeting.
See [Bitwork](/protocol/core/bitwork/).

## What a product must display

1. That the deployment is perpetual, labelled as such.
2. The current Bitwork requirement and when it was read.
3. The global maximum if one is configured, and a clear "no configured maximum" if not.
4. Issuance to date, computed from claim records.
5. The activation state of perpetual mode on the target network.
