# AVM state and execution

What a contract call receives, what it returns, and how state is expected to be carried between calls.

Page ID: protocol/avm/state-and-execution
Applicability: experimental
Authority: reference-implementation
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/avm/state-and-execution/

---
## The execution model

The interpreter is a sandbox invoked per contract. Upstream describes the entry point as a library
function that verifies a script for the AVM, with the caller supplying state inputs, scripts, and
current block information. On success, updated state variables are returned as CBOR encoded
structures.

Three consequences follow:

1. **The caller owns state.** The interpreter does not persist anything. Whatever calls it must
   store and supply state.
2. **The boundary is CBOR.** Inputs and outputs cross the boundary as encoded structures, not as
   language objects.
3. **Execution is per contract.** There is no shared global machine.

## What a call needs

| Input | Purpose |
| --- | --- |
| The contract script | What to execute |
| The unlocking script | The caller's side of the call |
| State inputs | The contract's stored key and value data |
| Token tables | Fungible balances and non-fungible objects the contract holds |
| Block information | So the script can read chain context |
| Authorisation signatures | So the custom authorisation opcode can validate the caller |

## What a call returns

- Success or failure.
- Updated state, CBOR encoded.
- Updated token tables, including any deposits or withdrawals marked during execution.
- Any outputs marked for withdrawal.

## State hashes

A state hash lets an independent party check that a claimed post-execution state matches what an
honest execution would produce. Without one, a caller must re-execute to verify.

Any integration that stores AVM state must record the hash alongside it, and must record which
interpreter revision produced it.

## Deposits and withdrawals

Separate opcodes add fungible balance and non-fungible objects to a contract's internal tables, and
mark outputs for withdrawal. The mechanics differ from ordinary Atomicals transfers, because value
moves into and out of a contract's internal accounting rather than directly between outputs.

Nothing here is exposed by any Universe service. See
[status and limitations](/protocol/avm/status-and-limitations/).

## Virtual assets

The whitepaper describes virtual unspent output concepts. Those are architectural concepts in a
design document. They are not implemented behavior on the basis of appearing there.
