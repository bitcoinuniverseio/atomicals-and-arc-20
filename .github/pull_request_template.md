## What this changes

<!-- One or two sentences. What is different after this merges. -->

## Which layer this touches

<!-- Tick every one that applies. The distinction is the point of this repository. -->

- [ ] Protocol behavior, at a pinned validator revision
- [ ] Universe implementation, at a pinned service revision
- [ ] Proposed or experimental material
- [ ] Editorial only, with no source-sensitive claim
- [ ] Contracts, schemas, or conformance material
- [ ] Tooling, tests, or CI

## Source evidence

<!--
For any source-sensitive change, name the repository, the exact revision, and the
file and line range that establishes it. "It is documented elsewhere" is not evidence.
-->

## Checks

- [ ] `npm run generate` leaves the repository clean
- [ ] `npm test` passes
- [ ] `npm run build` passes and the committed output is up to date
- [ ] Every new claim states which layer it describes
- [ ] Every new page or changed page has a current `verified` date
- [ ] Any new limitation is recorded in the page's `limitations`
- [ ] No credential, hostname, or operator-only material was added

## Translations

- [ ] No required localised page was removed
- [ ] Code blocks and identifiers are identical to the English source
- [ ] `translationSourceHash` was updated where the English source changed

## Anything a reviewer should look at first

<!-- The part you are least sure about. -->
