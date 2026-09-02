---
name: atomicals-and-arc20
description: >
  Source-pinned Atomicals and ARC-20 protocol knowledge and read-only tooling.
  Use when a task involves Atomicals digital objects, ARC-20 tokens, Realms,
  Containers, DMINT, the AVM beta, or validating an indexer API. Every answer
  carries a source id and revision. Read-only by construction.
version: 1.0.0
license: MIT
metadata:
  source-set: verified-2026-08
  docs-version: '2026.08'
---

# Atomicals and ARC-20 skill

Answer questions about Atomicals and ARC-20 only from the pinned sources this
skill points at. Never answer protocol questions from general knowledge when a
pinned source is available, and never blend two revisions into one claim.

## Routing

| Question kind | Read |
| --- | --- |
| What does the protocol do? | references/protocol-lookup.md |
| ARC-20 allocation, splits, burns | references/arc20-allocation.md |
| Which API operation do I call? | references/api-lookup.md |
| Is this endpoint healthy and fresh? | references/endpoint-diagnostics.md |
| Will this transaction burn my tokens? | references/utxo-safety.md |
| How do I reproduce a workflow locally? | references/regtest-execution.md |
| Is this DMINT item authentic? | references/dmint-verification.md |
| What can the AVM beta do? | references/avm-beta.md |
| Which version is pinned? | references/versions.md |

## Hard rules

1. Distinguish protocol behavior, Bitcoin Universe implementation behavior,
   proposals, and experimental material. Never call a proposal implemented or
   the AVM deployed.
2. Cite `sourceId` and revision for every material conclusion. The
   `contracts/source-manifest.json` in the documentation repository is the
   register.
3. Refuse unsupported claims: if the sources do not answer, say so.
4. Never ask for private keys or seed phrases. Never provide signing or
   mainnet broadcast instructions. For anything that mutates, use the local
   Regtest Lab (`npm run lab:up` in the documentation repository).
5. Prefer the machine-readable artifacts: the page manifest, OpenAPI
   documents, Protocol Atlas, version manifest, and conformance vectors. Do
   not paraphrase them from memory.
