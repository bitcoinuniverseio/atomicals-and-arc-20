# Transfers and swaps

Ordinary transfers, atomic swaps, and the exact output binding that makes a swap safe to sign.

Page ID: protocol/arc20/transfers-and-swaps
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/transfers-and-swaps/

---
## Ordinary transfer

An ordinary transfer spends coloured inputs and arranges outputs so allocation places the units
where you intend. There is no transfer operation in the normal case. The arrangement is the
transfer.

The shape that works:

| Position | Contents |
| --- | --- |
| Input 0 | The coloured lot being moved |
| Input 1 and later | Cardinal inputs funding the fee |
| Output 0 | The recipient, sized to the exact units being sent |
| Output 1 | Coloured change, sized to the exact remainder |
| Output 2 | Cardinal change, if any |

Get output sizes wrong and units burn. See [burns](/protocol/arc20/burns/).

The reference CLI exposes `transfer-ft <atomicalId>` and `transfer-builder`. See the
[CLI reference](/reference/cli/#transfer-ft).

## Atomic swap

A swap moves an asset and its payment in one transaction, so neither side can take one without
giving the other. Both parties sign the same transaction.

### What makes it safe

**Exact output binding.** The seller's signature must commit to the exact output that pays them:
the exact script and the exact value. A signature that leaves the payment output free lets a buyer
redirect it.

**Ownership proof separate from signing.** The seller proves control of the asset before the
transaction is built, without moving anything. That is what BIP-322 is for.
See [wallet integration](/reference/wallet-integration/).

**Pre-broadcast validation.** Before broadcast, the whole blueprint is validated against the
Atomicals rules: the selected asset must move to the buyer cleanly, with no operation, no mixed
Atomical ID, and no burn.

If your wallet cannot show every input and every output with its script and value, do not sign.
A swap PSBT that hides one output is a swap you do not control.

### What is rejected

The Universe Marketplace authority rejects, across all four protocol lanes:

- mixed collateral;
- spent outputs;
- checkpoint drift between verification and execution;
- ambiguous balances;
- Atomicals operations inside the swap;
- burns;
- output assignments that do not move the exact selected Atomical.

See [Marketplace v1](/reference/api/marketplace-v1/).

## Buyer funding inputs

Buyer funding inputs must be confirmed and uncoloured. The Universe authority requires them to be
confirmed P2WPKH or key-path P2TR outputs, and to be uncoloured in both the active script hash
view and location history. A buyer who funds a purchase with a coloured output loses those units.

## After the swap

Verify the result the same way you verify any transfer: confirmation, then indexing, then read the
asset location and check for burns. See [verify a transaction](/guides/verify-a-transaction/).
