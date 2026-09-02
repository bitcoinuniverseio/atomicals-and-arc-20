# What are Atomicals?

Digital objects that live inside ordinary Bitcoin outputs, identified by the transaction that created them and interpreted by an Atomicals validator.

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/what-are-atomicals/

---
An **Atomical** is a digital object created by a Bitcoin transaction and carried by a Bitcoin
output. There is no side chain, no separate token ledger, and no smart contract account. The
object exists because a validator reads your transaction and applies the Atomicals rules to it.

## The three parts of an Atomical

**Identity** is the Atomical ID, written `<txid>i<output-index>`. It is assigned once and never
changes. A number is also assigned in mint order, but the ID is the durable identity to store.

**Location** is the UTXO that currently carries the object. Spending that UTXO moves the object,
or destroys it, depending on how the outputs are arranged.

**History** is the ordered set of operations applied to the object: the mint, any state updates,
and every move.

## How an operation is written

The envelope is not executed by Bitcoin. It is data inside a Taproot script path. Bitcoin does
not know what `atom` means. An Atomicals validator does.

A confirmed Bitcoin transaction only tells you the bytes are in a block. Whether the operation
was valid, which output received the object, and whether anything burned are all answers a
validator gives you. Always check both.

## The protocol family

| Kind | What it is | Read |
| --- | --- | --- |
| Atomicals NFT | A single non-fungible object with metadata and media | [NFT overview](/protocol/nft/overview/) |
| ARC-20 | Fungible tokens where one unit is one coloured satoshi | [ARC-20 overview](/protocol/arc20/overview/) |
| Container | A named collection that items can prove membership in | [Containers](/protocol/containers/overview/) |
| DMINT | Decentralised minting of Container items against a sealed manifest | [DMINT](/protocol/containers/dmint/) |
| Realm | A top-level name owned as an Atomical | [Realms](/protocol/realms/overview/) |
| Subrealm | A child name claimed under a Realm's rules | [Subrealms](/protocol/realms/subrealms/) |
| Payname | A Realm used as a payment destination | [Paynames](/protocol/realms/paynames/) |
| AVM | A sandboxed script interpreter, beta and separately scoped | [AVM](/protocol/avm/overview/) |

## What an Atomical is not

- It is not proof of who made something. A ticker or a Realm name is an allocation, not an identity check.
- It is not a contract account. There is no balance row to debit.
- It is not safe to infer from metadata. Metadata is arbitrary data supplied by the minter.
- It is not final because Bitcoin confirmed it. See [confirmation and reorgs](/protocol/core/confirmation-and-reorgs/).
