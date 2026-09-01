# Atomicals protocol

One page that puts every Atomicals primitive, operation, and validation boundary in relation to each other.

Page ID: protocol/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/overview/

---
The Atomicals specification is defined in code. The official guide says so directly. Everything
below describes what the pinned reference revision does, not what a standard document declares.

Concepts are stable. Exact validation is version sensitive. Pin a revision, record the network,
and re-test on every upgrade. See [networks and versions](/start/networks-and-versions/).

## The pipeline every operation follows

1. A builder constructs a commit transaction paying to a Taproot output that commits to a script
   containing the envelope.
2. A reveal transaction spends that output and exposes the envelope in its witness.
3. A validator reads `atom`, the operation code, and the CBOR payload.
4. The validator checks the operation against the rules active at that block height on that
   network.
5. On success it assigns the result, usually to output zero for a mint.
6. Transfers of existing Atomicals are decided by allocation over the transaction's inputs and
   outputs.

## Where each rule lives

| Question | Decided by | Read |
| --- | --- | --- |
| Is this envelope well formed? | Mint parser | [Envelope and operations](/protocol/core/envelope-and-operations/) |
| Is this ticker name legal? | Ticker rule at the active revision | [Tickers and candidates](/protocol/arc20/tickers-and-candidates/) |
| Does this claim satisfy Bitwork? | Bitwork check | [Bitwork](/protocol/core/bitwork/) |
| Which output gets the value? | Blueprint builder allocation | [Allocation](/protocol/arc20/allocation/) |
| Did anything burn? | Allocation remainder handling | [Burns](/protocol/arc20/burns/) |
| Can this create value from nothing? | No-inflation validation | [Allocation](/protocol/arc20/allocation/) |
| Is this rule active yet? | Per-network activation table | [Activation boundaries](/protocol/core/activation-boundaries/) |

## Read next
