# Atomicals CLI reference

Every command in the reference CLI, generated from the pinned source so the inventory cannot drift.

Page ID: reference/cli
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet, testnet, regtest
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/cli/

---
Any command that builds a transaction can spend outputs. Commands with `--funding` draw from a
funding wallet, and commands with `--owner` spend the owner's outputs. Before running anything
that moves an asset, model the allocation first with the
[allocation visualizer](/tools/allocation-visualizer/).

## How to read this page

- **Usage** shows the argument shape parsed from the source, not from a written example.
- **Options** are the flags declared on that command. A flag absent here is not accepted.
- **Defaults** are recorded only where the source declares one.

Common options and what they affect:

| Option | Effect |
| --- | --- |
| `--satsbyte` | Fee rate. Recompute after any Bitwork grind, which changes the transaction |
| `--funding` | The wallet that pays. Keep it cardinal |
| `--owner` | The wallet whose outputs are spent. This is where an asset moves from |
| `--initialowner` | Where a newly minted object lands |
| `--satsoutput` | The satoshi value of the output carrying the result. Keep it above the dust threshold |
| `--bitworkc`, `--bitworkr` | Work required on your own commit and reveal transaction ids |
| `--mintbitworkr` | Work a deployment requires of its claimants |
| `--parent`, `--parentowner` | Parent linkage, set once at mint |
| `--rbf` | Signals replaceability. A replacement is a different transaction with a different allocation |
| `--disablechalk` | Turns off the progress display during grinding |

## Safety notes that apply to every command

1. No command needs a seed phrase typed into a prompt from a web page. Manage wallets locally.
2. A confirmed Bitcoin transaction is not a successful Atomicals operation.
   See [commit and reveal](/protocol/core/commit-and-reveal/).
3. Grinding changes the transaction, so any fee estimate taken before the grind is stale.
4. Read commands are safe. Build commands are not.

## Commands
