# Universe NFT and Realm API

The complete read contract for plain NFTs, Realms, and Subrealms, including what the projection deliberately excludes.

Page ID: reference/api/atomicals-nfts-realms
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/api/atomicals-nfts-realms/

---
## The projection

**Included:** plain NFT, Realm, Subrealm.
**Excluded:** FT, DFT, Container, DMItem.
**Write capabilities:** none.

Asking this service about a Container returns nothing, correctly. Fungible tokens are served by
the [ARC-20 API](/reference/api/arc20/).

## What this service guarantees

- NFT, Realm, and Subrealm rows share one provider scan, one generation, one checkpoint, and one
  active pointer.
- Publication requires exact final declared source-row coverage and rejects a count shrink or an
  incomplete page.
- A generation spanning more than one provider tip is published explicitly as mixed and stale,
  without a single indexed height.
- Realm name, parent, claim, candidate, and payment evidence is retained in asset-specific indexes.
- The upstream provider commit is provenance, not a self-attested observed revision unless the
  provider reports it.

## Routes

## Readiness

Ready requires all of the following: a generation identifier exists, the indexed height is a safe
integer, the view is not stale, the tip is not mixed, and the integrity check has not failed.

When any fails, the response is 503 carrying the reason, the state, the source, the network, the
generation identifier, the indexed height, the source revision, and the counts. That response is
designed to be actionable.

See [readiness and freshness](/develop/readiness-and-freshness/).

## Media

The media route serves stored bytes with MIME restrictions, a size limit, and digest validation.
The service chooses the content type; it does not trust the one the payload declared.

Treat everything it returns as hostile input. See
[metadata and media](/protocol/nft/metadata-and-media/).

## Names

`resolve` returns a status, and only `verified` means the rules awarded the name. A `candidate`
status is not ownership.

`hierarchy` and `subrealms` return a truncation flag. Honour it: it means there was more and the
response stopped.

Unicode and IDNA errors are surfaced explicitly rather than flattened into a generic validation
failure. See [Unicode and IDNA](/protocol/realms/unicode-and-idna/).

## Holders

A non-fungible object has exactly one holder, so `holderScope` is always `current-owner` and the
total is one when an owner is known.

## Chain lookups

Transaction, block, and outpoint lookups return projected assets scoped to the active generation.
The outpoint lookup is the one to use before spending an output, because it tells you whether the
output carries more than one Atomical.
See [splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/).
