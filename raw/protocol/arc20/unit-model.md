# The unit model

One coloured satoshi is one unit, supply is measured in satoshis, and decimals are presentation only.

Page ID: protocol/arc20/unit-model
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/unit-model/

---
## The rule

One ARC-20 unit is one satoshi in an output a validator recognises as coloured for that token.
Native quantities are integers. There is no smaller division.

## What follows immediately

**Supply is satoshis.** A token with 100 000 000 units required 100 000 000 satoshis, which is one
bitcoin, to exist. Large supplies are expensive by construction.

**Dust limits apply.** An output that Bitcoin will not relay cannot carry units. In practice a
coloured output must be at or above the relay dust threshold for its script type.

**Balances are sums, not stored values.** A wallet total is the sum of the coloured outputs it can
spend. Nothing on chain stores that total.

**Spending is all or nothing per output.** There is no partial spend. Moving part of a lot means
building a transaction whose outputs receive the split you want.

## Worked numbers

| Deployment | Mint amount | Max mints | Nominal maximum issuance | Bitcoin required |
| --- | --- | --- | --- | --- |
| Small | 1 000 sats | 10 000 | 10 000 000 units | 0.1 BTC |
| Medium | 10 000 sats | 21 000 | 210 000 000 units | 2.1 BTC |
| Large | 100 000 sats | 21 000 | 2 100 000 000 units | 21 BTC |

Nominal maximum issuance is `mint_amount * max_mints`. It is a ceiling on what claims can produce,
not a promise that the ceiling is reached.

## Decimals

`decimals` is optional metadata that tells a wallet how to format a number for a reader. A token
with 100 000 units and `decimals` of 2 may be displayed as 1 000.00. The chain still holds
100 000 integer units in 100 000 coloured satoshis.

Never divide a native quantity by a power of ten before doing arithmetic on it, and never let a
formatted figure enter a transaction builder. See
[metadata and decimals](/protocol/arc20/metadata-and-decimals/).

## Dust and safety

A coloured output near the dust threshold is fragile. Any transfer that needs to leave a remainder
smaller than the threshold cannot place that remainder in a new output, so it burns.

Practical guidance:

- Keep lots at sizes that divide cleanly for the transfers you expect.
- Prefer a small number of larger lots over many dust-sized lots.
- Model any split before building it. See
  [allocation visualizer](/tools/allocation-visualizer/).
