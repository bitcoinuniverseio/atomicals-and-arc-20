# Conformance vectors

How to add an executed case that the prose, the tools, and the tests all share.

Page ID: contribute/conformance-vectors
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/conformance-vectors/

---
## The rule

A vector is evidence only if it is executed. This documentation never publishes an unexecuted
vector as conformance material.

## Where the pieces live

| Piece | Path |
| --- | --- |
| Engine | `conformance/allocation.mjs` |
| Vectors | `conformance/vectors/arc20-allocation.json` |
| Tests | `tests/conformance-allocation.test.mjs` |
| Rendered table | `site/src/components/VectorTable.astro` |

The prose, the [allocation visualizer](/tools/allocation-visualizer/), and the tests all call the
same engine, so they cannot disagree.

## Adding a case

1. Derive it from the source. Name the exact functions and lines it comes from.
2. Add it to the vector file with an `id`, a `title`, a `description`, `options`, `inputs`,
   `outputs`, and `expected`.
3. Run `node --test tests/conformance-allocation.test.mjs`.
4. If it fails, decide which is wrong: your expectation, or the engine. If the engine is wrong
   against the source, fix the engine and say so in the pull request.
5. Reference the case from the relevant page with ``.

## Changing the engine

The engine is implemented directly from the pinned reference revision. Changing it is a change to
what this documentation claims the protocol does.

A pull request that changes it must:

- name the exact source functions and lines the change follows;
- keep every existing vector passing, or explain precisely why one changed;
- update the source manifest if the pinned revision moved.

## What not to add

- A case whose expectation you assumed rather than derived.
- A case that needs a live chain or a live service. Document it as an expectation on the
  [conformance page](/reference/conformance/) instead, in the coverage table.
- A case copied from another repository's vector set. Link that set rather than duplicating it.
