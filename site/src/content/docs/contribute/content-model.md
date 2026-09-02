---
title: Content model
description: Every frontmatter field, what it means, and what CI requires of it.
sidebar:
  order: 2
provenance:
  pageId: contribute/content-model
  area: contribute
  audience: [developer]
  applicability: editorial
  authority: none
  networks: [none]
  verified: '2026-08-31'
  tags: [contributing, metadata]
---

Every page carries a `provenance` block. It is validated by the content schema, and it drives the
panel readers see. Nothing in the panel is hand written next to the content.

## Required fields

| Field | Meaning |
| --- | --- |
| `pageId` | Stable identity. Never reused, never renamed without a redirect |
| `area` | One of start, protocol, guides, develop, reference, tools, ecosystem, releases, contribute |
| `audience` | Who the page is for. At least one value |
| `applicability` | Which layer the page describes. See below |
| `authority` | What kind of source establishes it |
| `networks` | Which networks the page applies to. At least one |
| `verified` | The date the content was last checked, as an ISO date |

## Optional fields

| Field | Use |
| --- | --- |
| `sources` | Entries from the source manifest, with an optional path key and note |
| `docsVersion` | The documentation version. Defaults to the current one |
| `activation` | The activation boundary, when the behavior has one |
| `owner` and `reviewers` | Ownership |
| `tags` | Grouping |
| `limitations` | Known limitations, shown in the panel |
| `deprecated` | Since, reason, replacement, and sunset |
| `translationSourceHash` | On a translation only. The hash of the English source it was made from |
| `hideProvenance` | For purely navigational pages with no source-sensitive claim |

## Applicability values

| Value | Use when the page describes |
| --- | --- |
| `protocol-behavior` | The Atomicals protocol at a pinned revision |
| `universe-implementation` | What a Universe service actually does today |
| `experimental` | Beta or unreleased behavior |
| `proposed` | A proposal, with nothing implemented by virtue of existing |
| `deprecated` | Something still reachable but scheduled for removal |
| `unavailable` | A capability no Universe surface exposes |
| `third-party` | Material operated by someone else, non-normative |
| `editorial` | Navigation or explanation with no source-sensitive claim |

Choosing `protocol-behavior` for something a Universe service does, or the reverse, is the most
serious content error possible here. It is the failure this whole system exists to prevent.

## Authority values

| Value | Meaning |
| --- | --- |
| `executed-source` | Backed by executed code or tests at a pinned revision |
| `aip` | An Atomicals Improvement Proposal |
| `reference-implementation` | The Atomicals reference implementation |
| `official-documentation` | Official Atomicals documentation |
| `universe-implementation` | Universe implementation documentation |
| `third-party` | Non-normative third-party material |
| `none` | No normative source. Navigation only |

## Rules CI enforces

1. Every `sources` entry names an id that exists in `contracts/source-manifest.json`.
2. Every `verified` date is a valid ISO date, and a date older than 180 days is flagged in the
   panel.
3. Every `pageId` is unique across the site.
4. A translated page must carry `translationSourceHash`.
5. Every required localised page exists in every configured locale.
6. Code blocks and identifiers must be identical between a translation and its English source.

## Writing rules

- Say which layer a statement describes, always.
- Pin a source revision for anything version sensitive.
- State a limitation rather than omitting it.
- Never call a proposal implemented.
- Never present metadata as authenticity, a ticker as identity, or a listing as ownership.
- No price talk, rankings, investment, legal, or tax advice.
- Never use the words guaranteed, risk-free, backed, collateralised, price floor, or redemption as
  claims.

