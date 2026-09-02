---
title: Metadata and media
description: How an NFT carries files, what a digest guarantees, and the rules a renderer must follow to serve hostile content safely.
sidebar:
  order: 3
provenance:
  pageId: protocol/nft/metadata-and-media
  area: protocol
  audience: [developer, creator]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: universe-index-atomicals-nfts-and-realms
      path: server
  verified: '2026-08-31'
  tags: [media, metadata, security]
  limitations:
    - A digest proves byte integrity only. It says nothing about rights, originality, or whether the content is safe to render.
---

## What is stored

An NFT payload can contain named files. Each declares a content type and carries raw bytes. A
validator records a digest per file so a consumer can verify what it received.

Metadata fields such as `name`, `desc`, `image`, `links`, and `legal` sit alongside. All of it is
supplied by the minter and none of it is checked.

## Media selection

When several files exist, a renderer must choose one to display. Choose deterministically:

1. Prefer an explicitly named primary field if the payload declares one.
2. Otherwise prefer the first file whose sniffed type is in your render allowlist.
3. Otherwise render nothing and say so.

Never choose based on the declared content type alone, and never fall back silently to a
placeholder that looks like real content.

## Content type safety

| Rule | Reason |
| --- | --- |
| Sniff the type from the bytes | The declared type is attacker controlled |
| Serve only an allowlist of types | An unknown type is an unbounded risk |
| Enforce a size limit before decoding | Decompression and decoding are attack surfaces |
| Serve from an isolated origin | So content cannot reach your session |
| Send a restrictive content security policy | So embedded script cannot execute |
| Never inline payload bytes into your document | Same reason |
| Verify the digest before serving | So a substitution is detected |

The Universe NFT and Realm read model applies MIME restrictions, size limits, and digest
validation on its media route. See
[NFT and Realm API](/reference/api/atomicals-nfts-realms/).

## Integrity and derivatives

Preserve exact original bytes permanently. Optimised files, thumbnails, and responsive sizes are
derivatives, stored separately and content addressed by hash so identical bytes are stored once.

A derivative must never be served as if it were the original when a caller asked for the original.

## Displaying text safely

Escape everything. Names, descriptions, and link labels are arbitrary strings and can contain
markup, control characters, bidirectional overrides, and confusable glyphs. See
[Unicode and IDNA](/protocol/realms/unicode-and-idna/).

