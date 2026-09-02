# Status and known limitations

What is live, what is beta, what is proposed, what is not exposed at all, and the limitations we know about and have not hidden.

Page ID: start/status-and-limitations
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/status-and-limitations/

---
## ARC-20

| Capability | Status | Notes |
| --- | --- | --- |
| Verified ticker resolution and token details | Universe implementation | Winning Atomical ID is published, not just the name |
| Holder snapshots | Universe implementation | Holder rows must sum exactly to circulating supply or the scan aborts |
| Confirmed activity history | Universe implementation | Deployment, direct and decentralised mint, transfer, burn, protocol operations |
| Pending activity coverage | Limited | No exhaustive mempool feed with stable pending lifecycle handling |
| Portfolio balances and coloured UTXOs | Universe implementation | Read views, not proof of settlement |
| Direct `mint-ft` issuance from a Universe product | Not exposed | The protocol supports it. No Universe surface offers it |
| Substantiation Factor material | Preliminary | See [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

The ARC-20 source reports `partial` coverage with an explicit reason: confirmed authoritative
history and complete proven holder snapshots are indexed, but the shipped adapter has no
exhaustive mempool feed with stable pending lifecycle and disappearance handling. That limitation
applies to pending activity only. It does not weaken the confirmed scan or the holder proof
requirements.

## Atomicals NFTs, Realms, and Subrealms

| Capability | Status | Notes |
| --- | --- | --- |
| Plain NFT, Realm, and Subrealm read model | Universe implementation | One shared provider scan, generation, and checkpoint |
| Realm resolution, hierarchy, and Subrealm listing | Universe implementation | Candidate and payment evidence retained per asset |
| Transaction, block, and UTXO lookup | Universe implementation | Scoped to the active generation |
| Media delivery with integrity checks | Universe implementation | MIME restrictions and size limits apply |
| Fungible tokens in this projection | Excluded by design | Served by the ARC-20 side instead |
| Containers and DMINT items in this projection | Excluded by design | Declared in the index provenance manifest |
| Write operations | None | The projection is read only |

## Marketplace

| Capability | Status | Notes |
| --- | --- | --- |
| Four isolated protocol authorities | Universe implementation | `arc20`, `atomicals_nft`, `realms`, `subrealms` |
| Listing, reservation, purchase, offer, settlement | Universe implementation | Every action gate defaults to off |
| Ownership proof | Universe implementation | BIP-322 simple proof for P2WPKH and key-path P2TR |
| Mixed collateral, burns, spent outputs, checkpoint drift | Rejected | All four lanes fail closed |
| Legacy `/buys` and `/orders/{orderId}/reconcile` aliases | Deprecated | Use `/reservations`, `/purchases`, `/settlements` |

## AVM

| Layer | Status |
| --- | --- |
| Architectural whitepaper concepts | Proposed |
| Official beta interpreter | Experimental or beta |
| Universe runtime integration | Not exposed |
| Universe runtime attestation | None published |

Nothing about the AVM on this site should be read as production mainnet support. See
[AVM status and limitations](/protocol/avm/status-and-limitations/).

## Limitations we know about

1. Pending ARC-20 activity is not exhaustively covered. Confirmed history is.
2. Containers and DMINT are documented as protocol behavior. No Universe read projection exposes
   them today.
3. Direct FT issuance is protocol behavior with no Universe product surface.
4. AVM is beta upstream and unexposed here. Any implementation claim would need an attestation we
   have not published.
5. Some Atomicals ecosystem services listed in the [registry](/ecosystem/) could not be
   verified from a reachable source. Those rows say `unknown` rather than guessing.
6. Rate limiting is documented only where it is actually implemented. Where a service has none,
   the page says so instead of inventing a policy.

## How to report something wrong

Open an issue in the [documentation repository](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/issues).
Use the **incorrect protocol claim** or **API mismatch** template and include the page ID from the
source panel.
