# Decentralised mint claims

What makes a dmt claim valid, why a confirmed claim can still be worthless, and what a minter should check first.

Page ID: protocol/arc20/decentralized-mint
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/decentralized-mint/

---
A claim is the `dmt` operation. It mints exactly the deployment's `mint_amount` into output zero,
if every condition is satisfied.

## The reference command

```text
yarn cli mint-dft <ticker>
```

Options from the generated inventory include `--current`, `--initialowner`, `--funding`,
`--satsbyte`, `--rbf`, `--disablechalk`. See the [CLI reference](/reference/cli/#mint-dft).

## Conditions for a valid claim

1. The claim occurs at or after the deployment's `mint_height`.
2. The relevant commit and activation constraints are satisfied.
3. The configured mint quota is not already exhausted.
4. Any `mint_bitworkc` or `mint_bitworkr` requirement is met.
5. Output zero carries exactly `mint_amount` satoshis.

Condition five is exact. Not at least, not approximately. Exactly.

## Why a confirmed claim can be worthless

Conditions one, three, and four are evaluated by the validator, not by Bitcoin. A claim that
misses any of them still produces a confirmed Bitcoin transaction that cost a fee and minted
nothing.

The most common case is condition three. In a contested mint, many claimants broadcast at once and
the quota fills. Every claim after the last valid one is a confirmed transaction with no units.

## What a minter should check first

| Check | Why |
| --- | --- |
| The ticker resolves to a verified winner | Otherwise you are minting against a candidate |
| The deployment's Atomical ID | Names can be confusable. IDs are not |
| Claims already made against the quota | To know whether any remain |
| The exact `mint_amount` | Your output zero must match it exactly |
| The Bitwork requirement | It comes from the deployment, not from you |
| Current fee rates | Contested mints get expensive |

## What a product must display

- The resolved Atomical ID next to the ticker.
- Claims made against the maximum, with the height the figure was computed at.
- The exact amount output zero will carry.
- The Bitwork requirement, if any.
- A clear statement that a confirmed transaction is not a successful mint.

## After the claim

Wait for confirmation, then for the index to reach that height, then read the result. A claim that
looks successful in a mempool view can still lose the quota race.
See [confirmation and reorgs](/protocol/core/confirmation-and-reorgs/).
