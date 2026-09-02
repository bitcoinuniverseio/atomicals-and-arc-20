# ARC-20 allocation visualizer

Model a transaction and see exactly which output receives which units, and what burns, before you build anything.

Page ID: tools/allocation-visualizer
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/allocation-visualizer/

---
## How to use it

1. Start from a preset, or enter your own coloured inputs.
2. Enter the outputs in the exact order your transaction will have them, in satoshis.
3. Read the burn figure. It should be zero.
4. Add the fee inputs and the cardinal change output, then read it again.
5. Only build the transaction once the figure is still zero.

Step four is where wallet-added change silently changes the result.

The presets are the executed [conformance vectors](/reference/conformance/), and the computation
is `conformance/allocation.mjs`, the same module `tests/conformance-allocation.test.mjs` calls. The
tool and the tests cannot disagree.

## What it models

| Modelled | Not modelled |
| --- | --- |
| Normal allocation, exactly as the pinned builder performs it | Live chain state |
| The output zero fallback when a plan is not clean | Whether an output is actually coloured today |
| Unspendable outputs, skipped without consuming value | Whether your wallet will reorder outputs |
| Activation gated custom coloring | Whether custom coloring is active on your network |
| The no-inflation rule | Anything on the non-fungible branch |

## Copy as a vector

The copy control produces a JSON object in the same shape as the committed vector set. If you find
a case this documentation should cover, that object is what to attach to an issue.

See [conformance vectors](/contribute/conformance-vectors/).
