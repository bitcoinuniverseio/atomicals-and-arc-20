---
title: Identifiers and numbers
description: Atomical IDs, compact IDs, locations, numbers, and which one to store in your database.
sidebar:
  order: 3
provenance:
  pageId: protocol/core/identifiers
  area: protocol
  audience: [developer, integrator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: constants
    - id: atomicals-js-cli
      path: cliEntry
  verified: '2026-08-31'
  tags: [identifiers, integration]
---

Four different identifiers appear in Atomicals tooling. They are not interchangeable.

| Identifier | Shape | Stable? | Use it for |
| --- | --- | --- | --- |
| Atomical ID | `<txid>i<index>` | Yes, forever | The primary key in your database |
| Compact Atomical ID | `<txid>i<index>` in the compact form used by CLI and payloads | Yes | Wire formats and operation payloads |
| Location | `<txid>:<vout>` | No, changes on every move | Current custody, never as a key |
| Number | An integer assigned in mint order | Yes, but not a key | Display and ordering |

## Converting between forms

The reference CLI exposes both directions:

- `yarn cli compact-outpoint <outpoint>` turns a location into the compact form.
- `yarn cli outpoint-compact <compactId>` turns a compact identifier back into an outpoint.

See the [CLI reference](/reference/cli/) for the exact generated signatures.

## Rules for integrators

1. Key on the Atomical ID. Nothing else.
2. Store the location separately and expect it to change.
3. Never derive identity from a ticker, realm name, or container name. Those are allocations that
   resolve to an Atomical ID, and the resolution can change while a candidate is pending.
4. Show both the human name and the resolved Atomical ID wherever a user makes a decision.
5. When you display a number, label it as a number. Users read it as a rank.

## Common failure

A product stores the ticker as its key, then a different Atomical wins the name after a candidate
resolves, or a lookalike ticker is minted. Every downstream row now points at the wrong asset.
Keying on the Atomical ID makes that failure impossible.
