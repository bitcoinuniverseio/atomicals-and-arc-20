# Recover from a rejection

A transaction that has not confirmed is still recoverable. Here is how to work out which situation you are in.

Page ID: guides/recover-from-a-rejection
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/recover-from-a-rejection/

---
## First, find out which situation you are in

| Situation | Recoverable |
| --- | --- |
| Built, not signed | Yes. Discard and rebuild |
| Signed, not broadcast | Yes. Discard and rebuild |
| Broadcast, rejected by the node | Yes. Nothing happened |
| Broadcast, in a mempool, unconfirmed | Sometimes. Replacement may be possible |
| Confirmed, Atomicals result wrong | No. The allocation is final |
| Commit broadcast, reveal never sent | Yes. Rebuild the reveal |

## Rejected before broadcast

Nothing happened on chain. Read the rejection reason and rebuild.

| Reason | Fix |
| --- | --- |
| Fee too low | Raise the fee rate |
| Dust output | Raise the output value above the relay threshold |
| Missing input information | The builder did not supply previous output data |
| Signature invalid | Wrong key, wrong flag, or a modified transaction |
| Non-standard script | Use a standard output type |

## Unconfirmed in a mempool

If the transaction signalled replaceability, a replacement may be possible. Do not build one
casually: a replacement is a different transaction with a different allocation.

1. Model the replacement's allocation before building it.
2. Confirm the burn figure is zero.
3. Confirm no input was pulled in that you did not intend.
4. Raise the fee enough to actually replace.

If it did not signal replaceability, you wait.

## Commit sent, reveal missing

The value sits in a Taproot output that only your key material can spend. Rebuild the reveal with
the same key material and the same envelope, and broadcast it. Do not build a different envelope:
the commit committed to that exact script.

If the commit did not carry enough to cover the reveal fee, you may need to fund the reveal from
an additional cardinal input, if your builder supports that.

## Confirmed with a wrong result

The allocation is final. Record what happened, work out which step of
[avoid burns](/guides/avoid-burns/) was skipped, and change the procedure.

## Never do this while recovering

- Never paste a seed phrase or private key into a recovery tool.
- Never accept help from someone who asks for one.
- Never rebroadcast a transaction you have not re-modelled.

## Source

[Commit and reveal](/protocol/core/commit-and-reveal/) and
[verify a transaction](/guides/verify-a-transaction/).
