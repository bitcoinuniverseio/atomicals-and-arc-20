# Protocol comparison

A neutral, source-pinned comparison of Bitcoin metaprotocols, with no rankings, prices, or superiority claims.

Page ID: tools/protocol-comparison
Applicability: editorial
Authority: none
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/protocol-comparison/

---
No prices. No market data. No rankings. No claim that any protocol is superior. Different data
models suit different problems, and choosing between them is a design decision, not a contest.

## How to read the table

| Marker | Meaning |
| --- | --- |
| Pinned | Established from a source revision read during this review |
| Unpinned | A widely documented design characteristic, not verified against a revision here |
| Unverified | No source read during this review established it |

Only Atomicals and ARC-20 are pinned, because those are the protocols this documentation is
responsible for. Treat every other row as orientation, and verify against that protocol's own
documentation before designing against it.

## Data model

| Protocol | Where state lives | Marker | Source status |
| --- | --- | --- | --- |
| Atomicals | Digital objects carried by Bitcoin outputs | Envelope in a Taproot reveal witness | Pinned |
| ARC-20 | Coloured satoshis in outputs | Same envelope, fungible operations | Pinned |
| Ordinals | Satoshi ordering plus inscriptions in witness data | Inscription envelope | Unpinned |
| Runes | Protocol messages in an OP_RETURN output | Runestone | Unpinned |
| BRC-20 | Text records inside Ordinals inscriptions | JSON in an inscription | Unpinned |
| Bitcoin Stamps and SRC | Data embedded so it cannot be pruned | Transaction outputs | Unpinned |
| TAP | Text records layered on Ordinals | JSON in an inscription | Unpinned |
| Alkanes | A metaprotocol with programmable execution | Protocol messages | Unpinned |
| Counterparty | An older embedded-data protocol | Transaction data | Unpinned |
| RGB | Client-side validated state with on-chain commitments | Commitments | Unpinned |

## Fungibility and transfer

| Protocol | Fungible unit | Transfer semantics | UTXO safety |
| --- | --- | --- | --- |
| ARC-20 | One coloured satoshi | Allocation over ordered outputs. Unplaceable value burns | An ordinary wallet can destroy value by spending a coloured output |
| Runes | A protocol quantity, not tied to satoshi value | Edicts assign amounts to outputs | Requires protocol-aware handling |
| BRC-20 | A text-declared balance | Inscribe a transfer, then send the inscription | Requires protocol-aware handling |
| TAP | A text-declared balance | Inscription based | Requires protocol-aware handling |
| Counterparty | A protocol asset balance | Protocol messages | Requires protocol-aware handling |
| RGB | Client-side validated state | State transitions with on-chain commitments | Requires the client-side data |
| Ordinals, Stamps, Alkanes | Not primarily a fungible model, or unverified here | Unverified | Requires protocol-aware handling |

The ARC-20 row is the one this documentation is responsible for, and its consequences are covered
in [allocation](/protocol/arc20/allocation/) and [burns](/protocol/arc20/burns/).

## Names and collections

| Protocol | Names | Collections |
| --- | --- | --- |
| Atomicals | Realms, Subrealms, Paynames, and Container names, resolved through candidate rules | Containers with sealed DMINT manifests, verifiable per item |
| Ordinals | Unverified here | Convention based, commonly by provenance |
| Runes | Rune names with their own allocation rules | Not applicable |
| Others | Unverified here | Unverified here |

Atomicals is unusual in making collection membership checkable against a manifest that was sealed
before minting opened. See [item verification](/protocol/containers/item-verification/).

## Source of truth and indexer dependency

Every protocol in this table shares one property: Bitcoin does not validate it. An indexer does.

| Question | Answer, for all of them |
| --- | --- |
| Does Bitcoin enforce the rules? | No |
| Can two indexers disagree? | Yes, on version or activation differences |
| Is a confirmed transaction a valid operation? | Not necessarily |
| Can you verify without an indexer? | Only by running one yourself |

That is not a criticism of any of them. It is the shared consequence of building on data Bitcoin
ignores. See [indexer dependency](/protocol/core/indexer-dependency/).

## Programmability

| Protocol | Status |
| --- | --- |
| Atomicals | AVM exists as a beta interpreter. Not deployed by Universe on any network. See [AVM status](/protocol/avm/status-and-limitations/) |
| Alkanes | Described as programmable. Unverified here |
| RGB | Described as supporting client-side validated contracts. Unverified here |
| Others | Not primarily programmable, or unverified here |

## Choosing

The honest guidance is short:

1. Decide whether your value should be tied to satoshi value. If yes, look at ARC-20. If no, look
   at a protocol with a separate quantity model.
2. Decide whether membership and names need to be checkable, or whether convention is enough.
3. Decide how much indexer dependency you can accept, and whether you will run your own.
4. Read the actual specification and source of whichever you choose. Not a comparison table,
   including this one.
