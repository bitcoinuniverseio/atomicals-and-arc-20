# Permanent file storage

How Atomicals stores bytes on Bitcoin, what a digest proves, and the limits of treating a chain as a file system.

Page ID: protocol/core/permanent-storage
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/permanent-storage/

---
Atomicals can carry files directly in the reveal witness. The bytes live in a Bitcoin block, so
they persist for as long as the chain does.

## What is stored

- One or more named files.
- A declared content type per file.
- The raw bytes, as a CBOR binary string.
- A digest recorded by the validator.

Relevant CLI commands from the generated inventory: `store-file`, `dat`, and `download`.

## What a digest proves and does not prove

A digest proves the bytes you received match the bytes that were revealed. That is integrity.

It does not prove:

- that the content is original, licensed, or authorised;
- that the declared content type is honest;
- that the file is safe to render;
- that a service currently serving it has not substituted a derivative.

Treat every stored file as hostile input. See [metadata trust](/protocol/core/metadata-trust/).

## Cost

Reveal fees scale with witness size. A large file makes the reveal transaction large, and the
fee follows. Three ways to reduce it:

1. Reference shared bytes instead of duplicating them. See
   [references and recursion](/protocol/core/references-and-recursion/).
2. Store a compact source such as optimised SVG rather than a raster image.
3. Store the minimum that must be permanent, and derive the rest.

## Serving stored files

A read service that exposes stored media should:

- restrict the content types it will serve;
- enforce a size limit;
- verify the digest before serving;
- serve with a content type it chose, not one the payload asserted;
- send immutable cache headers for content-addressed responses;
- never execute or inline the content into its own origin.

The Universe NFT and Realm read model applies these rules. See
[NFT and Realm API](/reference/api/atomicals-nfts-realms/).
