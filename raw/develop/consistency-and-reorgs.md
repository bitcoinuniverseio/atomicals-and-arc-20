# Consistency and reorgs

Generations, checkpoints, invalidation, and rollback, and what a consumer must do about each.

Page ID: develop/consistency-and-reorgs
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/consistency-and-reorgs/

---
## Generations

A generation is an immutable snapshot of an index at one consistent chain position. Answers are
served from the active generation, and the identifier is returned with every response.

Why immutability matters: a consumer that recorded a generation identifier can tell the difference
between "the data changed" and "I am looking at a different snapshot".

## Checkpoints

A checkpoint records the chain position a generation was built from, including block hashes. When
the chain moves under the index, the checkpoint is what makes a correct rebuild possible.

## Reorg handling

The ARC-20 side rescans each changed tip under identical before and after Bitcoin and Atomicals
tips. Missing unfinalised events produce explicit invalidations. Changes to finalised blocks,
events, or ticker identity fail closed rather than being silently accepted. Historical headers
outside the configured reorg window are reused from a durable journal.

The NFT and Realm side publishes a complete generation only when the declared source-row coverage
is exact, and rejects a count shrink or an incomplete page. A generation spanning more than one
provider tip is published explicitly as mixed and stale.

## Rollback

An operator can roll the active pointer back to an earlier generation. That is an operational
action, not a consumer action, and it changes which snapshot readers see.

A consumer detects it by the generation identifier changing to one it has seen before.

## What a consumer must do

1. Read the generation identifier and indexed height with every answer.
2. Store both alongside any cached result.
3. Treat a generation change as a signal to re-read, not as noise.
4. Never merge results from two different generations into one view.
5. Do not act on a result computed inside the reorg window for a significant amount.
6. Handle `stale` and `mixedTip` explicitly rather than rendering the numbers anyway.

## Pagination across a reorg

A cursor refers to a position inside a generation. When the generation changes, the cursor is no
longer valid for the new one. Restart the listing rather than continuing with a stale cursor.
See [pagination and cursors](/develop/pagination-and-cursors/).

## Source

[Confirmation and reorgs](/protocol/core/confirmation-and-reorgs/).
