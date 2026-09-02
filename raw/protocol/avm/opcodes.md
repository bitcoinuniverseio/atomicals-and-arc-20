# AVM opcodes

The complete opcode inventory generated from the interpreter source, with the upstream test annotation preserved per opcode.

Page ID: protocol/avm/opcodes
Applicability: experimental
Authority: reference-implementation
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/avm/opcodes/

---
This inventory is generated from the interpreter's opcode enumeration. It is not hand maintained,
so it cannot drift from the source.

`tested upstream` means the source comment marks the opcode as tested by the interpreter's own
suite. It does not mean any Universe service executes it, and it does not mean the opcode is
active on any network.

## Authorisation

Signature checking is replaced. The ordinary Bitcoin signature opcodes are removed and a custom
authorisation opcode is used instead.

## Introspection

Opcodes that read the transaction being evaluated.

## State storage

Key and value storage private to a contract.

## Fungible tokens

Deposit, withdrawal, and inspection of ARC-20 balances held by a contract.

## Non-fungible tokens

Deposit, withdrawal, and inspection of non-fungible objects held by a contract.

## Block information

## Hashing

## Large numbers

The interpreter adds support for arbitrarily large numbers, so arithmetic is not bounded the way
Bitcoin script bounds it. Any integration must treat numeric results as arbitrary precision rather
than assuming a fixed width.
