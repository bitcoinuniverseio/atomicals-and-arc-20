# Conformance vectors

The deterministic cases that back the prose, the interactive tools, and the tests, all executed from one engine.

Page ID: reference/conformance
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/conformance/

---
## One engine, three consumers

The prose, the [allocation visualizer](/tools/allocation-visualizer/), and the test suite all call
the same function. They cannot disagree, because there is only one implementation.

| Artefact | Path |
| --- | --- |
| Engine | `conformance/allocation.mjs` |
| Vectors | `conformance/vectors/arc20-allocation.json` |
| Tests | `tests/conformance-allocation.test.mjs` |

The engine is implemented directly from `assign_expected_outputs_basic`,
`calculate_outputs_to_color_for_ft_atomical_ids`, and
`AtomicalsTransferBlueprintBuilder.color_ft_atomicals_regular` at the pinned revision.

## Executed allocation vectors

Every row below is computed at build time by that engine.

## What each vector proves

| Case | Proves |
| --- | --- |
| `clean-split` | An exactly covered output set places everything with no burn |
| `oversized-next-output` | An output larger than the remaining value stops the walk and burns the remainder |
| `exact-single-output` | A single output equal to the value takes everything |
| `first-output-too-large` | Nothing can be placed at all, so the whole lot burns |
| `too-few-outputs` | Running out of outputs burns what is left |
| `unspendable-output-skipped` | An unspendable output is passed over and consumes nothing |
| `combine-two-lots` | Two inputs of the same token are summed before allocation |
| `two-tokens-sequential-slots` | A second token starts after the last slot the first used |
| `two-tokens-non-clean-fallback` | A non-clean plan restarts every token from output zero |
| `dust-remainder-burns` | A correctly sized change output places the remainder cleanly |
| `change-output-too-large` | The same intent with a larger change output destroys the remainder |
| `custom-coloring-partial-fill` | Activation gated custom coloring fills the last output partially instead of burning |

## The no-inflation property

A separate test asserts, across every vector, that coloured output totals never exceed coloured
input totals. That is the one rule no output arrangement can work around.

## Coverage the vectors do not claim

This documentation does not publish unexecuted vectors as evidence. The following behaviors are
documented as expectations, with their source, rather than presented as executed conformance
material:

| Behavior | Where it is documented | Why it is not an executed vector here |
| --- | --- | --- |
| Direct FT issuance, DFT deployment, DMT claim validity | [ARC-20](/protocol/arc20/overview/) | Validity depends on chain height, quota state, and Bitwork at execution time |
| NFT normal transfer, swap, splat | [NFT transfers](/protocol/nft/transfers/) | Requires the non-fungible allocation branch against a live provider |
| Container and DMINT verification | [Item verification](/protocol/containers/item-verification/) | Requires a sealed manifest and a live provider |
| Realm candidate and winner resolution | [Candidates and winners](/protocol/core/candidates-and-winners/) | Resolution is computed at a chain position |
| Unicode and IDNA behavior | [Unicode and IDNA](/protocol/realms/unicode-and-idna/) | Enforced by the runtime, surfaced through its explicit errors |
| Marketplace listing, reservation, purchase, settlement, replay, stale ownership, mixed collateral | [Marketplace v1](/reference/api/marketplace-v1/) | Enforced by the authority against Bitcoin Core and the Atomicals provider, and covered by that repository's own suite |
| Media digest validation, reorg generation behavior, signed cursor validation | [NFT and Realm API](/reference/api/atomicals-nfts-realms/) | Enforced by the runtime and covered by that repository's own suite |
| Ordex purchase and burn vectors | [Ordex](/reference/api/ordex/) | Published and executed in the Ordex repository. Copying them here would create a second version that can drift |

Stating this plainly is the point. A vector that was never executed is not evidence.

## Adding a vector

See [conformance vectors](/contribute/conformance-vectors/). A new case must name the source lines
it derives from, and it must pass before it is committed.
