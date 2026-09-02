# AVM status and limitations

The exact status of every AVM layer, the threat model, and the evidence that would be required to change any of it.

Page ID: protocol/avm/status-and-limitations
Applicability: experimental
Authority: reference-implementation
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/avm/status-and-limitations/

---
## Status, layer by layer

| Layer | Status | Evidence |
| --- | --- | --- |
| Whitepaper concepts | Proposed | A design document exists |
| Beta interpreter | Experimental | Source at a pinned revision with its own test annotations |
| Opcode set | Experimental | Generated from the pinned source. See [opcodes](/protocol/avm/opcodes/) |
| Universe integration | Not exposed | No service, no route, no configuration |
| Universe attestation | None | Nothing published |
| Supported networks | None | The interpreter is not deployed by Universe on any network |

That the AVM is live on mainnet. That Universe supports AVM contracts. That a whitepaper concept
is implemented. That an opcode marked tested upstream is production verified.

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

## What would have to exist before this documentation changes

1. A pinned interpreter revision deployed on a named network.
2. Activation conditions, if any.
3. Deterministic conformance vectors executed against that exact revision in CI.
4. A published statement of what those vectors prove and what they do not.
5. A Universe service revision that exposes it, or an explicit statement that none does.
6. A resource limit policy, published.

Until all six exist, every AVM page here stays labelled experimental with no supported networks.
