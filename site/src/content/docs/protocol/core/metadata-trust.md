---
title: Metadata trust boundaries
description: Everything in a payload is attacker controlled. This page says exactly what that means for a renderer, an indexer, and a user interface.
sidebar:
  order: 14
provenance:
  pageId: protocol/core/metadata-trust
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: mintParser
    - id: universe-index-atomicals-nfts-and-realms
      path: server
  verified: '2026-08-31'
  tags: [security, metadata]
---

Anyone can mint an Atomical containing any bytes with any declared type and any claimed name.
Nothing in a payload is checked by anyone before it reaches your screen.

## What a payload can claim, and what it proves

| The payload says | It proves |
| --- | --- |
| `name` is a well known brand | Nothing |
| `image` is a famous artwork | Nothing |
| `legal` grants you rights | Nothing |
| `links` point to an official site | Nothing |
| The content type is an image | Nothing. Verify the bytes |
| The ticker matches a project | Only that a name was allocated to some Atomical |

## Rules for a renderer

1. Choose the content type yourself from the bytes. Do not trust the declared type.
2. Restrict the set of types you will render at all.
3. Enforce a size limit before decoding.
4. Serve media from an isolated origin with a restrictive content security policy.
5. Never inline payload content into your own document.
6. Sanitise any text before display, including names, descriptions, and link labels.
7. Verify the digest before serving.

## Rules for a user interface

1. Show the resolved Atomical ID next to every name.
2. Mark unresolved name requests as candidates.
3. Never present metadata as verification.
4. Warn when a displayed name is visually confusable with another.
   See [Unicode and IDNA](/protocol/realms/unicode-and-idna/).
5. Show the data source, its revision, and its freshness.

## Rules for an indexer

1. Bound payload size and nesting depth before parsing.
2. Reject or quarantine payloads that fail to parse rather than partially applying them.
3. Record the digest of every stored file.
4. Keep the raw bytes exactly as revealed. Optimised derivatives are separate artefacts.
5. Never let payload content influence routing, authentication, or storage paths.
