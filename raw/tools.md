# Tools

Local, read-only tools that model Atomicals behavior without ever signing, broadcasting, or sending your data anywhere.

Page ID: tools/index
Applicability: editorial
Authority: none
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/

---
It runs in your browser. It never signs, never broadcasts, never asks for key material, and never
sends what you paste to any service. Where a tool cannot determine something, it says unknown
rather than guessing.

## Why they are local

Anything you paste into a transaction tool is sensitive. An outpoint list reveals what you hold.
A PSBT reveals what you are about to do. Sending either to a service to be analysed creates a
record you did not need to create.

So these tools parse in the page. There is no upload, no analytics on the content, and no request
made on your behalf.

## What they are not

They are explanatory. They are not the active validator, and they do not replace validating a
concrete transaction against the validator revision your counterparties run.

The allocation visualizer is the closest to authoritative, because it runs the same engine as the
[conformance vectors](/reference/conformance/) and the test suite. Even so, it models normal
allocation from one pinned revision, not the live network you are about to broadcast to.
