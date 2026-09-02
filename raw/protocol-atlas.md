# Protocol Atlas

An evidence-backed, interactive comparison of Bitcoin token and digital-object protocols, with every fact pinned to a source revision.

Page ID: protocol-atlas
Applicability: editorial
Authority: none
Networks: mainnet
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol-atlas/

---
No prices. No market data. No rankings. No claim that any protocol is superior. Every cell is an
evidence object with a status and a pinned revision: where evidence is missing, the cell says
unknown instead of guessing.

The Protocol Atlas compares Atomicals, ARC-20, AVM, Ordinals, Runes, BRC-20, Bitcoin Stamps and
SRC-20, TAP, Alkanes and Protorunes, Counterparty, and RGB. The dataset behind every view is
[machine-readable](../../contracts/protocol-atlas/atlas.json) and validated against a published
JSON Schema, so the page, the exports, and the MCP resources all describe the same evidence.

Four views cover one dataset:

1. **Matrix.** Column selection, search, status filters, compact or detailed cells, comparison of
   up to four protocols side by side, and CSV or JSON export. The state is shareable through the
   URL.
2. **Relationship map.** Which shared Bitcoin primitive each protocol builds on, with a table
   equivalent. Edges never imply lineage that a pinned source does not support.
3. **Timeline.** Activation points the sources support. The AVM marker is a pinned beta
   interpreter, deliberately not drawn as a deployment.
4. **Decision explorer.** Concrete neutral questions about your requirements, answered with a
   transparent match and miss list per protocol. It compares; it does not recommend.

## How evidence works here

Every fact in the dataset carries `value`, `status`, `sourceId`, `sourceRevision`, `verifiedAt`,
and optional notes. Statuses are `verified`, `implementation-specific`, `proposal`,
`experimental`, `unknown`, and `conflicting`. Cell rendering shows unknown and conflicting
exactly as recorded. The [source manifest](sources/) holds the pinned repositories and revisions.

Where this page and a protocol's own documentation disagree, the disagreement is recorded as a
status rather than resolved by an editor.
