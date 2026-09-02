---
title: Ecosystem records
description: What evidence a record needs before it is merged, and why a missing record is better than a guessed one.
sidebar:
  order: 6
provenance:
  pageId: contribute/ecosystem-records
  area: contribute
  audience: [developer]
  applicability: editorial
  authority: none
  networks: [none]
  verified: '2026-08-31'
  tags: [contributing, ecosystem]
---

## The evidence rule

A record's availability state comes from a reachable source, checked on a date. Nothing else
counts.

| Not evidence | Why |
| --- | --- |
| Another directory lists it | That directory has the same problem |
| It was active last year | Last year is not now |
| A social media post | Not a reachable source for a service state |
| It looks abandoned | Looking abandoned is not evidence of anything |
| A request timed out | That produces `unreachable`, nothing stronger |

## Required fields

| Field | Notes |
| --- | --- |
| `id` | Stable, kebab case |
| `name` | As the operator writes it |
| `category` | One of the registry categories |
| `official` | True only for Atomicals project resources |
| `operator` | Who runs it |
| `supports` | Which Atomicals products |
| `networks` | Which networks |
| `custody` | self-custody, custodial, non-custodial-service, or not-applicable |
| `repository` and `url` | Where verifiable. Null where not |
| `availability` | One of the declared states |
| `evidence` | What established the state, specifically |
| `lastVerified` | The date it was checked |
| `securityNotes` | What a reader should know before using it |
| `deprecation` | Null, or the operator's own statement |

## The states

`verified-active`, `degraded`, `unreachable`, `deprecated`, `closed`, `unknown`. Their exact
meanings are on the [registry](/ecosystem/).

Three rules:

1. A network failure produces `unreachable`, never `deprecated` or `closed`.
2. Conflicting evidence produces `unverified`, never a guess.
3. Only an operator's own reachable statement produces `deprecated` or `closed`.

## Why a gap is acceptable

The registry currently has no individual third-party marketplace or explorer records, because none
were checked against a reachable source during the review. That gap is stated on the page.

A guessed record is worse than a missing one, because a reader acts on it.

## Adding a record

Open a pull request adding the entry to `contracts/ecosystem.json`, with the evidence and the date.
CI validates the shape. A human checks the evidence.

## No endorsement

Listing is not endorsement. A `securityNotes` field is required, and it should say what a reader
needs to know, including custody and any known limitation.

