# Protocol Lab

Construct and replay Atomicals workflows deterministically in the browser, with no keys, no signing, and no network.

Page ID: tools/protocol-lab
Applicability: protocol-behavior
Authority: executed-source
Networks: regtest, testnet, signet, mainnet
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/protocol-lab/

---
The lab replays protocol rules deterministically so you can see why units land where they land.
It never asks for keys, never signs, and never broadcasts. Every identifier it generates is
synthetic, derived from the scenario seed, and starts with "sim".

Pick a guided scenario, watch each step apply the shared rules, and click a rule to open the
exact page that explains it. The same allocation module executes the conformance vectors, powers
the [allocation visualizer](/tools/allocation-visualizer/), so the lab cannot disagree with them.

## What the scenarios cover

- Commit and reveal for NFTs, Realms, and ARC-20 deployments and mints.
- ARC-20 transfer, split, and merge through the reference allocation engine.
- Intentional burns to unspendable outputs, and the accidental burn pattern that destroys units.
- Confirmation progression and a one-block reorganization that unsettles confirmed state.
- An invalid operation the engine refuses instead of inventing money.

## Share and export

Every scenario is data. Copy a shareable link for a small scenario, or export the scenario JSON
and the execution trace as files. Large scenarios stay local by design: nothing is ever uploaded
anywhere.

## Where the rules come from

The engine lives in `packages/protocol-lab` and calls the allocation engine in
`packages/protocol-core`, which is the exact module the conformance vectors execute at the pinned
reference revision. Each trace entry names the rule it evaluated and the outcome.
