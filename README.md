# Atomicals + ARC-20

Protocol documentation for **Atomicals**, digital objects minted on Bitcoin
through a commit and reveal pattern, and **ARC-20**, its fungible token model
where one token unit is one satoshi.

**Site: <https://bitcoinuniverseio.github.io/atomicals-and-arc-20/>**

## What is here

| Page | Contents |
| --- | --- |
| [Overview](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/) | What the protocol is, who it is for, lifecycle, entry points |
| [Specification](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/specification.html) | Envelope grammar, commit and reveal windows, CBOR fields, dmint bitwork, coloring rules C1 to C12, invalidity conditions |
| [Guide](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guide.html) | Plain language walkthrough, worked transactions, product support matrix |
| [Reference](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference.html) | Terminology, indexer semantics, limitations, security notes, implementation checklist |
| [Test vectors](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/test-vectors.html) | Valid and invalid cases with expected outcomes |
| [Simulator](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/simulator.html) | Client-side ARC-20 transfer outcome simulator |
| [Changelog](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/changelog.html) | Document version history |

## Key facts

- **Chain and network:** Bitcoin mainnet. Protocol activation at height 808080.
- **Carrier:** a taproot leaf script revealed in witness data, marked with a
  four byte `atom` push (`0461746f6d`) immediately after `OP_IF`.
- **Payload:** a CBOR map. Functional parameters live under `args`.
- **Identity:** an atomical id is the commit outpoint, written `<txid>i<index>`.
  The object is imprinted at output 0 of the reveal transaction.
- **Commit windows:** general mints must reveal within 100 blocks of their
  commit; name mints within 3 blocks.
- **Token model:** one ARC-20 unit occupies one satoshi. A balance is a set of
  colored satoshis, not a ledger entry.
- **Coloring:** tokens are ordered first in, first out by input index, then fill
  outputs left to right. Value that lands on no spendable output burns
  permanently. Partial coloring of the final output is legal from height 848484.
- **Issuance:** direct fixed supply (`ft`), or a decentralized mint deploy
  (`dft`) claimed by many `dmt` mints under declared limits and optional bitwork
  proof-of-work.
- **Names:** realms, subrealms, containers, and dmitems, with claims resolved by
  earliest valid commit and a 3 block verification depth.

## Safety

An ARC-20 transfer is engineered entirely by choosing output values. The
protocol never rejects a badly shaped transfer: Bitcoin confirms it and the
coloring rules decide what survives. Before signing, check the asset, amount,
destination, output values, and miner fee in a compatible wallet, and keep a
colored UTXO intact unless you understand how the transaction allocates its
units. The
[simulator](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/simulator.html)
exists so you can check a shape before you sign it.

## Grounding

Facts on this site come from the Bitcoin Universe Atomicals indexers, a pinned
fork of the upstream atomicals-electrumx reference implementation, and from the
shared protocol capability registry in Bitcoin Universe core. Universe-specific
indexing decisions are listed separately on the
[reference page](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference.html#universe-decisions)
rather than presented as protocol rules. Product support claims are limited to
actions verifiable in Bitcoin Universe code.

Live ARC-20 token data and prepared deploy, mint, and transfer actions are
available in [Bitcoin Inscribe](https://inscribe.bitcoinuniverse.io/arc20);
every action is handed to a compatible Bitcoin wallet for review and signing.

## Building

There is no build step. The site is hand-authored HTML with one stylesheet and
small vanilla JavaScript enhancements, deployed by GitHub Pages from `main` at
the repository root. Open `index.html` in a browser to work on it locally, or
serve the directory over HTTP so the local search index loads.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and
[SUPPORT.md](SUPPORT.md).

## Attribution

Atomicals and ARC-20 originated with the [Atomicals
project](https://github.com/atomicals). The Atomicals CLI artwork preserved in
`assets/` is credited to the [Atomicals JavaScript
project](https://github.com/atomicals/atomicals-js). Atomicals and ARC-20 names
and artwork remain associated with their respective creators. Documentation in
this repository is MIT licensed; see [LICENSE](LICENSE).

Published by Bitcoin Universe. Central documentation portal:
<https://docs.bitcoinuniverse.io>.
