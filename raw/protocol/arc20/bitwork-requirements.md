# ARC-20 Bitwork requirements

Which Bitwork fields apply to a deployment, which apply to its claimants, and how to read them correctly.

Page ID: protocol/arc20/bitwork-requirements
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/bitwork-requirements/

---
Four Bitwork fields appear around ARC-20. They apply to different transactions and different
people.

| Field | Applies to | Set by |
| --- | --- | --- |
| `bitworkc` | The deployer's own commit transaction | The deployer, per invocation |
| `bitworkr` | The deployer's own reveal transaction | The deployer, per invocation |
| `mint_bitworkc` | Every claimant's commit transaction | The deployment, for everyone |
| `mint_bitworkr` | Every claimant's reveal transaction | The deployment, for everyone |

The two `mint_` fields are the ones that matter to a minter. They come from the deployment and
apply to every claim, regardless of what the deployer paid for their own transactions.

## Reading them correctly

1. Read the deployment record, not the deployer's transaction.
2. For a perpetual deployment, read the current requirement rather than the initial one.
3. Apply the commit requirement to the commit transaction id and the reveal requirement to the
   reveal transaction id. They are separate searches.
4. Recompute your fee estimate after a successful grind, because grinding changed the transaction.

## Cost

Each extra hexadecimal character multiplies expected attempts by sixteen. See
[Bitwork](/protocol/core/bitwork/) for the table and the
[Bitwork estimator](/tools/bitwork-estimator/) to model a specific prefix.

## CLI options

From the generated inventory, the relevant flags are `--bitworkc`, `--bitworkr`, `--mintbitworkr`,
and `--disablechalk`. See the [CLI reference](/reference/cli/).

## What Bitwork does not do

It does not reserve the ticker, prove identity, guarantee your claim wins the quota race, or make
the mint fair. It raises the cost of spam.
