# AVM status and limitations

The exact status of every AVM layer, the threat model, and the evidence that would be required to change any of it.

Page ID: protocol/avm/status-and-limitations
Applicability: experimental
Authority: reference-implementation
Networks: testnet
Verified: 2026-09-26
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/avm/status-and-limitations/

---
## Status, layer by layer

| Layer | Status | Evidence |
| --- | --- | --- |
| Whitepaper concepts | Proposed | A design document exists |
| Beta interpreter | Experimental | Source at a pinned revision with its own test annotations |
| Opcode set | Experimental | Generated from the pinned source. See [opcodes](/protocol/avm/opcodes/) |
| Universe indexer | Experimental | The Universe Atomicals indexer serves dedicated AVM RPCs: `blockchain.atomicals.avm.capabilities`, `status`, `get_state`, `get_state_history`, `get_state_hash`, and `get_execution` |
| Universe integration | Experimental | Inscribe exposes AVM Studio at `/avm-studio` and the `/avm/*` API |
| Universe attestation | Readiness report only | The indexer reports activation, the exact tip, schema 2, the attested native interpreter, the attested indexer revision, and a canary state hash. No conformance statement is published |
| Supported networks | Bitcoin Testnet4, validation only | AVM contract transactions are being validated on Testnet4 from activation height 27000. Signet cannot carry AVM with the pinned indexer. Mainnet AVM writes are not enabled in production |

That the AVM is live on mainnet. That Universe supports AVM contracts on mainnet. That Testnet4
validation is production support. That a whitepaper concept is implemented. That an opcode marked
tested upstream is production verified.

## Indexer fix that made AVM creates visible

The pinned indexer inherited an upstream guard in `create_or_delete_atomical` that accepted only
NFT and FT creates. It silently dropped every PROTOCOL (`def`) and CONTRACT (`new`) create from
blocks, so no AVM protocol or contract was ever indexed. The Universe fix admits both once AVM is
activated at the block height, and ignores them before activation, as before. The fix is in review
and not yet released.

## Threat model for anyone considering it

**Untrusted contract code.** A contract script is attacker supplied. Re-enabled opcodes such as
concatenation, multiplication, and shifts, combined with arbitrarily large numbers, make
unbounded memory and time growth reachable unless the host bounds them.

**Unbounded numbers.** Arbitrary precision arithmetic means a small script can request very large
allocations.

**Unbounded state.** State storage opcodes let a contract write data. Without a host-enforced
limit, storage grows without bound.

**Determinism.** Every independent evaluator must reach the same result. Any dependence on host
memory layout, iteration order, or locale breaks verification.

**State substitution.** A caller supplies state. Without a state hash bound to a revision, a
dishonest caller can supply state that never resulted from honest execution.

**Withdrawal correctness.** Opcodes mark outputs for withdrawal. A host that applies those marks
without independent validation is trusting the contract it just ran.

## Resource controls a host would need

1. A hard limit on execution steps.
2. A hard limit on memory, including numeric magnitude.
3. A hard limit on state size per contract and per call.
4. A hard limit on the number of token table entries.
5. A wall clock timeout independent of the step limit.
6. Rejection rather than truncation when any limit is hit.
7. Deterministic behavior at every limit, so all evaluators agree on the failure.

## What would have to exist before a network is supported

1. A pinned interpreter revision deployed on a named network.
2. Activation conditions, if any.
3. Deterministic conformance vectors executed against that exact revision in CI.
4. A published statement of what those vectors prove and what they do not.
5. A Universe service revision that exposes it, or an explicit statement that none does.
6. A resource limit policy, published.

Testnet4 now has items 1, 2, and 5, and is still in validation. Mainnet has none of them in
production. Until all six exist for a network, every AVM page here stays labelled experimental and
that network is not supported.
