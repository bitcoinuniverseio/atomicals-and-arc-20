# Source of truth

The authority order every technical statement follows, and how to resolve two sources that disagree.

Page ID: develop/source-of-truth
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/source-of-truth/

---
## The order

1. Executed source code, conformance tests, generated route inventories, schemas, deployment
   manifests, and runtime contracts, at an exact revision.
2. Final or Living Atomicals Improvement Proposals applicable to the feature.
3. The official Atomicals reference implementation or released validator, at an exact commit or
   release.
4. Official Atomicals protocol and CLI documentation.
5. Universe implementation documentation, at an exact revision.
6. Third-party integrations, always identified as third-party and non-normative.

Explanatory prose is never independent consensus, including this documentation.

## What that means in practice

| Question | Answered by |
| --- | --- |
| What does this transaction do? | The validator revision you run, at that height |
| Is this rule active? | The activation condition for your network |
| What does this API return? | The service contract at its deployed revision |
| Is this proposal implemented? | Implementation evidence, never the proposal itself |
| Does this product support it? | The product's own statement, dated |

## Resolving a disagreement

Do not vote. Check, in order:

1. Same network?
2. Same chain position, or is one behind?
3. Same validator revision?
4. Is the behavior activation sensitive at that height?
5. Same projection?

Only when all five match does a disagreement mean one source is wrong. Until then it is a
version, position, or scope difference.

## For anything with value at stake

Compare more than one compatible source, and treat any disagreement as a hold rather than a
tie-break. Record the revision and generation of each answer so the difference can be explained
afterwards.

## What this documentation does

Every source-sensitive page carries a source panel with the repository, the exact revision, the
path, the applicable networks, the last verified date, and the known limitations. Where evidence
is missing, the page says so rather than guessing.

See [networks and versions](/start/networks-and-versions/).
