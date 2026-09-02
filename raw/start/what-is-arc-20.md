# What is ARC-20?

The Atomicals fungible token model, where one unit is one coloured satoshi and transfers are an allocation problem rather than an account update.

Page ID: start/what-is-arc-20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/what-is-arc-20/

---
ARC-20 is the fungible token model inside Atomicals. Its rule is short:

> **One ARC-20 unit is one satoshi in a Bitcoin output that a validator recognises as coloured.**

That single sentence decides everything else. Supply is measured in satoshis. A transfer is a
question about which outputs receive how much value. Value that cannot be placed is destroyed.

## Why this is not an account balance

In an account model a transfer subtracts from one row and adds to another, and the transaction
either succeeds or fails. In ARC-20 the transaction succeeds on Bitcoin either way. What changes
is where the coloured value lands.

| Question | Account model | ARC-20 |
| --- | --- | --- |
| Where is the balance? | A row in a ledger | Spread across your unspent outputs |
| What is a transfer? | Debit and credit | Assigning input value to outputs in order |
| Can value vanish? | No | Yes. Unplaceable value is burned |
| Who decides the result? | The contract | The validator revision your indexer runs |
| Does confirmation mean success? | Yes | No. Confirmation and allocation are separate answers |

If the next eligible output is larger than the coloured value still to place, that value is not
carried forward. It is burned. This is not an error state on Bitcoin: the transaction confirms
normally. Read [burns](/protocol/arc20/burns/) before moving anything.

## The three ways units come into existence

| Mode | Operation | Shape |
| --- | --- | --- |
| Direct issuance | `ft` | The entire supply lands in output zero of one transaction |
| Fixed decentralised | `dft` then `dmt` | A deployment sets the rules, then claimants mint a fixed amount each |
| Perpetual decentralised | `dft` with perpetual parameters | Activation gated, with progressing Bitwork and an optional global cap |

See [direct issuance](/protocol/arc20/direct-issuance/),
[fixed DFT](/protocol/arc20/fixed-dft/), and
[perpetual DFT](/protocol/arc20/perpetual-dft/).

## What a ticker does and does not mean

A ticker is a globally allocated name. Winning it means the Atomicals rules resolved a candidate
into a verified winner. It does not mean:

- the project is who it says it is;
- the metadata is accurate;
- the image belongs to the minter;
- anyone stands behind the supply.

Always store and display the resolved **Atomical ID** next to any ticker.
See [tickers and candidates](/protocol/arc20/tickers-and-candidates/).

## Decimals do not create fractions

`decimals` is presentation metadata. It changes how a wallet formats a number on screen. It never
creates sub-satoshi units. Native ARC-20 quantities are integers, always.
See [metadata and decimals](/protocol/arc20/metadata-and-decimals/).
