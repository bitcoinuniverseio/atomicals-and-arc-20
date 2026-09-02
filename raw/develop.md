# Architecture overview

How the Universe Atomicals services fit together, what each one is authoritative for, and where the boundaries are.

Page ID: develop/index
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/

---
## The services

| Service | Authoritative for | Read |
| --- | --- | --- |
| Atomicals ElectrumX | Protocol interpretation of blocks | [ElectrumX reference](/reference/electrumx/) |
| ARC-20 index and feed | Verified tickers, holders, confirmed activity | [ARC-20 API](/reference/api/arc20/) |
| NFT and Realm index | Plain NFTs, Realms, Subrealms | [NFT and Realm API](/reference/api/atomicals-nfts-realms/) |
| Marketplace v1 authority | Listings, reservations, purchases, settlements | [Marketplace v1](/reference/api/marketplace-v1/) |
| Ordex contract | Marketplace contract, SDK, conformance | [Ordex](/reference/api/ordex/) |

All Bitcoin and Atomicals data comes from Universe-operated nodes, indexes, and databases. No
third-party blockchain data provider sits in any production path.

## What each index is not

- Not a validator. Both indexes project what an Atomicals provider reports.
- Not complete. Each declares its projection, and each excludes asset kinds on purpose.
- Not final. Every answer is scoped to a generation and a chain position.

## Projections

The NFT and Realm read model declares its projection explicitly:

- **Included:** plain NFT, Realm, Subrealm.
- **Excluded:** FT, DFT, Container, DMItem.

Fungible tokens are served by the ARC-20 side. Containers and DMINT items are not projected by
either.

## Read next

| Topic | Page |
| --- | --- |
| Where data comes from and what it costs to trust | [Data flow](/develop/data-flow/) |
| How to decide which answer to believe | [Source of truth](/develop/source-of-truth/) |
| Generations, checkpoints, and rollback | [Consistency and reorgs](/develop/consistency-and-reorgs/) |
| Identifiers, networks, and protocol IDs | [Identifiers and networks](/develop/identifiers-and-networks/) |
| Authentication across the services | [Authentication](/develop/authentication/) |
| Error envelopes | [Errors](/develop/errors/) |
| Cursors and paging | [Pagination and cursors](/develop/pagination-and-cursors/) |
| Safe retries and tracing | [Idempotency and request IDs](/develop/idempotency-and-request-ids/) |
| Readiness against configured | [Readiness and freshness](/develop/readiness-and-freshness/) |
| Rate limits where they exist | [Rate limits](/develop/rate-limits/) |
| Versioning and deprecation | [Versioning and deprecation](/develop/versioning-and-deprecation/) |
| Moving between versions | [Migration](/develop/migration/) |
