# Tickers and candidates

How an ARC-20 name is requested, resolved, and displayed, and what winning it actually means.

Page ID: protocol/arc20/tickers-and-candidates
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/tickers-and-candidates/

---
A ticker is a globally allocated ARC-20 name. It is requested inside a mint payload as
`request_ticker`, and the rules decide whether that request becomes a verified winner.

## The name rule at the pinned revision

The pinned validator accepts direct FT tickers matching lowercase `[a-z0-9]{1,21}`.

That is a source-revision fact. It is not a promise that every historical or future validator
uses the same rule. A builder must validate names against the exact active target.

## Requested, candidate, verified

| Field | Meaning |
| --- | --- |
| `request_ticker` | The name asked for in the mint payload |
| Ticker status | Whether the request is pending, a candidate, a winner, or a loser |
| Ticker | The name only after resolution succeeded |
| Atomical ID | The object that actually holds the name |

The ARC-20 guide states a ticker is claimed after three confirmations. Treat that as guide
guidance and check the active revision for the exact rule.

## What winning a ticker means

It means the rules resolved one Atomical as holding that name. That is all.

It does not mean:

- the minter is who they say they are;
- the metadata is accurate;
- the supply is what a website claims;
- a similar-looking name belongs to the same person.

## What a product must do

1. Resolve every ticker to an Atomical ID and store that ID.
2. Display the Atomical ID wherever a user makes a decision.
3. Show pending requests as candidates, never as owned.
4. Show the full candidate set when more than one request exists.
5. Warn on visually confusable names.
6. Re-resolve after a reorg.

## The Universe resolution path

The Universe ARC-20 source discovers every ticker candidate without an upstream verified-only
filter, then resolves each name through the Atomicals provider. Only the verified winning Atomical
ID is published. The reference exposed to products is the lower-case ticker, and the winning
compact Atomical ID is retained in protocol details.

See [ARC-20 API](/reference/api/arc20/).
