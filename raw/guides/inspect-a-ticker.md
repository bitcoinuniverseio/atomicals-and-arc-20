# Inspect an ARC-20 ticker

Resolve a name to the Atomical that actually holds it, and read the deployment before you trust any figure about it.

Page ID: guides/inspect-a-ticker
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/inspect-a-ticker/

---
## Before you start

- Supported networks: mainnet.
- Status: Universe implementation for resolution and details.
- Read only. Do this before every purchase, mint, or transfer involving a ticker.

## The procedure

1. Resolve the ticker to a **verified winning Atomical ID**. If it resolves to a candidate rather
   than a winner, stop.
2. Read the token details for that Atomical ID, not for the name.
3. Read the deployment parameters: mode, mint amount, maximum mints, mint height, Bitwork.
4. Read issuance to date from claim records, not from the parameters.
5. Read the holder distribution, and note that holder rows must sum exactly to circulating supply.
6. Read confirmed activity. Note that pending activity coverage is limited.
7. Record the generation identifier and the indexed height.

## The check people skip

Compare the Atomical ID, not the name. Two tickers can render identically and be different
strings, and a name can resolve to a different Atomical after a candidate resolves.

Write the Atomical ID down. Compare it against the one in any listing, mint interface, or message
before you act.
See [Unicode and confusable names](/protocol/realms/unicode-and-idna/).

## What each figure means

| Figure | Meaning |
| --- | --- |
| Maximum issuance | `mint_amount * max_mints`. A ceiling, not a supply |
| Claims made | Valid claims counted from records |
| Circulating supply | Coloured value actually held, after burns |
| Holders | Addresses holding, aggregated from proven snapshots |
| Activity | Confirmed deployment, mint, transfer, burn, and protocol operations |

Circulating supply is not claims multiplied by mint amount, because units can burn after minting.

## If the answer is empty

That may mean the ticker does not exist, or that the index is unavailable, or that the projection
does not cover this asset type. They are different.
See [unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/).

## Source

[Tickers and candidates](/protocol/arc20/tickers-and-candidates/) and
[ARC-20 API](/reference/api/arc20/).
