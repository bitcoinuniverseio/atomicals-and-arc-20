# Data flow

Where every number comes from, which hop can be stale, and what a consumer should record with each answer.

Page ID: develop/data-flow
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/data-flow/

---
## The hops

1. **Bitcoin Core** produces blocks. Universe operates the node.
2. **Atomicals ElectrumX** reads blocks and applies the protocol rules. This is where protocol
   interpretation happens.
3. **A Universe index** scans the provider, builds a materialised read model, and publishes it as
   an immutable generation.
4. **A product** reads the index through a public API.

Each hop can be behind the one before it. A consumer must know which position each answer came
from.

## What can be stale, per hop

| Hop | Can be stale because |
| --- | --- |
| Bitcoin Core | Normal block propagation |
| ElectrumX | Still processing a block, or a reorg |
| Index | Scan in progress, or generation build in progress |
| Product cache | Cached an answer without its generation |

The last row is the one under your control, and the one most often responsible for a wrong screen.

## What the ARC-20 side guarantees

The scan is all or nothing. Holder rows are aggregated by address and must sum exactly to
circulating supply. A mismatch, a null address, a truncated page sequence, a changing declared
total, or a changing chain tip aborts the entire poll. No partial authoritative snapshot is ever
committed.

That is why an answer is either complete or absent, rather than plausible and wrong.

## What the NFT and Realm side guarantees

NFT, Realm, and Subrealm rows share one provider scan, one generation, one checkpoint, and one
active pointer. Publication requires exact final declared source-row coverage and rejects a count
shrink or an incomplete page.

A generation that spans more than one provider tip is published explicitly as mixed and stale,
without a single indexed height, rather than pretending to be consistent.

## What to record with every answer

| Field | Why |
| --- | --- |
| Generation identifier | So you can detect a rebuild |
| Indexed height | So you know the chain position |
| Source revision | So a behavior difference is explainable |
| Request identifier | So a support question is traceable |
| Stale and mixed-tip flags | So you know whether to act on it |

Storing an Atomicals result without those five makes any later disagreement unexplainable.

## Source

[Consistency and reorgs](/develop/consistency-and-reorgs/) and
[readiness and freshness](/develop/readiness-and-freshness/).
