# Choose your path

Four short routes through this documentation, one for each thing people actually come here to do.

Page ID: start/choose-your-path
Applicability: editorial
Authority: none
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/choose-your-path/

---
Pick the row that matches what you are doing today. Every route is short on purpose.

## Holder

You own units, an NFT, or a Realm, and you want to keep them.

1. Learn the model: [what is ARC-20](/start/what-is-arc-20/) and [what are Atomicals](/start/what-are-atomicals/).
2. Run the checks in [safety fundamentals](/start/safety-fundamentals/).
3. Pick a wallet that understands coloured outputs: [choose a wallet](/guides/choose-a-wallet/).
4. Separate fee money from coloured money: [protect coloured outputs](/guides/protect-colored-outputs/).
5. Before any move, model it: [allocation visualizer](/tools/allocation-visualizer/).
6. After broadcast, confirm the result: [verify a transaction](/guides/verify-a-transaction/).

## Creator

You are launching a token, a collection, or a name.

1. Decide the issuance shape: [direct](/protocol/arc20/direct-issuance/), [fixed DFT](/protocol/arc20/fixed-dft/), or [perpetual DFT](/protocol/arc20/perpetual-dft/).
2. Understand what a ticker actually reserves: [tickers and candidates](/protocol/arc20/tickers-and-candidates/).
3. Budget the work: [Bitwork](/protocol/core/bitwork/) and the [Bitwork estimator](/tools/bitwork-estimator/).
4. Build the command: [CLI reference](/reference/cli/) and the [command builder](/tools/cli-builder/).
5. For collections: [Containers](/protocol/containers/overview/) then [DMINT](/protocol/containers/dmint/).
6. For names: [claim a Realm](/guides/claim-a-realm/) and [Unicode and IDNA](/protocol/realms/unicode-and-idna/).

## Developer

You are integrating an API, a wallet, or an indexer.

1. Read the [source of truth model](/develop/source-of-truth/) first. It decides how much you can trust any response.
2. Take the contracts: [OpenAPI and schemas](/reference/openapi/).
3. Generate a client: [TypeScript client](/reference/client-sdk/).
4. Handle the hard parts: [cursors](/develop/pagination-and-cursors/), [reorgs](/develop/consistency-and-reorgs/), [readiness](/develop/readiness-and-freshness/).
5. Prove your builder: [conformance vectors](/reference/conformance/).
6. Wire the wallet: [wallet integration](/reference/wallet-integration/).

## Operator

You run or depend on the indexes.

1. [Generations, checkpoints, and rollback](/develop/consistency-and-reorgs/).
2. [Readiness against configured](/develop/readiness-and-freshness/) and what each state means to a caller.
3. [Unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/), the difference that causes support tickets.
4. [Versioning and deprecation](/develop/versioning-and-deprecation/) so consumers are warned before behavior changes.

Deployment, credentials, capacity, topology, monitoring, and recovery procedures are not
published here. They belong in the private developer documentation repositories
`docs-dev-atomicals` and `docs-dev-atomicals-nfts-and-realms`.
