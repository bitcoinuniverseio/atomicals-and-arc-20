---
title: Ordex contract
description: Where the Ordex marketplace contract, SDK, conformance vectors, and verifier live, and how the Universe boundary sits around them.
sidebar:
  order: 6
provenance:
  pageId: reference/api/ordex
  area: reference
  audience: [developer, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-ordex
      path: openapi
    - id: universe-ordex
      path: conformance
  verified: '2026-08-31'
  tags: [api, ordex, marketplace]
  limitations:
    - This page links the Ordex contract rather than restating it. A restated copy would drift, and a drifted copy of a settlement contract is dangerous.
---

## Why this page is short

Ordex publishes its own OpenAPI document, SDK, conformance vectors, and purchase verifier. Copying
them here would create a second version that can drift from the first. A drifted copy of a
settlement contract is worse than no copy.

So this page points at the source and documents only the boundary.

## Where the contract lives

| Artefact | Path in the Ordex repository |
| --- | --- |
| OpenAPI document | `spec/openapi.json` |
| Lifecycle specification | `spec/lifecycle.md` |
| Purchase specification | `spec/purchase.md` |
| API reference | `spec/api.md` |
| Interoperability notes | `spec/interoperability.md` |
| Conformance vectors | `conformance/purchase-vectors.json` |
| Burn vectors | `conformance/rune-burn-vectors.json` |
| SDK | `sdk/` |
| Purchase verifier | `verifier/` |

Repository: [bitcoinuniverseio/ordex](https://github.com/bitcoinuniverseio/ordex), pinned in this
documentation at the revision shown in the source panel above.

## The boundary

| Concern | Owned by |
| --- | --- |
| The Ordex marketplace contract, its lifecycle, and its vectors | Ordex |
| Atomicals collateral verification for the four protocol lanes | [Marketplace v1](/reference/api/marketplace-v1/) |
| Atomicals allocation and burn semantics | [The protocol](/protocol/arc20/allocation/) |
| Which Universe surface exposes which flow | [Status and limitations](/start/status-and-limitations/) |

Where a Universe surface wraps Ordex, the wrapper is documented on the Universe side and the
contract stays where it is defined.

## What to do as an integrator

1. Take the OpenAPI document from the Ordex repository at a pinned revision.
2. Generate your client from that document rather than hand writing calls.
3. Run the Ordex conformance vectors against your build.
4. Use the Ordex verifier for purchase validation rather than reimplementing it.
5. For anything touching Atomicals collateral, read
   [Marketplace v1](/reference/api/marketplace-v1/) as well, because the collateral rules are
   enforced there.

## Do not

- Do not assume an Ordex route behaves the same as a Marketplace v1 route with a similar name.
- Do not mix vectors from the two contracts.
- Do not treat an Ordex listing as evidence of Atomicals ownership. Ownership is verified at
  settlement, against the chain.

