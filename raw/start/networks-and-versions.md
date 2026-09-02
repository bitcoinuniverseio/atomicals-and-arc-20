# Networks and versions

Which network a statement applies to, which validator revision decides it, and which documentation version you are reading.

Page ID: start/networks-and-versions
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet, testnet, signet, regtest
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/networks-and-versions/

---
Three separate version axes affect every source-sensitive statement on this site. Mixing them up
is the single most common cause of wrong integrations.

## 1. The network

Atomicals activation conditions are network specific. The pinned reference implementation carries
different activation heights per coin definition. A rule that is active on mainnet may be
inactive, active at a different height, or always-on in a regtest configuration.

Every page lists the networks it applies to in its source panel. When a page says `mainnet` only,
do not assume the same behavior elsewhere.

## 2. The validator revision

The Atomicals specification is defined in code. The reference revision this documentation is
pinned to is Atomicals ElectrumX
[`8df23747`](https://github.com/atomicals/atomicals-electrumx/commit/8df23747835c20230fc8b8097d469e7a1d97c3e0),
released as v1.5.2.0 on 2025-03-27.

That revision is preserved as a stable historical baseline. It is not silently rewritten when a
Universe service upgrades. Universe implementation revisions are listed separately, per page, in
the source panel.

If two implementations at different revisions read the same transaction differently, that is a
version difference, not a bug in one of them. Investigate the revision and activation state
before deciding which answer to trust. Never resolve a disagreement by majority vote.

## 3. The documentation version

This site publishes documentation version **2026.08**. Each page states the version it describes
in its source panel. See [versions and compatibility](/releases/versions/) for the full
matrix, and [releases](/releases/) for what changed.

## How to pin your own integration

1. Choose an Atomicals validator revision or release, and record it.
2. Record the network and its active rule set.
3. Record the Universe service revision if you consume our APIs. Every service exposes it on
   `GET /version`.
4. Re-run the [conformance vectors](/reference/conformance/) against that exact combination.
5. Re-check before every upgrade, not after.

## What "activation" means here

An activation boundary is a block height or configuration flag that turns a validation rule on.
Before the boundary the old interpretation applies. After it the new one does. A transaction is
judged by the rules active at its own height, not by today's rules.

Pages that describe activation-sensitive behavior show the boundary in the source panel under
**Activation boundary**. See [activation boundaries](/protocol/core/activation-boundaries/).
