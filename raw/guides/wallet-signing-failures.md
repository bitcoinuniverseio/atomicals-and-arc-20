# Wallet signing failures

Diagnose a wallet that will not sign, by capability, encoding, and signature hash flag.

Page ID: guides/wallet-signing-failures
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/wallet-signing-failures/

---
## The four categories

Almost every signing failure is one of these.

**Capability.** The wallet does not support the thing you asked for: a script type, a signature
hash flag, a PSBT feature, or message signing.

**Encoding.** The PSBT is a form the wallet cannot read, or is missing information it needs.

**Scope.** The signature hash flag is not one the wallet will produce, or not one you should
accept.

**State.** The wallet is locked, disconnected, on the wrong network, or on a different account.

## Diagnosing, in order

1. **Is the wallet unlocked and connected?** Reconnect and try again.
2. **Is it on the right network?** A mainnet PSBT presented to a testnet account fails.
3. **Is the account the one that owns the input?** Check the derivation path.
4. **Does the input carry everything the wallet needs?** Previous output script and value,
   derivation information, and for Taproot the internal key and merkle root.
5. **Is the signature hash flag supported?** Ask the provider what it supports rather than
   guessing.
6. **Is the PSBT encoding one the provider accepts?** Providers differ on hex against base64.
7. **Is it sign only or sign and broadcast?** Some providers broadcast automatically. Know which
   before you sign.

## What you should refuse to sign

- A PSBT whose outputs you cannot see in full, with scripts and values.
- A signature hash flag that does not commit to the outputs you care about.
- A swap where the payment output to you is not bound exactly.
- Anything where the wallet cannot tell you which inputs are coloured.

## For integrators

Discover capability first. Ask the provider what script types, flags, and encodings it supports,
then build for that. Normalise errors so a user sees the category rather than a raw provider
message.

See [wallet integration](/reference/wallet-integration/).

## After a failed signature

Nothing was broadcast, so nothing happened. Rebuild for the capability the wallet actually has,
or use a different wallet.

## Source

[PSBT requirements](/protocol/arc20/psbt-requirements/) and
[wallet safety](/protocol/arc20/wallet-safety/).
