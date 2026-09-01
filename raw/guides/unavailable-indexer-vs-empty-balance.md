# Unavailable index or empty balance

The difference between a service that cannot answer and an answer of zero, and why confusing them causes most false alarms.

Page ID: guides/unavailable-indexer-vs-empty-balance
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
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
