# AVM

The Atomicals Virtual Machine, split into the four separate status layers people usually collapse into one.

Page ID: protocol/avm/overview
Applicability: experimental
Authority: reference-implementation
Networks: none
Verified: 2026-09-26
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/avm/overview/

---
Four separate things are called "the AVM". They have four different statuses. Treating any of them
as production mainnet support would be wrong.

## The four layers

| Layer | Status | What exists |
| --- | --- | --- |
| Architectural whitepaper concepts | Proposed | A design document describing a system |
| Official beta interpreter | Experimental or beta | Working code with its own test suite |
| Universe runtime integration | Experimental | Inscribe exposes AVM Studio at `/avm-studio` and the `/avm/*` API. The Universe Atomicals indexer serves the `blockchain.atomicals.avm.*` RPCs. Validated on Bitcoin Testnet4 only. Mainnet AVM writes are not enabled in production |
| Universe runtime attestation | Readiness report only | The indexer reports activation, the tip, the interpreter, the indexer revision, and a canary state hash. No conformance statement is published |

## What the interpreter is

A modified Bitcoin script interpreter, distributed as a library and a command line tool. The
upstream project describes it as a sandbox invoked per contract that simulates execution of a
Bitcoin script program. The caller provides state inputs, scripts, and block variables, and
updated state is returned as CBOR encoded structures.

Key differences from Bitcoin script, as described upstream:

- most originally disabled opcodes are re-enabled, including concatenation, multiplication,
  division, and shifts;
- arbitrarily large numbers are supported;
- new opcodes handle deposit and withdrawal of non-fungible objects and ARC-20 tokens;
- new opcodes read and write private state storage;
- a hashing opcode provides additional digest algorithms;
- signature checking is replaced by a custom authorisation opcode.

## Read next

| Topic | Page |
| --- | --- |
| The generated opcode inventory | [Opcodes](/protocol/avm/opcodes/) |
| State, execution inputs, and outputs | [State and execution](/protocol/avm/state-and-execution/) |
| Threat model, resource limits, and what is unverified | [Status and limitations](/protocol/avm/status-and-limitations/) |

## What this documentation will not do

It will not describe AVM behavior as available, supported, or production ready. It will not
describe Testnet4 validation as mainnet support. It will not present whitepaper concepts as
implemented behavior.

The Universe AVM surfaces exist for validation on Bitcoin Testnet4, from activation height 27000.
Signet cannot carry AVM with the pinned indexer. Mainnet AVM writes are not enabled in production.
A network becomes supported only when a pinned revision, activation conditions, and executed
conformance vectors exist for it. See
[AVM status and limitations](/protocol/avm/status-and-limitations/) and
[status and known limitations](/start/status-and-limitations/).
