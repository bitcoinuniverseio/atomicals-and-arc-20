---
title: Readiness and freshness
description: Configured, live, ready, degraded, stale, and mixed tip are six different states. A caller must handle each one differently.
sidebar:
  order: 10
provenance:
  pageId: develop/readiness-and-freshness
  area: develop
  audience: [developer, operator, integrator]
  applicability: universe-implementation
  authority: universe-implementation
  networks: [mainnet]
  sources:
    - id: universe-index-atomicals-nfts-and-realms
      path: server
    - id: universe-index-atomicals
      path: tokenExplorerDocs
  verified: '2026-08-31'
  tags: [readiness, operations]
---

## A configured source is not a healthy source

Configuration means someone wrote a setting. Readiness means the service can currently answer
correctly. They are unrelated.

## The endpoints

| Endpoint | Answers |
| --- | --- |
| `GET /live` | Is the process running? |
| `GET /ready` | Can it answer correctly, and if not, why? |
| `GET /health` | What is the state, including `unavailable`? |
| `GET /version` | Which service and provider revisions? |
| `GET /metrics` | Operational metrics, where enabled |

`/live` returning 200 says nothing about whether an answer would be correct. Read `/ready`.

## What readiness actually checks

The NFT and Realm read model reports ready only when all of the following hold:

- a generation identifier exists;
- the indexed height is a safe integer;
- the view is not stale;
- the tip is not mixed;
- the integrity check has not failed.

When any fails, the response is 503 with the reason, the state, the source, the network, the
generation identifier, the indexed height, the source revision, and the counts.

That response is designed to be actionable rather than merely negative.

## The six states

| State | Meaning | What a caller does |
| --- | --- | --- |
| Configured | A setting exists | Nothing. Wait for readiness |
| Live | The process is running | Nothing. Check readiness |
| Ready | Can answer correctly | Proceed |
| Degraded | Answering from an incomplete view | Do not act on the answer |
| Stale | Answering from an old chain position | Check the indexed height |
| Mixed tip | The generation spans more than one provider tip | Do not act on the answer |

## Declared coverage

The ARC-20 source declares `partial` coverage with an explicit reason: confirmed authoritative
history and complete proven holder snapshots are indexed, but the shipped adapter has no
exhaustive mempool feed with stable pending lifecycle and disappearance handling.

That limitation is about pending activity. It does not weaken the confirmed scan or the holder
proof requirements. Read the declared coverage rather than assuming completeness.

## For product builders

Render the state, never a misleading zero:

- "We cannot reach the index right now" for unavailable.
- "Showing data from block N" for stale.
- "This view does not cover that asset type" for out of scope.
- "No assets found" only when ready and genuinely empty.

## Source

[Unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/).

