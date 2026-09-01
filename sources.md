# Atomicals and ARC-20 source ledger

Documentation version: 2026.08
Generated: 2026-08-31
Last verified: 2026-08-31

This ledger is generated from contracts/source-manifest.json. It distinguishes explanatory
documentation from behavior that is validated in code, because ARC-20 transaction allocation and
deployment rules are version sensitive.

## Authority model

1. Executed source code, conformance tests, generated route inventories, schemas, deployment
   manifests, and runtime contracts at an exact revision.
2. Final or Living Atomicals Improvement Proposals applicable to the feature.
3. The official Atomicals reference implementation or released validator at an exact commit or
   release.
4. Official Atomicals protocol and CLI documentation.
5. Universe implementation documentation at an exact revision.
6. Third-party integrations, always identified as third-party and non-normative.

Explanatory prose, including this documentation, is never independent consensus.

## Pinned sources

### Atomicals ElectrumX

- Identifier: `atomicals-electrumx-1.5.2.0`
- Authority: protocol
- Repository: https://github.com/atomicals/atomicals-electrumx
- Revision: `8df23747835c20230fc8b8097d469e7a1d97c3e0` (released as v1.5.2.0)
- Networks: mainnet
- Visibility: public
- Role: Version-sensitive ARC-20 and Atomicals validation behavior used as the pinned reference baseline.
- Paths:
  - constants: electrumx/lib/util_atomicals.py#L51-L79
  - mintParser: electrumx/lib/util_atomicals.py#L459-L932
  - tickerRule: electrumx/lib/util_atomicals.py#L997-L1004
  - dftMintValidation: electrumx/server/block_processor.py#L3244-L3488
  - normalFtAllocation: electrumx/lib/atomicals_blueprint_builder.py#L643-L718
  - splitAndInflation: electrumx/lib/atomicals_blueprint_builder.py#L902-L946
  - allocationValidation: electrumx/lib/atomicals_blueprint_builder.py#L1052-L1074
  - nftAllocation: electrumx/lib/atomicals_blueprint_builder.py#L369-L530
  - networkActivations: electrumx/lib/coins.py#L659-L1043

### Atomicals JavaScript CLI

- Identifier: `atomicals-js-cli`
- Authority: protocol
- Repository: https://github.com/atomicals/atomicals-js
- Revision: `1333565efbfe5ca4bdb8443a94d72e9f8534c2c4`
- Networks: mainnet, testnet, regtest
- Visibility: public
- Role: Reference command surface used for the documented CLI inventory and the visual asset provenance.
- Paths:
  - commandIndex: lib/index.ts
  - cliEntry: lib/cli.ts
  - visualAsset: atomicals.jpg
  - license: LICENSE

### Atomicals protocol guide

- Identifier: `atomicals-guide`
- Authority: protocol
- Repository: https://github.com/atomicals-community/atomicals-guide
- Revision: unversioned
- Networks: mainnet
- Visibility: public
- Role: Concept and command-line explanation. Explicitly states that the specification is defined in code.
- Paths:
  - home: https://atomicals-community.github.io/atomicals-guide/
  - arc20: https://atomicals-community.github.io/atomicals-guide/arc20-tokens/
  - specification: https://atomicals-community.github.io/atomicals-guide/reference-and-tools/specification.html
  - bitwork: https://atomicals-community.github.io/atomicals-guide/bitwork-mining.html

### Atomicals Improvement Proposals

- Identifier: `atomicals-aips`
- Authority: protocol
- Repository: https://github.com/atomicals-community/aips
- Revision: `be08d7856db7c55c2bfb7c2c08f88a25f1c781f8`
- Networks: mainnet
- Visibility: public
- Role: The AIP register. An AIP existing is not evidence that anything implements it.
- Paths:
  - index: AIPs/
  - template: aip-template.md
  - aip1: AIPs/aip-1.md
  - aip3: AIPs/aip-3.md

### Universe ARC-20 index and Marketplace v1 authority

- Identifier: `universe-index-atomicals`
- Authority: universe
- Repository: https://github.com/bitcoinuniverseio/index-atomicals
- Revision: `670030e500710aaef77410540768a87a138d8134`
- Networks: mainnet
- Visibility: private
- Role: Universe ARC-20 token explorer feed and the durable Marketplace v1 protocol authority.
- Paths:
  - tokenExplorerServer: electrumx/token_explorer/server.py
  - tokenExplorerDocs: docs/arc20-token-explorer.rst
  - marketplaceDocs: docs/arc20-marketplace-v1.rst
  - marketplaceRpc: electrumx/token_explorer/marketplace/rpc.py
  - marketplaceAuthority: electrumx/token_explorer/marketplace/authority.py

### Universe Atomicals NFT, Realm, and Subrealm index

- Identifier: `universe-index-atomicals-nfts-and-realms`
- Authority: universe
- Repository: https://github.com/bitcoinuniverseio/index-atomicals-nfts-and-realms
- Revision: `1d9109c68d95d5985632a60d6596b3612d3f6ef1`
- Networks: mainnet
- Visibility: private
- Role: Materialized read model for plain NFTs, Realms, and Subrealms projected from Atomicals ElectrumX.
- Paths:
  - server: src/server.mjs
  - provenance: PROTOCOL-PROVENANCE.json
  - apiDocs: docs/api.md
  - architectureDocs: docs/architecture.md

### Ordex marketplace contract

- Identifier: `universe-ordex`
- Authority: universe
- Repository: https://github.com/bitcoinuniverseio/ordex
- Revision: `2f7d8d3ec59fac534f545bf03ed0d41878f91a0e`
- Networks: mainnet
- Visibility: public
- Role: Marketplace OpenAPI contract, SDK, conformance vectors, and purchase verifier reused instead of restated here.
- Paths:
  - openapi: spec/openapi.json
  - lifecycle: spec/lifecycle.md
  - purchase: spec/purchase.md
  - conformance: conformance/purchase-vectors.json
  - sdk: sdk/
  - verifier: verifier/

### Bitcoin Inscribe

- Identifier: `universe-inscribe`
- Authority: universe
- Repository: https://github.com/bitcoinuniverseio/inscribe
- Revision: unversioned
- Networks: mainnet
- Visibility: private
- Role: Product surface that consumes this documentation as the frontend/docs/arc-20-docs submodule.
- Paths:
  - submodule: frontend/docs/arc-20-docs
  - ci: .github/workflows/ci.yml

### Atomicals Virtual Machine interpreter

- Identifier: `atomicals-avm-interpreter`
- Authority: protocol
- Repository: https://github.com/atomicals/avm-interpreter
- Revision: `c185e6216a3ea2cb2e011e508033ca535ece3472`
- Networks: not deployed
- Visibility: public
- Role: Beta AVM interpreter. Status layer is separate from any Universe runtime exposure.
- Paths:
  - readme: README.md
  - opcodes: src/script/script.h
  - interpreter: src/script/interpreter.cpp
  - whitepaper: https://github.com/atomicals/avm-whitepaper

## Generated inventories

| Inventory | Generated from | Path |
| --- | --- | --- |
| CLI commands | https://github.com/atomicals/atomicals-js at 1333565efbfe5ca4bdb8443a94d72e9f8534c2c4, lib/cli.ts | /atomicals-and-arc-20/contracts/cli-inventory.json |
| AVM opcodes | The beta interpreter's opcode enumeration | /atomicals-and-arc-20/contracts/avm-opcodes.json |
| AIP registry | The upstream proposals plus a separate implementation evidence file | /atomicals-and-arc-20/contracts/aip-registry.json |
| Route inventories | Sanitized exports from the runtime repositories | /atomicals-and-arc-20/contracts/routes/ |
| Conformance vectors | The allocation engine, executed in CI | /atomicals-and-arc-20/conformance/vectors/arc20-allocation.json |

## Visual asset provenance

The site includes `assets/atomicals-cli-lockup.jpg`, an unchanged copy of `atomicals.jpg` from
the Atomicals CLI repository at commit 1333565efbfe5ca4bdb8443a94d72e9f8534c2c4. That
repository declares an MIT License. No separate logo-use policy or brand colour palette was located
during review.

The visual treatment on this site is a documentation interface choice, not an asserted Atomicals
brand. The asset and its use do not imply official status, endorsement, affiliation, or a trademark
licence.

## How to update source-dependent text

1. Select and record an implementation release or commit.
2. Check the active network and the activation conditions relevant to the behavior.
3. Re-run the conformance vectors for allocation, split, burn handling, and custom coloring.
4. Update contracts/source-manifest.json, then run `npm run generate`.
5. Commit the regenerated artefacts. CI fails when generation leaves the tree dirty.
6. Do not turn a metadata convention, a third-party product feature, or an inactive code path into
   a protocol-wide claim.

## Out of scope

- Price, market capitalisation, liquidity, legal, tax, and investment claims.
- Third-party wallet, marketplace, or indexer endorsements.
- A standalone ARC-721 standard. No official source located during review establishes one.
