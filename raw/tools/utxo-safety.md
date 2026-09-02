# UTXO Safety Planner

Classify asset-bearing UTXOs, see the risks, and generate deterministic candidate plans before you construct a transaction.

Page ID: tools/utxo-safety
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet, testnet, signet, regtest
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/utxo-safety/

---
Most permanent ARC-20 losses happen when an ordinary wallet sweeps coloured satoshis into fees or
change. This planner exists so you can see exactly which outputs carry assets, which moves burn
them, and which candidate plans preserve them, before anything is ever signed.

## What the planner checks

Every candidate plan is examined for the classic loss patterns: accidental asset burns, mixed
token inputs, unknown assignment state, insufficient asset change, unsafe output ordering, dust,
fees that cannot cover the virtual size, unconfirmed input chains, and reused change addresses.
Each warning links to the rule page and the pinned source revision behind it.

Unknown stays unknown: an output with no assignment data is classified as unknown with no
confidence, and the planner refuses to call it safe.

## Comparing plans

Plans are compared on asset safety, fee, input count, and privacy impact side by side. There is
no single score, because collapsing those axes into a number hides exactly the trade-offs you
need to see.

## Exports

Export the plan as JSON, as a Protocol Lab scenario to replay its effects, or as a CLI command
sequence to run against your own setup. When fields for a structurally valid unsigned PSBT are
missing, the planner exports an explicit transaction intent and names what is missing instead of
fabricating values.
