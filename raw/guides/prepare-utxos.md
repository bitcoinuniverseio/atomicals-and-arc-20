# Prepare BTC and protected UTXOs

Build a cardinal pool for fees so a coloured output is never selected by accident, and size your lots for the transfers you expect.

Page ID: guides/prepare-utxos
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/prepare-utxos/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- You need a wallet that lists outpoints and can target a specific one.
  See [choose a wallet](/guides/choose-a-wallet/).

## What you need

- Ordinary bitcoin, in outputs that carry no Atomicals.
- A clear picture of which of your outputs are coloured.

## The procedure

1. List every unspent output and label each one coloured or cardinal.
2. If any output is unknown, treat it as coloured until a source confirms otherwise.
3. Create a cardinal pool: several ordinary outputs sized to cover a few transactions each at
   current fee rates.
4. Keep the pool separate. Do not let it be consolidated with coloured outputs.
5. Size your coloured lots for the transfers you expect. Several right-sized lots are safer than
   one large one.

## How many cardinal outputs

Enough that you never have to reach for a coloured one. A practical starting point is three to
five outputs, each covering a typical transaction fee with margin. Refill the pool before it runs
low, not during an urgent action.

## Cost

One ordinary transaction to create the pool. No Atomicals operation is involved, so no commit and
reveal pair, and no grinding.

## Check before signing

- Every input to the pool-building transaction is cardinal.
- No coloured output appears anywhere in the input list.
- The change output is cardinal.

## If it fails

If the wallet insists on selecting a coloured input, it cannot do this safely. Change wallet
first.

## After broadcast

Confirm the new outputs are cardinal in your data source before relying on them. A freshly created
output is cardinal by construction if all its inputs were cardinal.

## Source

[UTXO ownership and location](/protocol/core/utxo-ownership/) and
[the unit model](/protocol/arc20/unit-model/).
