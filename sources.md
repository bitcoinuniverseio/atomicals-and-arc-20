# Atomicals + ARC-20 source ledger

Reviewed: 2026-07-18

This ledger distinguishes explanatory documentation from behavior that is validated in code. It is intentionally specific because ARC-20 transaction allocation and DFT rules are version-sensitive.

## Authority model

1. The [Atomicals specification guide](https://atomicals-community.github.io/atomicals-guide/reference-and-tools/specification.html) states that the protocol specification is defined in code.
2. The [Atomicals ARC-20 guide](https://atomicals-community.github.io/atomicals-guide/arc20-tokens/) explains issuance modes, ticker claim timing, CLI forms, and metadata conventions.
3. The selected Atomicals validator or indexer implementation determines the exact behavior applied to a transaction.
4. This independent documentation summarizes and scopes these materials. It does not replace them.

## Pinned implementation baseline

The code-specific statements in this documentation are tied to Atomicals ElectrumX commit [`8df23747835c20230fc8b8097d469e7a1d97c3e0`](https://github.com/atomicals/atomicals-electrumx/commit/8df23747835c20230fc8b8097d469e7a1d97c3e0), released as v1.5.2.0 on 2025-03-27.

## Visual asset provenance

The site includes `assets/atomicals-cli-lockup.jpg`, an unchanged copy of [`atomicals.jpg`](https://github.com/atomicals/atomicals-js/blob/1333565efbfe5ca4bdb8443a94d72e9f8534c2c4/atomicals.jpg) from the Atomicals CLI repository at commit [`1333565efbfe5ca4bdb8443a94d72e9f8534c2c4`](https://github.com/atomicals/atomicals-js/commit/1333565efbfe5ca4bdb8443a94d72e9f8534c2c4). The repository declares an [MIT License](https://github.com/atomicals/atomicals-js/blob/1333565efbfe5ca4bdb8443a94d72e9f8534c2c4/LICENSE), but no separate logo-use policy or canonical color palette was located during review.

The black and white treatment in the site follows the source asset. The rust accent is a documentation interface color, not an asserted Atomicals brand color. The asset and visual treatment do not imply official status, endorsement, affiliation, or a trademark license.

| Source | Why it is used |
| --- | --- |
| [Atomicals protocol guide](https://atomicals-community.github.io/atomicals-guide/) | Protocol overview, P2TR positioning, and distinction between fungible tokens, Realms, and Containers. |
| [Atomicals specification guide](https://atomicals-community.github.io/atomicals-guide/reference-and-tools/specification.html) | Commit-reveal envelope, `atom` marker, operation, CBOR payload, and code-defined-specification warning. |
| [ARC-20 guide](https://atomicals-community.github.io/atomicals-guide/arc20-tokens/) | Direct and decentralized mint overview, `mint-ft`, `init-dft`, `mint-dft`, three-confirmation ticker claim statement, Bitwork overview, and metadata example. |
| [Atomicals JavaScript CLI](https://github.com/atomicals/atomicals-js) | Reference CLI and practical command surface. |
| [Pinned Atomicals CLI visual asset](https://github.com/atomicals/atomicals-js/blob/1333565efbfe5ca4bdb8443a94d72e9f8534c2c4/atomicals.jpg) | Unchanged source-pinned lockup used in the site shell with provenance and independence notice. |
| [Pinned mint parser](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/lib/util_atomicals.py#L459-L932) | Direct FT and DFT parser rules, tickers, mint fields, operation classification, and perpetual DFT behavior. |
| [Pinned ticker and operation helpers](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/lib/util_atomicals.py#L997-L1004) | Current ticker regular expression at the pinned revision. |
| [Pinned DFT mint validation](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/server/block_processor.py#L3244-L3488) | DFT mint timing, output 0 amount, and deployment validation behavior. |
| [Pinned normal FT allocation](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/lib/atomicals_blueprint_builder.py#L643-L718) | Normal allocation order and coloring behavior. |
| [Pinned split and no-inflation checks](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/lib/atomicals_blueprint_builder.py#L902-L946) | FT split behavior and related allocation mechanics. |
| [Pinned allocation validation](https://github.com/atomicals/atomicals-electrumx/blob/8df23747835c20230fc8b8097d469e7a1d97c3e0/electrumx/lib/atomicals_blueprint_builder.py#L1052-L1074) | No-inflation validation. |
| [Bitwork guide](https://atomicals-community.github.io/atomicals-guide/bitwork-mining.html) | Bitwork terminology and purpose. |
| [ElectrumX releases](https://github.com/atomicals/atomicals-electrumx/releases) | Release and activation changes to review before relying on behavior. |

## How to update this documentation

When updating source-dependent text:

1. Select and record an ElectrumX release or commit.
2. Check the active network and activation conditions relevant to the behavior.
3. Re-run behavioral test vectors for direct FT, fixed DFT, DMT, normal allocation, burn handling, split, and custom coloring as applicable.
4. Update `specification.md`, `reference.html`, `guide.html`, `llms.txt`, and this ledger together.
5. Do not turn a metadata convention, third-party product feature, or inactive code path into a protocol-wide claim.

## Universe repository sources

The current product-scope notes in [guide.html](guide.html) are based on the repository's ARC-20 controller, service, monitor, frontend view, and configuration. They document the current repository behavior, not a public API stability promise.

## Out of scope

- Price, market-cap, liquidity, legal, tax, and investment claims.
- Third-party wallet, marketplace, or indexer endorsements.
- A canonical standalone ARC-721 standard. No official source was found that establishes one in the Atomicals materials reviewed for this documentation.
