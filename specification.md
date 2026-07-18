# ARC-20 compatibility specification

Status: secondary implementation guide

Reviewed: 2026-07-18

Reference behavior pin: Atomicals ElectrumX commit [`8df23747835c20230fc8b8097d469e7a1d97c3e0`](https://github.com/atomicals/atomicals-electrumx/commit/8df23747835c20230fc8b8097d469e7a1d97c3e0)

## 1. Scope and authority

This document describes the Atomicals ARC-20 fungible-token model on Bitcoin. It is a compatibility guide for wallets, indexers, transaction builders, and product teams. It is not an independent consensus specification, a smart-contract specification, or a financial statement.

The Atomicals [specification guide](https://atomicals-community.github.io/atomicals-guide/reference-and-tools/specification.html) says the specification is defined in code. Therefore:

- The guide explains concepts and command-line usage.
- The selected validator or indexer implementation determines version-sensitive transaction behavior.
- A production integration MUST pin a code revision or released version and its activation configuration.
- A production integration MUST NOT infer token validity or ownership from a ticker, image, metadata object, portfolio label, or generic Bitcoin confirmation alone.

This document covers ARC-20 fungible tokens only. Realms and Containers are Atomicals NFT and name or collection primitives. This document does not establish an ARC-721 standard.

## 2. Terms

| Term | Meaning |
| --- | --- |
| Atomical | An Atomicals digital object with an Atomical ID and protocol history. |
| Atomical ID | Transaction-based identifier: `<txid>i<output-index>`. Use it as the durable asset identity. |
| Ticker | A globally allocated ARC-20 name under Atomicals rules. The guide says a ticker is claimed after three confirmations. It is not proof of creator identity. |
| ARC-20 unit | One colored satoshi. ARC-20 native quantities are integer units. |
| Colored UTXO | A Bitcoin output recognized by the Atomicals rules as carrying an ARC-20 quantity. |
| Cardinal UTXO | Ordinary BTC selected for fees or non-ARC-20 value. It must be kept distinct from protected colored inputs. |
| Direct FT | A one-step `ft` mint that puts the complete supply in output 0. |
| Fixed DFT | A `dft` deployment followed by bounded `dmt` claims. |
| Perpetual DFT | A separate, activation-gated decentralized-mint configuration with dynamic rules and optional global cap. |
| Allocation | The validator's interpretation of which output receives each input's colored quantity. |

## 3. Atomicals envelope

Mint and update workflows use Taproot commit and reveal mechanics. The guide presents a non-executed witness-script envelope of the following form:

```text
OP_FALSE
OP_IF
  "atom"
  <operation>
  <CBOR payload>
OP_ENDIF
```

The operation and CBOR payload are validated in context. A builder MUST generate the exact envelope expected by its pinned implementation. A JSON object displayed in a UI is not itself an ARC-20 wire format.

## 4. Identity and ticker handling

An integration MUST retain the Atomical ID next to any ticker shown to a user. It SHOULD also record the source transaction, mint mode, source indexer, and validation version.

The pinned validator currently accepts direct-FT tickers matching lowercase `[a-z0-9]{1,21}`. This is a source-revision fact, not a promise that all historical or future validators use the same rule. A builder MUST validate names against the exact active target rather than hardcoding a display-only rule.

Ticker availability is not a branding or project-authentication service. A client MUST show users the resolved Atomical ID and SHOULD warn when visual metadata, source history, or mint configuration does not match the user's intended asset.

## 5. Issuance

### 5.1 Direct FT

The Atomicals guide gives the reference CLI form:

```text
yarn cli mint-ft <tick> <total_supply> metadata.json
```

Direct FT is the `ft` operation. Under the pinned validator, its full supply is the satoshi value of output 0. Because one token unit maps to one satoshi, a direct mint of 100,000,000 units requires a 100,000,000-satoshi output.

An application MUST NOT describe direct mint as collateral, a redemption mechanism, a price floor, or a stablecoin peg. It is a colored-satoshi issuance model.

### 5.2 Fixed DFT deployment

The Atomicals guide gives the reference CLI form:

```text
yarn cli init-dft <tick> <per_mint_amt> <mint_count> <start_height> metadata.json
```

Its nominal maximum issuance is:

```text
maximum issuance = mint_amount * max_mints
```

For the pinned implementation, a fixed DFT deployment requires an `args` object with the deployment ticker, mint height, mint amount, and maximum mint count. Current validation facts include:

| Field | Meaning | Pinned behavior |
| --- | --- | --- |
| `request_ticker` | Ticker request | Validated by the active ticker rule. |
| `mint_height` | Earliest block height for mint claims | Integer from 0 through 10,000,000 in the pinned code. |
| `mint_amount` | Units awarded by each valid DMT claim | 546 through 100,000,000 sats in the pinned code. |
| `max_mints` | Number of valid fixed-mint claims | At least 1. The maximum is activation-dependent. |
| `mint_bitworkc`, `mint_bitworkr` | Optional mint Bitwork rules | Must be evaluated by the active implementation. |

The current source has legacy and density-activation mint-count limits. An integration MUST NOT present a fixed deployment as valid without checking the target network's active rules.

### 5.3 DFT claim

The guide's claim form is:

```text
yarn cli mint-dft <tick>
```

The corresponding operation is `dmt`. Under the pinned validator, a valid claim:

- occurs no earlier than the deployment's mint height;
- satisfies the relevant commit and activation constraints;
- obeys the configured mint quota and any Bitwork requirement; and
- places exactly `mint_amount` satoshis in output 0.

A client MUST treat a DMT amount entry as derived from the deployment, not as a free-form transfer amount.

### 5.4 Perpetual DFT

Perpetual DFT is not merely fixed DFT with a large cap. The pinned implementation treats it as a separate, activation-gated mode with its own Bitwork-vector and progression parameters and an optional global maximum. A client MUST read the actual deployment and target version before calculating or displaying a supply cap.

## 6. Metadata

The ARC-20 guide states that metadata is an optional valid JSON object. Common fields include `name`, `desc`, `image`, `decimals`, `links`, and `legal`.

- Metadata MUST be treated as untrusted content.
- `decimals` is presentation metadata. It MUST NOT be used to create sub-satoshi ARC-20 units.
- URLs, image references, names, legal text, and social links MUST NOT establish authenticity, ownership, financial rights, or legal validity.
- Renderers SHOULD sanitize metadata and URLs before display.

## 7. Transfer allocation

ARC-20 transfer behavior is not an account debit plus credit. It is a transaction allocation problem.

For normal FT coloring in the pinned reference builder:

1. Eligible transaction outputs are considered in order.
2. An output receives a token's colored amount only while that output's whole BTC sat value fits in the remaining colored amount.
3. If the next eligible output is too large, the remaining colored amount is not automatically assigned to it.
4. A remainder that cannot be allocated is recorded as burned.
5. Colored output totals cannot exceed the corresponding colored input total.

Input order, output order, output sat values, unspendable outputs, the active activation set, and advanced operation payloads can all affect the outcome. A transfer builder MUST validate a concrete PSBT or transaction blueprint using the active Atomicals implementation before broadcast.

### 7.1 Behavioral test vectors

These test vectors describe normal allocation only. They omit fee inputs and output scripts for clarity.

| Case | Colored input | Outputs | Expected result under pinned normal allocation |
| --- | --- | --- | --- |
| Clean split | 1,200 sats / 1,200 units | output 0: 700 sats; output 1: 500 sats | 700 units then 500 units. No colored remainder. |
| Oversized next output | 1,200 sats / 1,200 units | output 0: 700 sats; output 1: 546 sats | output 0 receives 700 units. The remaining 500 units do not fit the 546-sat next output and are burned. |
| Inflation attempt | 1,000 colored units | Outputs request more than 1,000 colored units | Reject. Colored output total cannot exceed colored input total. |

### 7.2 Advanced operations

The pinned code recognizes `y` for FT split behavior. It also has activation-gated `z` custom coloring. These operations use implementation-specific payload rules and compact Atomical IDs. A product MUST NOT handcraft them from a UI amount field or assume they are universally active.

The `x` splat operation belongs to the NFT allocation branch in the pinned builder. It is not a generic ARC-20 transfer mechanism.

## 8. Security requirements

- A wallet MUST protect colored outpoints from automatic fee selection unless the user sees and approves the resulting allocation.
- A client MUST distinguish colored Atomicals inputs from cardinal fee inputs.
- A client MUST show output order, BTC value, expected colored value, recipient, retained value, and expected burns before signature.
- A client MUST verify the resulting Atomical allocation after broadcast and appropriate confirmations.
- A client SHOULD compare more than one compatible data source for high-value actions, while recognizing that source disagreement requires investigation rather than majority voting.
- A client MUST NOT request seed phrases, private keys, or wallet export files to verify ARC-20 state.

## 9. Universe compatibility boundary

The current Universe repository exposes DFT-oriented deploy and mint actions, not direct `mint-ft` issuance. Its visible transfer UI does not currently provide the colored outpoints required by the backend transfer builder, and the backend does not construct partial recipient allocations or colored change from a visible amount. Therefore:

- Universe direct FT issuance: not exposed.
- Universe visible ARC-20 transfer, partial transfer, split, and combine: do not use or document as supported.
- Universe discovery and portfolio: ElectrumX proxy-backed convenience views, not canonical proof.

See [guide.html](guide.html) for the audited product-scope matrix and operational details.

## 10. Source set

Read [sources.md](sources.md) before implementing any behavior in this document. It records the guide pages, CLI, exact pinned validator paths, and review boundary.
