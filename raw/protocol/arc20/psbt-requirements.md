# PSBT requirements

What a partially signed transaction must contain for an Atomicals aware wallet to sign it safely, and what a wallet must show you.

Page ID: protocol/arc20/psbt-requirements
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/psbt-requirements/

---
A PSBT is the exchange format between a service that builds a transaction and a wallet that signs
it. For Atomicals, a PSBT that omits context is a PSBT that cannot be signed safely.

## What every input must carry

| Field | Why |
| --- | --- |
| The previous output script and value | So the wallet can verify what it is spending |
| Whether the input is coloured, and for which Atomical | So the wallet can warn before spending an asset |
| The signature hash flag to use | So the signer commits to the intended scope |
| Derivation information for the signing key | So the wallet can find the key |
| Tap internal key and merkle root for Taproot inputs | So key-path signing works |

## What every output must carry

| Field | Why |
| --- | --- |
| Exact script | So the recipient cannot be redirected |
| Exact value in satoshis | So allocation is deterministic |
| The expected coloured assignment | So the signer can compare against their intent |

## Signature hash flags

A flag that does not commit to all outputs lets someone else change the outputs after you sign.
For a swap, the seller's signature must commit to the exact output that pays them.

A builder must state, per input, which flag it expects. A wallet must show which flag it is about
to use. A signer must reject a flag they did not expect.

## Ordering

Input order and output order are part of the meaning. A wallet or library that reorders inputs or
outputs for canonicalisation changes the allocation result. Do not reorder an Atomicals PSBT.

## Protected outputs

A wallet must refuse to select a coloured output for fees unless the user explicitly approved
spending that asset. This is the single most valuable wallet feature for Atomicals.
See [wallet safety](/protocol/arc20/wallet-safety/).

## Validation before signing

Before presenting a PSBT for signature, a builder should:

1. Resolve every input's coloured state at a stable chain position.
2. Compute the expected allocation for the exact output set.
3. Assert the burn total is zero, or make the intended burn explicit.
4. Assert no unexpected Atomicals operation is present.
5. Assert output totals do not exceed input totals per token.
6. Record the chain position, and re-validate if it moved.

The [transaction inspector](/tools/transaction-inspector/) performs a read-only version of steps
one to five locally, without uploading anything.
