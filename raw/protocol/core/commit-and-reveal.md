# Commit and reveal

The two transaction pattern every Atomicals operation uses, and what can go wrong between the two steps.

Page ID: protocol/core/commit-and-reveal
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/commit-and-reveal/

---
## Why two transactions

Bitcoin script cannot carry arbitrary data cheaply in a way that stays hidden until spend time.
Taproot script path spending can. The commit transaction pays into an output that commits to a
script without revealing it. The reveal transaction spends that output and publishes the script
in the witness, where the envelope becomes visible.

## The steps

1. Build the envelope: the `atom` marker, the operation code, and the CBOR payload.
2. Derive a Taproot output that commits to a script containing that envelope.
3. If the operation requires commit Bitwork, grind the commit transaction until its transaction id
   satisfies the requirement.
4. Broadcast the commit transaction, funded well enough to cover the reveal.
5. Build the reveal transaction spending that output, with the envelope in the witness.
6. If the operation requires reveal Bitwork, grind the reveal transaction the same way.
7. Broadcast the reveal transaction.
8. Wait for confirmation, then for a validator to index that height.

## What can go wrong between the steps

| Problem | Symptom | What to do |
| --- | --- | --- |
| Commit funded, reveal never broadcast | Value sits in a Taproot output only your key material can spend | Rebuild and broadcast the reveal with the same key material |
| Reveal underfunded | Reveal rejected by mempool policy | Increase the commit amount and start again |
| Bitwork requirement misread | Reveal rejected by the validator, not by Bitcoin | Re-read the deployment and grind again |
| Race for a limited mint | Reveal confirms but the quota is already full | The mint is invalid. The Bitcoin transaction still cost a fee |
| Name already resolved | Reveal confirms as a losing candidate | See [candidates and winners](/protocol/core/candidates-and-winners/) |

Every row above except the first produces a confirmed Bitcoin transaction. Confirmation costs
money and proves nothing about validity. Check the validator result, not a block explorer.

## Fees

You pay two fees. The commit fee is ordinary. The reveal fee depends on witness size, which grows
with your payload, so embedding a large file makes the reveal expensive. Estimate before you
grind, not after.

The reference CLI accepts `--satsbyte` on the commands that build these transactions. See the
[CLI reference](/reference/cli/).
