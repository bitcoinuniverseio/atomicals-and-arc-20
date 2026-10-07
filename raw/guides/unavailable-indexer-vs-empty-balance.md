# Unavailable index or empty balance

The difference between a service that cannot answer and an answer of zero, and why confusing them causes most false alarms.

Page ID: guides/unavailable-indexer-vs-empty-balance
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-10-07
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/unavailable-indexer-vs-empty-balance/

---
A zero on a screen is a statement about a service, not about the chain. Before concluding anything
is missing, find out which of the states below you are actually in.

## The states, and what each means

| State | What it means | What to do |
| --- | --- | --- |
| Ready, result empty | The service answered, and there is nothing there | Check the address and asset type |
| Unavailable | The service cannot answer at all | Wait and retry. Nothing is lost |
| Degraded | Answering, but not from a complete view | Do not act on the answer |
| Stale | Answering from an old chain position | Check the indexed height |
| Mixed tip | The generation spans more than one provider tip | Do not act on the answer |
| Not covered | This asset type is not in this projection | Use the right service |
| Configured but not ready | Set up, not yet able to answer | Wait for readiness |

## How to tell them apart

Every Universe read service exposes readiness separately from liveness:

- `GET /live` says the process is running.
- `GET /ready` says whether it can answer correctly, and why not when it cannot.
- `GET /health` gives the state, which can be `unavailable`.
- `GET /version` gives the service and provider revisions.

Read `/ready` before concluding anything from an empty result. It reports the generation
identifier, the indexed height, whether the view is stale, and whether the tip is mixed.

## While an index is recovering

A restored database still needs integrity checks, a successful application start, and synchronization before its answers can be treated as current. Download completion and a running process are separate from readiness.

If a service is restoring or catching up, show that state and its indexed height. Do not show an unavailable response as an empty balance, treat an older height as the chain tip, or substitute an external blockchain provider. Recovery reuses the existing Universe-operated indexer and its protected runtime; it does not change asset ownership or protocol rules.

Wait for the service's readiness and freshness checks before using recovered results for a transaction or market decision. A recovery in progress is not a statement that an asset is missing.

## Projection coverage

An empty answer can simply mean the asset type is out of scope. The Universe NFT and Realm read
model projects plain NFTs, Realms, and Subrealms, and excludes fungible tokens, Containers, and
DMINT items by declaration.

Asking it about a Container returns nothing, correctly.

## For product builders

Never render an unavailable service as a zero balance. Render the state:

- "We cannot reach the index right now" for unavailable.
- "Showing data from block N" for stale.
- "This view does not cover that asset type" for out of scope.
- "No assets found" only when the service is ready and the result is genuinely empty.

## Source

[Readiness and freshness](/develop/readiness-and-freshness/) and
[indexer dependency](/protocol/core/indexer-dependency/).
