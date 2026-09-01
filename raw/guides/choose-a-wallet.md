# Choose a wallet

The capabilities that make a wallet safe for Atomicals, how to test for them in ten minutes, and what to do if yours fails.

Page ID: guides/choose-a-wallet
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/choose-a-wallet/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. These requirements come from how allocation works, not from any
  product.
- You do not need to move anything to run these tests.

## The capabilities that matter

| Capability | Why it matters | If missing |
| --- | --- | --- |
| Lists outpoints, not just address totals | You cannot reason about allocation without outpoints | Unusable for Atomicals |
| Marks coloured outputs per Atomical | So you know which outputs carry value | Unusable |
| Excludes coloured outputs from fee selection | Prevents the most common loss | Unusable |
| Shows expected units per output before signing | Lets you catch a burn before it happens | High risk |
| Shows the burn figure | Makes the failure visible | High risk |
| Preserves input and output order | Reordering changes the allocation result | High risk |
| Shows the signature hash flag | Lets you refuse an unexpected scope | Risky for swaps |
| Names its data source and freshness | Lets you judge how current the answer is | Inconvenient |

## The ten minute test

1. Ask the wallet to show your unspent outputs. If it only shows a balance, stop here.
2. Confirm it marks which outputs carry Atomicals, and which Atomical each carries.
3. Start a plain BTC send while holding coloured outputs. It should exclude them, or warn clearly.
4. Start an ARC-20 transfer. It should show, per output, the satoshi value and expected units.
5. Deliberately set a change output larger than the remainder. It should show a non-zero burn
   figure and require a second confirmation.
6. Cancel everything. You have not spent anything.

A wallet that fails step one or three is not suitable for holding Atomicals.

## Check before signing

Nothing here signs anything. If a wallet asks for a seed phrase, private key, or wallet export
file at any point in this test, stop and do not continue with that product.

## If it fails

Move the assets to a wallet that passes, using a transaction you modelled first with the
[allocation visualizer](/tools/allocation-visualizer/). Do the move from the safer side: build the
transaction in a tool you trust and sign it, rather than letting the unsafe wallet choose inputs.

## After

Keep a dedicated cardinal pool for fees.
See [prepare BTC and UTXOs](/guides/prepare-utxos/).

## Source

[Wallet safety](/protocol/arc20/wallet-safety/) and
[wallet integration](/reference/wallet-integration/). Product records with last-verified dates are
in the [ecosystem registry](/ecosystem/).
