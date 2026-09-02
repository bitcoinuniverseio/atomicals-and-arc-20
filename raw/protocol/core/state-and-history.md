# State, history, and updates

How mutable state works on an Atomical, what history records, and what sealing permanently changes.

Page ID: protocol/core/state-and-history
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/state-and-history/

---
An Atomical is not frozen at mint. The owner can apply operations that change recorded state, and
every one of those is kept in an ordered history.

## State

State is the accumulated result of `mod` operations applied by the owner. It is a structured
document, not a single value. Readers should treat it the way they treat mint metadata: supplied
by whoever controlled the object at that moment, and unverified.

Relevant commands from the generated CLI inventory:

| Command | Purpose |
| --- | --- |
| `set` | Write state |
| `state` | Read current state |
| `state-history` | Read ordered state changes |
| `delete` | Remove a state path |
| `set-relation` | Write a relation between Atomicals |
| `emit` | Record an event |
| `seal` | Refuse further changes, permanently |

See the [CLI reference](/reference/cli/) for exact signatures at the pinned revision.

## History

History is every operation applied to the object, in order, with the transaction and height that
carried it. It is the audit trail a consumer should read before trusting current state, because
current state alone does not show who changed what or when.

## Sealing

Sealing makes an Atomical refuse further updates. After a seal:

- state can no longer change;
- a Container manifest can no longer be edited;
- the object can still be transferred.

Sealing is permanent. There is no unseal. For collections, sealing the DMINT manifest is what
makes item verification meaningful, because the rules cannot be rewritten after items start
minting. See [sealing and rules](/protocol/containers/sealing-and-rules/).

## Reading state safely

1. Read the Atomical ID, not the display name.
2. Read history, not only current state.
3. Check the sealed flag before deciding whether state is stable.
4. Record the generation and source revision your answer came from.
5. Re-read after a reorg. See [confirmation and reorgs](/protocol/core/confirmation-and-reorgs/).
