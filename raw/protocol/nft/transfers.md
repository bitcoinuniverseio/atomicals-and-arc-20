# NFT transfers

Normal transfers, swap transfers, and what a non-fungible move actually commits to.

Page ID: protocol/nft/transfers
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/nft/transfers/

---
## Normal transfer

Spend the output carrying the NFT and arrange outputs so the non-fungible allocation branch places
the object where you intend. The reference CLI exposes `transfer-nft` and `transfer-utxos`.
See the [CLI reference](/reference/cli/#transfer-nft).

The shape that works:

| Position | Contents |
| --- | --- |
| Input 0 | The output carrying the NFT |
| Input 1 and later | Cardinal inputs for the fee |
| Output 0 | The recipient |
| Output 1 and later | Cardinal change |

## Swap transfer

A swap moves the NFT and its payment in one transaction, with both parties signing. The safety
requirements are the same as for fungible swaps: exact output binding, ownership proof separate
from signing, and pre-broadcast validation of the whole blueprint.
See [transfers and swaps](/protocol/arc20/transfers-and-swaps/).

For the non-fungible lanes, the Universe Marketplace always exposes `quantityAtomic` as `1`,
because the object is indivisible.

## What can go wrong

| Problem | Cause | Prevention |
| --- | --- | --- |
| The NFT went somewhere unexpected | The output arrangement placed it differently than you assumed | Model the transfer before signing |
| Several Atomicals moved together | The input carried more than one | Splat first. See [splat and mixed outputs](/protocol/nft/splat-and-mixed-outputs/) |
| The object was spent as ordinary bitcoin | An ordinary wallet chose the output for a fee | Use an Atomicals aware wallet |
| The swap payment was redirected | The seller signature did not bind the payment output | Refuse to sign an unbound swap |

## Verifying afterwards

Read the asset by Atomical ID and confirm its location matches the output you intended, at a
generation past the confirming height. Confirmation alone is not the answer.
See [verify a transaction](/guides/verify-a-transaction/).
