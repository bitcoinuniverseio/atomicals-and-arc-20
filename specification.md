# ARC-20 compatibility specification

Status: compatibility guide, generated from the documentation content
Documentation version: 2026.08
Generated: 2026-08-31
Reference behavior pin: Atomicals ElectrumX commit 8df23747835c20230fc8b8097d469e7a1d97c3e0 (v1.5.2.0)

This file is generated from the pages listed below. It is never edited by hand, so it cannot
drift from the documentation it summarises.

Source pages:

- https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/overview/
- https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/unit-model/
- https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/allocation/
- https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/burns/

## 1. Scope and authority

This document describes the Atomicals ARC-20 fungible token model on Bitcoin. It is a
compatibility guide for wallets, indexers, transaction builders, and product teams. It is not an
independent consensus specification, a smart contract specification, or a financial statement.

The Atomicals specification is defined in code. Therefore:

- Concept documentation explains the model and command line usage.
- The selected validator or indexer implementation determines version-sensitive transaction
  behavior.
- A production integration MUST pin a code revision or released version and its activation
  configuration.
- A production integration MUST NOT infer token validity or ownership from a ticker, image,
  metadata object, portfolio label, or generic Bitcoin confirmation alone.

This document covers ARC-20 fungible tokens only. Realms and Containers are Atomicals NFT and name
or collection primitives. This document does not establish an ARC-721 standard, and no official
source located during review establishes one.

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

ARC-20 is the Atomicals fungible token model on Bitcoin. One unit is one coloured satoshi.
Everything else follows from that.

## The complete model in seven statements

1. A unit is a satoshi in an output a validator recognises as coloured for a token.
2. Supply is therefore measured in satoshis, and is bounded by real bitcoin.
3. Issuance happens once, directly, or repeatedly through a deployment others mint against.
4. A ticker is a globally allocated name resolved to exactly one Atomical.
5. A transfer is an allocation over the transaction's inputs and outputs, in order.
6. Value that cannot be placed in an eligible output is destroyed.
7. Coloured output totals can never exceed coloured input totals.

Read [burns](/protocol/arc20/burns/) before you build or sign anything.

## Where each rule is documented

| Area | Page |
| --- | --- |
| The unit model and why decimals do not create fractions | [Unit model](/protocol/arc20/unit-model/) |
| Ticker allocation, candidates, and verified winners | [Tickers and candidates](/protocol/arc20/tickers-and-candidates/) |
| One step issuance of a complete supply | [Direct issuance](/protocol/arc20/direct-issuance/) |
| Deployments with a fixed number of mints | [Fixed DFT](/protocol/arc20/fixed-dft/) |
| Claiming a mint against a deployment | [Decentralised mint](/protocol/arc20/decentralized-mint/) |
| Activation gated progressive deployments | [Perpetual DFT](/protocol/arc20/perpetual-dft/) |
| Work requirements on commit and reveal | [Bitwork requirements](/protocol/arc20/bitwork-requirements/) |
| Optional metadata and presentation decimals | [Metadata and decimals](/protocol/arc20/metadata-and-decimals/) |
| How value is placed into outputs | [Allocation](/protocol/arc20/allocation/) |
| Separating and recombining coloured lots | [Split and combine](/protocol/arc20/split-and-combine/) |
| How value is destroyed | [Burns](/protocol/arc20/burns/) |
| Moving tokens and swapping them atomically | [Transfers and swaps](/protocol/arc20/transfers-and-swaps/) |
| What a PSBT must contain | [PSBT requirements](/protocol/arc20/psbt-requirements/) |
| What a wallet must do to be safe | [Wallet safety](/protocol/arc20/wallet-safety/) |
| The status of Substantiation Factor material | [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

## What ARC-20 is not

- Not an ERC-20 contract. There is no contract and no account.
- Not an inscription balance. Value is the satoshi value of outputs, not a number written in text.
- Not a claim on anything. Nothing backs a unit unless a separate legal arrangement exists, and
  none is created by minting.
- Not an ARC-721 standard. No official source located during review establishes one.

## Universe product boundary

The protocol supports direct `mint-ft` issuance. No Universe product surface exposes it today.
Universe exposes verified ticker resolution, token details, holders, confirmed activity,
portfolio balances, coloured UTXOs, and Marketplace v1 flows.
See [status and known limitations](/start/status-and-limitations/).

Allocation is the single most important rule in ARC-20. It decides which output receives which
units, and what is destroyed.

## The rule

1. Collect the coloured value carried by the transaction's inputs, summed per token.
2. Order the tokens. FIFO ordering uses the first input index that carries each token, then the
   Atomical ID. Legacy ordering uses the Atomical ID alone.
3. For each token in that order, walk the outputs starting at the first slot not already used.
4. Skip provably unspendable outputs entirely. They consume nothing.
5. Assign an output **only if its whole satoshi value fits** in the value still to place.
6. If it fits, that output is coloured for its full satoshi value, and the remaining value drops
   by that amount.
7. If the next output does not fit, stop. Whatever is left is burned.
8. If any token could not be placed cleanly, the builder discards the sequential plan and restarts
   every token from output zero.
9. Coloured output totals can never exceed coloured input totals.

## What "fits" means, precisely

An output fits when `output.value <= remaining`. Nothing is ever partially filled under normal
allocation. An output either takes its full satoshi value in units, or it takes nothing.

Step seven is not an error path. The Bitcoin transaction is valid and confirms. See
[burns](/protocol/arc20/burns/).

## Executed vectors

Every row below is computed at build time by the same engine the conformance tests run. The
numbers on this page cannot drift from the vector set.

The vector set lives at `conformance/vectors/arc20-allocation.json` and its engine at
`conformance/allocation.mjs`. See [conformance](/reference/conformance/).

## The output zero fallback

Step eight surprises people. When the sequential plan cannot place a token cleanly, the reference
builder throws away the whole plan and restarts every token from output zero. With more than one
token in the transaction, that can move value you thought was settled and can burn a token that
would otherwise have been fine.

The `two-tokens-non-clean-fallback` vector above shows it. Build transactions that never trigger
it.

## No inflation

Coloured output totals can never exceed coloured input totals. A blueprint that tries is rejected.
This is the one rule that cannot be worked around by output arrangement.

## What changes the result

| Input | Effect |
| --- | --- |
| Coloured input value | The total to place |
| Input order | Token ordering under FIFO |
| Output order | Which slot is considered next |
| Output satoshi values | Whether each output fits |
| Unspendable outputs | Skipped, consuming nothing |
| Active rule set | Whether custom coloring applies |
| Number of distinct tokens | Whether the fallback can trigger |

A burn is coloured value that a validator could not place in any eligible output. It is recorded
as destroyed. The Bitcoin transaction that caused it is valid, mined, and confirmed.

Burned units do not go anywhere. There is no address that holds them and no procedure that
returns them. Prevention is the only control.

## The four shapes that cause a burn

### 1. The next output is too large

The most common. You have 500 units left to place and the next output is 546 satoshis. It does not
fit, so the 500 units are destroyed.

**Prevention.** Size the change output to exactly the remainder you intend to keep.

### 2. There are not enough outputs

Every output was covered and value is still left. Nothing remains to place it in.

**Prevention.** Always include a coloured change output when the inputs exceed what you are
sending.

### 3. The first output is larger than the whole lot

Nothing can be placed at all, so the entire lot burns.

**Prevention.** Never send a small coloured lot into a transaction whose first output is a large
cardinal payment.

### 4. The fallback rearranged a multi token transaction

One token could not be placed cleanly, so the builder restarted every token from output zero and a
different token lost its slot.

**Prevention.** Move one token per transaction unless you have modelled the multi token case.

## Executed cases

## The checks that prevent all four

1. Compute the expected assignment before signing, not after.
2. Confirm the burn figure is zero.
3. Size every coloured output deliberately, in satoshis.
4. Keep fee inputs cardinal and separate.
5. Move one token per transaction unless you have a reason not to.
6. Re-check after any change to the output set, including a wallet adding change.

Use the [allocation visualizer](/tools/allocation-visualizer/) to do steps one and two.

## Detecting a burn after the fact

A validator records burns per transaction. Read the transaction through a source that reports
them, and compare the coloured input total against the sum of coloured output totals. Any
difference is a burn.

The Universe ARC-20 activity feed publishes burn records among its confirmed activity. See
[ARC-20 API](/reference/api/arc20/).

## Behavioral test vectors

These vectors are executed by tests/conformance-allocation.test.mjs against
conformance/allocation.mjs, which is implemented from the pinned revision. They omit fee inputs and
output scripts for clarity, because neither changes the allocation result.

| Case | Coloured input | Outputs | Expected result |
| --- | --- | --- | --- |
| clean-split | 1200 units | output 0: 700 sats; output 1: 500 sats | Both outputs are exactly covered, so nothing is left to place and nothing burns. |
| oversized-next-output | 1200 units | output 0: 700 sats; output 1: 546 sats | Output zero takes 700. The next output is 546 satoshis, larger than the 500 units left, so the remainder is destroyed. |
| exact-single-output | 10000 units | output 0: 10000 sats | One output exactly equal to the coloured value takes everything. |
| first-output-too-large | 500 units | output 0: 20000 sats | Nothing can be placed at all, so the entire coloured value is destroyed. |
| too-few-outputs | 1200 units | output 0: 700 sats | Every output is covered but value is still left over, so the leftover burns. |
| unspendable-output-skipped | 1200 units | output 0: 0 sats (unspendable); output 1: 700 sats; output 2: 500 sats | A provably unspendable output is passed over and consumes no coloured value. |
| combine-two-lots | 700 units plus 500 units | output 0: 1200 sats | Two coloured inputs of the same token are summed before allocation and land in one output. |
| two-tokens-sequential-slots | 700 units plus 900 units | output 0: 700 sats; output 1: 900 sats | The first token fills the outputs it needs, then the next token starts after the last slot the first one used. |
| two-tokens-non-clean-fallback | 700 units plus 400 units | output 0: 700 sats; output 1: 546 sats | When the sequential assignment cannot be made cleanly, the reference builder restarts every token from output zero. Both tokens then contend for the same outputs and value burns. |
| dust-remainder-burns | 1200 units | output 0: 1000 sats; output 1: 200 sats | Sending 1000 units from a 1200 unit lot with a 200 satoshi change output fails, because 200 is placed only if it fits after the 1000 is taken. Here it does fit, so nothing burns. Compare with the next case. |
| change-output-too-large | 1200 units | output 0: 1000 sats; output 1: 546 sats | The same intent with a 546 satoshi change output destroys the 200 unit remainder, because 546 does not fit in 200. |
| custom-coloring-partial-fill | 1200 units | output 0: 700 sats; output 1: 546 sats | With custom coloring active the builder attaches an output even when the value does not cover it fully, and the last output receives only what is left. |

## Universe compatibility boundary

- Universe direct FT issuance: not exposed. The protocol supports it; no Universe product surface
  offers it.
- Universe ARC-20 discovery, token details, holders, confirmed activity, portfolio balances, and
  coloured UTXOs: available as read views, not as proof of settlement.
- Universe declared ARC-20 coverage: partial, for pending activity only.
- Universe Container and DMINT read projection: not exposed.
- Universe AVM execution: not exposed.

See https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/status-and-limitations/.

## Source set

Read /atomicals-and-arc-20/sources.md before implementing any behavior described here.
