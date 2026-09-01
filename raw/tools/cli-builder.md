# CLI command builder

Build a validated, copyable command from the pinned command inventory, with the safety implications shown.

Page ID: tools/cli-builder
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet, testnet, regtest
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/cli-builder/

---
## Why the combinations are constrained

The builder is generated from the same inventory as the [CLI reference](/reference/cli/). It
cannot offer a flag the pinned revision does not declare, which removes a whole category of
mistake: building a command against a flag you read somewhere that the revision you run does not
have.

The builder produces a string. Running it is your decision, and a build command spends outputs.
Model the allocation first with the [allocation visualizer](/tools/allocation-visualizer/).

## The flags marked with a star

Options that change what is spent or where a result lands are marked. Check each one twice:

| Flag | What it changes |
| --- | --- |
| `--funding` | Which wallet pays. Keep it cardinal |
| `--owner` | Whose outputs are spent. This is where an asset moves from |
| `--initialowner` | Where a newly minted object lands |
| `--satsoutput` | The satoshi value of the output carrying the result |
| `--satsbyte` | The fee rate. Recompute after any grind |
| `--rbf` | Signals replaceability. A replacement is a different transaction with a different allocation |

## Before you run anything

1. Confirm you are on the network you think you are.
2. Confirm the funding input is cardinal.
3. Confirm the output value is above the relay dust threshold.
4. For a mint, confirm the deployment reads back the way you expect.
5. For a transfer, model the allocation and confirm the burn figure is zero.
