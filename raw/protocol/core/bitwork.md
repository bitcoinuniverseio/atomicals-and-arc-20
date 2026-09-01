# Bitwork

The proof of work prefix requirement that gates Atomicals mints, what it costs, and what it does not promise.

Page ID: protocol/core/bitwork
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/bitwork/

---
Bitwork requires a transaction id to begin with a chosen prefix. Because a transaction id is a
hash, the only way to satisfy it is to change the transaction and hash again until the prefix
appears.

## Where it applies

| Requirement | Applies to |
| --- | --- |
| `bitworkc` | The commit transaction id |
| `bitworkr` | The reveal transaction id |
| `mint_bitworkc` | The commit transaction id of every claim against a deployment |
| `mint_bitworkr` | The reveal transaction id of every claim against a deployment |

A deployment can require Bitwork from its claimants even when the deployment itself required
little. Read the deployment, not the deployer's transaction.

## What it costs

Each additional hexadecimal character of prefix multiplies the expected attempts by sixteen.

| Prefix length | Expected attempts |
| --- | --- |
| 2 | about 256 |
| 3 | about 4 096 |
| 4 | about 65 536 |
| 5 | about 1 048 576 |
| 6 | about 16 777 216 |
| 7 | about 268 435 456 |

These are expectations, not schedules. Attempts are independent, so a run can finish far under or
far over the expected count.

It does not make a mint fair, does not prove identity, does not reserve a name, and does not
guarantee inclusion. It raises the cost of spam. That is all it claims to do.

## Extensions

Some configurations allow a partial next character, which sits between two whole-character
levels in difficulty. Perpetual deployments progress their requirement over time. Read the exact
deployment parameters rather than assuming a fixed level.
See [perpetual DFT](/protocol/arc20/perpetual-dft/).

## Practical notes

- Grinding changes the transaction, so any fee estimate must be recomputed after a successful
  grind.
- Grinding the commit and the reveal are two separate searches.
- The reference CLI exposes `--bitworkc`, `--bitworkr`, `--mintbitworkr`, and `--disablechalk` on
  the relevant commands. See the [CLI reference](/reference/cli/).
