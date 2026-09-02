# Verify settlement

Confirm a trade actually completed, on chain and in the index, rather than trusting a status label.

Page ID: guides/verify-settlement
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/verify-settlement/

---
## Before you start

- Supported networks: mainnet.
- Status: Universe implementation.
- A settlement status is a product state. Verify the chain and the index separately.

## The procedure

1. Read the settlement record for the order. Note the settlement transaction id.
2. Confirm that transaction on Bitcoin.
3. Wait for the index to reach that height and report a stable generation.
4. Read the asset by Atomical ID and confirm its current location is an output you control.
5. Confirm the payment output paid the expected script and value.
6. Confirm the transaction recorded no burn.
7. Record the generation identifier alongside the result.

Step four is the one that matters. A settlement status without a confirmed location change is not
a completed trade.

## What each side verifies

| Party | Verifies |
| --- | --- |
| Buyer | The asset is now at an output they control, and no burn occurred |
| Seller | The payment output paid the exact script and value they signed for |

## Reconciliation

The service exposes a settlement read for each order, and an operator-only reconcile action.
Reconciliation is for resolving a service-side record against the chain. It is not a way to undo a
confirmed settlement.

## If something is wrong

| Symptom | What it means |
| --- | --- |
| Settled status, asset not moved | Read the settlement transaction. It may not have confirmed |
| Asset moved, payment missing | Read the payment output. This should be impossible under exact binding |
| Neither moved | Nothing settled. Nothing was spent |
| Index behind | Wait for the height. Do not conclude anything yet |

## Reorg considerations

A settlement confirmed inside the reorg window is not final. For a significant amount, wait for
depth appropriate to the value and re-read rather than trusting the first answer.

## Source

[Marketplace v1](/reference/api/marketplace-v1/) and
[confirmations and reorgs](/guides/confirmations-and-reorgs/).
