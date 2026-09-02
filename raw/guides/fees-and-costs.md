# Fees and costs

Everything you actually pay for an Atomicals action, including the costs people forget until they have already spent them.

Page ID: guides/fees-and-costs
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/fees-and-costs/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior for the transaction costs, Universe implementation for marketplace
  fees.

## What you pay, by action

| Action | Costs |
| --- | --- |
| Ordinary transfer | One Bitcoin fee |
| Mint or deploy | Commit fee, reveal fee, and grinding time if Bitwork applies |
| DMT claim | Commit fee, reveal fee, grinding, and the mint amount locked in output zero |
| Splat | One Bitcoin fee plus a dust-safe value per separated output |
| Marketplace listing | Usually no Bitcoin transaction until settlement |
| Marketplace purchase | The price, the settlement transaction fee, and any disclosed marketplace fee |

## The costs people forget

**The reveal fee scales with your payload.** Embedding a large file makes the reveal transaction
large. Estimate the reveal size with the real bytes before grinding.

**Grinding invalidates your fee estimate.** A successful grind changed the transaction, so
recompute the fee afterwards.

**A failed mint still costs a fee.** A claim that misses the quota, the height, or the Bitwork
still produced a confirmed Bitcoin transaction. See
[decentralised mint claims](/protocol/arc20/decentralized-mint/).

**Locked value is not a fee, but it is money.** A DMT claim locks `mint_amount` satoshis in output
zero. That is the token, not a cost, but it leaves your spendable balance.

**Dust-safe outputs.** Every coloured output must be above the relay dust threshold for its script
type. Separating five Atomicals means five such outputs.

## Reducing cost

1. Reference shared bytes instead of embedding them again.
   See [references and recursion](/protocol/core/references-and-recursion/).
2. Store a compact source format rather than a large raster.
3. Choose a Bitwork prefix you can actually afford to grind.
   Use the [Bitwork estimator](/tools/bitwork-estimator/).
4. Act at a lower fee rate when the action is not time sensitive.
5. Avoid transactions that need to be rebuilt because a change output was the wrong size.

## Marketplace fees

Buyer and seller fees are deployment configuration. The flow you are using must disclose them
before you commit. If a flow does not show the fee breakdown before the final confirmation, stop.

## Source

[Bitwork](/protocol/core/bitwork/), [commit and reveal](/protocol/core/commit-and-reveal/), and
[Marketplace v1](/reference/api/marketplace-v1/).
