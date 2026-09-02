# Offers

Make an offer, cancel it, and accept one, with the checks each side owes the other.

Page ID: guides/offers
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/offers/

---
## Before you start

- Supported networks: mainnet.
- Status: Universe implementation. Offer gates default to off, and buy or offer execution
  additionally requires an exact fee script to be configured.
- An offer is an intention, not a transfer.

## Making an offer

1. Obtain an owner session for the funding address.
2. Submit the offer with the asset, the amount, and any expiry.
3. Sign what the service returns, with the exact scope it specifies.

Your funds are not moved by making an offer. They move only when a settlement transaction is
signed and broadcast.

## Cancelling

Call the cancel step for the offer identifier, with a current owner session. Cancel before the
offer is accepted. Once acceptance begins, the flow moves to settlement.

## Accepting an offer

As the asset owner:

1. Obtain an owner session.
2. Read the offer: the exact asset, the exact amount, and the exact payment script.
3. Confirm the asset is the Atomical ID you intend, not just a name or a ticker.
4. Accept, then sign what the service returns.
5. Verify settlement.

## What the authority checks

The same independent views must agree as for a listing: verified name or ticker winner, Bitcoin
Core, the Atomicals provider, and an unchanged checkpoint across the bracket. Buyer funding inputs
must be confirmed and uncoloured.

## Check before signing

| Check | Why |
| --- | --- |
| The Atomical ID | Names and tickers can be confusable |
| The exact amount | Not a rounded display figure |
| The exact payment script | So the payment cannot be redirected |
| The signature scope | It must bind the payment output exactly |
| Your funding inputs are uncoloured | Or you spend an asset to fund a purchase |

## If it fails

| Failure | Meaning |
| --- | --- |
| Offer expired | Make a new one |
| Asset moved | The owner moved it. The offer cannot settle |
| Funding input coloured | Use cardinal funds |
| Gate disabled | Offers are not enabled on this deployment |

## After

Verify settlement. See [verify settlement](/guides/verify-settlement/).

## Source

[Marketplace v1](/reference/api/marketplace-v1/).
