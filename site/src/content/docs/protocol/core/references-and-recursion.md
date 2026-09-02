---
title: References and recursion
description: How one Atomical points at another, why recursive rendering needs an archive, and the failure modes of a broken reference.
sidebar:
  order: 7
provenance:
  pageId: protocol/core/references-and-recursion
  area: protocol
  audience: [developer, creator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
  verified: '2026-08-31'
  tags: [references, recursion, rendering]
  limitations:
    - Recursive rendering depends on the renderer resolving every dependency. A renderer that cannot reach a dependency produces a different result from one that can, without either being wrong about the chain data.
---

An Atomical payload can reference another Atomical instead of embedding the same bytes again. A
collection of a thousand items can share one script, one font, and one palette, and each item can
carry only what makes it different.

## Why references exist

| Without references | With references |
| --- | --- |
| Every item embeds every byte | Shared bytes are stored once |
| Reveal fees scale with total content | Reveal fees scale with what is unique |
| Updating shared logic is impossible | The shared object has its own history |

## How a reference resolves

1. The payload names a target, usually by compact Atomical ID.
2. A renderer resolves that identifier to the target's stored payload.
3. The target may itself reference further Atomicals, so resolution is recursive.
4. The renderer composes the final output from the resolved set.

The `set-relation` command records a relation between Atomicals. See the
[CLI reference](/reference/cli/).

## Failure modes

**Unresolvable dependency.** The renderer cannot reach the target. The item renders differently or
not at all. The chain data did not change.

**Depth or cycle.** A reference chain that is too deep, or that loops, must be bounded by the
renderer. Treat a cycle as a rendering failure, never as an infinite loop.

**Mutable target.** If the referenced object is not sealed, its owner can change what every
referring item renders. Check the sealed flag before treating a reference as stable.

**Silent substitution.** A renderer that falls back to a placeholder without saying so produces a
wrong picture that looks fine. Fail visibly instead.

## Practical guidance

- Seal shared dependencies before minting items against them.
- Archive the complete resolved dependency set so an item can be re-rendered later without a live
  index.
- Cache deterministically by content hash so unchanged content is never fetched or rendered twice.
- Record which revision resolved each dependency, so a difference later can be explained.

