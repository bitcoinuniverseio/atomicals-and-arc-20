# ARC-20 documentation

Bitcoin Universe documentation for ARC-20 on Bitcoin.

## What this covers

ARC-20 assets use Atomicals semantics and colored satoshis. Each unit is backed by a satoshi, so ownership and transfer follow the UTXO that holds the colored sats.

## State model

ARC-20 emphasizes direct ownership. An indexer can make balances convenient to browse, but the spend history of the relevant UTXOs is the core ownership trail.

## Documentation site

- Overview: [index.html](index.html)
- Field reference: [reference.html](reference.html)
- Build and verification playbook: [guide.html](guide.html)

## Core rules

- Each ARC-20 unit is backed by one satoshi.
- Mint and update workflows use Atomicals commit and reveal mechanics.
- P2TR is required by the documented Atomicals mint and update workflows.
- A recipient owns units by controlling the destination UTXO.
- Token-aware coin selection must avoid accidentally spending colored UTXOs as fees.
- Direct mints and decentralized mints have different issuer and supply mechanics.

## Source material

- [Atomicals ARC-20 guide](https://atomicals-community.github.io/atomicals-guide/arc20-tokens/)
- [Atomicals guide source](https://github.com/atomicals-community/atomicals-guide)

## Scope

Treat colored UTXOs as protected inventory. A wallet that does not understand their provenance can destroy the intended token movement.
