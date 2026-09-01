# ARC-20

The complete ARC-20 model in one page, from issuance through allocation to the safety boundary, with links to the exact rule for each part.

Page ID: protocol/arc20/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/overview/

---
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
