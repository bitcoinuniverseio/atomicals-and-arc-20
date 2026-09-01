---
title: Metadata and decimals
description: Optional metadata fields, how to treat them, and the exact rule about decimals that prevents an entire class of accounting bug.
sidebar:
  order: 9
provenance:
  pageId: protocol/arc20/metadata-and-decimals
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-guide
      path: arc20
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
  verified: '2026-08-31'
  tags: [metadata, decimals]
---

ARC-20 metadata is an optional JSON object supplied by the minter. Common fields are `name`,
`desc`, `image`, `decimals`, `links`, and `legal`.

## Treat all of it as untrusted

Metadata is arbitrary content written by whoever minted the token. It is never checked. See
[metadata trust boundaries](/protocol/core/metadata-trust/) for the renderer and interface rules.

| Field | What it does | What it proves |
| --- | --- | --- |
| `name` | A display label | Nothing |
| `desc` | A description | Nothing |
| `image` | A media reference | Nothing about rights or origin |
| `links` | Social or site links | Nothing about affiliation |
| `legal` | Legal text | Nothing enforceable is created by writing it |
| `decimals` | Display formatting | Nothing about the unit model |

## The decimals rule

**`decimals` is presentation metadata. It never creates sub-satoshi units.**

Native ARC-20 quantities are integers, always. A token with `decimals` of 8 and 100 000 000 native
units may be displayed as 1.00000000. On chain there are 100 000 000 coloured satoshis.

### The bug this prevents

A product reads `decimals` of 8, divides every native quantity by 100 000 000 for display, and
then feeds a formatted figure back into a transfer builder. The builder now asks for a fraction of
a satoshi, or rounds to something the user did not intend.

### The rule that prevents it

1. Store and compute in native integer units only.
2. Format for display at the last moment, in the view layer.
3. Never parse a formatted figure back into a quantity.
4. Never let a formatted figure reach a transaction builder.
5. Treat a missing `decimals` as zero, not as a default of eight.

## Sanitisation

Before displaying any metadata field:

- escape it, always;
- strip or refuse markup;
- validate that link targets are absolute HTTP or HTTPS URLs;
- mark external links as external and do not follow them automatically;
- check the name for confusable characters against tokens the user already holds.
